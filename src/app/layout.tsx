import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PortalProvider } from '@/lib/PortalProvider';

export const metadata: Metadata = {
  title: 'Our Space ✨ Bibo & Jojo',
  description: 'A special digital place for Bibo & Jojo with live countdowns, secret time-locked vaults, digital letters, and cherished memories.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>❤️</text></svg>',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F8DCDA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&family=Caveat:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Dancing+Script:wght@500;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased selection:bg-pink-300 selection:text-pink-900 bg-[#F8DCDA]">
        <PortalProvider>
          {children}
        </PortalProvider>
      </body>
    </html>
  );
}
