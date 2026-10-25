// Web Push & Browser Notifications Service for Our Space

// Synthesize a gentle romantic chime using Web Audio API (no external file needed)
export function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Notes: C5 (523.25Hz) -> E5 (659.25Hz) -> G5 (783.99Hz)
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.5);
    });
  } catch (e) {
    // AudioContext blocked or unsupported
  }
}

// Check notification support
export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (err) {
    console.warn('Service Worker registration failed:', err);
    return null;
  }
}

// Request permission from the user
export async function requestNotificationPermission(): Promise<{ granted: boolean; permission: NotificationPermission | 'unsupported' }> {
  if (!isNotificationSupported()) {
    return { granted: false, permission: 'unsupported' };
  }

  try {
    await registerServiceWorker();
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';

    if (granted) {
      playNotificationChime();
      await sendLoveNotification('Our Space 💕', {
        body: 'Notifications active! You will now receive love alerts & notes here ✨',
        tag: 'welcome-alert',
      });
    }

    return { granted, permission };
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return { granted: false, permission: Notification.permission };
  }
}

// Send notification to phone/desktop
export async function sendLoveNotification(
  title: string,
  options?: {
    body?: string;
    url?: string;
    tag?: string;
    renotify?: boolean;
    silent?: boolean;
  }
) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  // Play chime
  if (!options?.silent) {
    playNotificationChime();
  }

  // Vibrate mobile device
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate([150, 80, 150]);
    }
  } catch { /* ignore */ }

  const notifOptions: any = {
    body: options?.body || '',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: options?.tag || 'love-ping',
    renotify: options?.renotify ?? true,
    data: { url: options?.url || '/' },
  };

  try {
    // 1. Prefer ServiceWorker showNotification (works on mobile, background, iOS PWA)
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg && reg.showNotification) {
      await reg.showNotification(title, notifOptions);
      return true;
    }
  } catch (swErr) {
    console.warn('SW showNotification failed, using fallback:', swErr);
  }

  // 2. Fallback to window Notification constructor
  try {
    const notif = new Notification(title, notifOptions);
    notif.onclick = () => {
      window.focus();
      notif.close();
      if (options?.url && options.url !== window.location.pathname) {
        window.location.href = options.url;
      }
    };
    return true;
  } catch (e) {
    console.warn('Native notification fallback failed:', e);
    return false;
  }
}
