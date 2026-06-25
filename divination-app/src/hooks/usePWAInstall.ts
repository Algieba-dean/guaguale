import { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstallable(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the browser's default install bar/dialog
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      // Clear the prompt and hide the install button
      setDeferredPrompt(null);
      setIsInstallable(false);
      console.log('小卦摊 PWA successfully installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if the event was already fired before hook mounted
    // (sometimes browser triggers before React fully registers the listener)
    if ((window as any).deferredInstallPrompt) {
      setDeferredPrompt((window as any).deferredInstallPrompt);
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.warn('Install prompt event not available yet.');
      return;
    }
    
    try {
      // Trigger native browser install dialog
      await deferredPrompt.prompt();
      
      // Wait for user selection
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User install choice outcome: ${outcome}`);
      
      // Clean up the prompt event as it can only be prompted once
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (err) {
      console.error('Error triggering PWA installation:', err);
    }
  };

  return { isInstallable, installApp };
}
