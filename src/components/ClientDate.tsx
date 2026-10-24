'use client';

import { useState, useEffect } from 'react';

interface ClientDateProps {
  date: string;
  format?: 'short' | 'full' | 'dateOnly' | 'timeOnly';
  className?: string;
}

export default function ClientDate({ date, format = 'short', className }: ClientDateProps) {
  const [formatted, setFormatted] = useState('');

  useEffect(() => {
    if (!date) return;
    try {
      const d = new Date(date);
      if (format === 'dateOnly') {
        setFormatted(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
      } else if (format === 'full') {
        setFormatted(d.toLocaleString('en-GB'));
      } else {
        setFormatted(d.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }));
      }
    } catch {
      setFormatted(date);
    }
  }, [date, format]);

  return <span className={className} suppressHydrationWarning>{formatted}</span>;
}
