import { useState, useEffect, useCallback } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa-install-banner-dismissed';

export const PwaInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const ua = navigator.userAgent;
    const isiOS = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream;
    setIsIos(isiOS);

    if (isiOS) {
      // Show after a short delay on iOS (no beforeinstallprompt)
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setVisible(false);
      }
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, 'true');
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md',
        'rounded-xl border bg-card p-4 shadow-lg',
        'animate-in slide-in-from-bottom-5 fade-in duration-500'
      )}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-2 pr-4">
          <p className="font-semibold text-sm">Install Wickets</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isIos
              ? 'Tap the Share button in Safari, then "Add to Home Screen" to install.'
              : 'Add Wickets to your home screen for quick access and offline scoring.'}
          </p>
          {!isIos && deferredPrompt && (
            <Button size="sm" onClick={handleInstall} className="mt-1">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Install App
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
