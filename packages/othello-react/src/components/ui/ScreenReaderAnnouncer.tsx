import { useEffect, useRef } from 'react';

interface ScreenReaderAnnouncerProps {
  message: string | null;
}

/**
 * Announces game events to screen readers via an aria-live region.
 * Messages are set, then cleared after a short delay so repeated
 * identical messages still trigger announcements.
 */
export function ScreenReaderAnnouncer({ message }: ScreenReaderAnnouncerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message || !ref.current) return;
    ref.current.textContent = message;
    const id = setTimeout(() => {
      if (ref.current) ref.current.textContent = '';
    }, 1000);
    return () => clearTimeout(id);
  }, [message]);

  return <div ref={ref} className="sr-only" aria-live="polite" aria-atomic="true" />;
}
