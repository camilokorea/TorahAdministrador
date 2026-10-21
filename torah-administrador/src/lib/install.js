import { useEffect, useState } from 'react';

// El navegador avisa una sola vez (y muy temprano) que la app se puede instalar; se guarda aquí.
let deferredPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

export const captureInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault(); // mostrar nuestro botón en vez del aviso automático
        deferredPrompt = e;
        notify();
    });
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        try {
            localStorage.setItem('admin.instalada', '1');
        } catch {
            // sin almacenamiento
        }
        notify();
    });
};

// ¿Se está usando ya como app instalada?
export const isStandalone = () =>
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true;

// iPhone/iPad (incluye iPad que se presenta como Mac). En iOS no hay aviso de instalación: hay que dar instrucciones.
export const isIOS = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// En iOS solo Safari puede agregar a la pantalla de inicio (Chrome/Firefox de iOS lo hacen desde iOS 16.4, también por Compartir).
const isIOSInAppBrowser = () => /FBAN|FBAV|Instagram|Line\//i.test(navigator.userAgent);

/*
  Estado del atajo de instalación:
  - mode 'prompt': el navegador permite instalar con un botón (Android, Chrome/Edge de escritorio).
  - mode 'ios': mostrar instrucciones para agregar a la pantalla de inicio.
  - mode null: ya está instalada o el navegador no lo permite → no mostrar nada.
*/
export const useInstall = () => {
    const [, force] = useState(0);
    const [standalone, setStandalone] = useState(isStandalone);

    useEffect(() => {
        const rerender = () => force((n) => n + 1);
        listeners.add(rerender);
        const media = window.matchMedia?.('(display-mode: standalone)');
        const onMode = () => setStandalone(isStandalone());
        media?.addEventListener?.('change', onMode);
        return () => {
            listeners.delete(rerender);
            media?.removeEventListener?.('change', onMode);
        };
    }, []);

    let mode = null;
    if (!standalone) {
        if (deferredPrompt) mode = 'prompt';
        else if (isIOS() && !isIOSInAppBrowser()) mode = 'ios';
    }

    const install = async () => {
        if (!deferredPrompt) return 'unavailable';
        const prompt = deferredPrompt;
        deferredPrompt = null;
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        notify();
        return outcome; // 'accepted' | 'dismissed'
    };

    return { mode, install };
};
