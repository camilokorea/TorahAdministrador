import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

const MESSAGE = 'Tienes cambios sin guardar. ¿Salir de todas formas y perderlos?';

// Avisa antes de salir de la página (o cerrar la pestaña) con cambios sin guardar.
export const useUnsavedChanges = (dirty) => {
    // Incluye cambios de la query (p. ej. ?cap= al cambiar de capítulo).
    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        dirty && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search)
    );

    useEffect(() => {
        if (blocker.state !== 'blocked') return;
        if (window.confirm(MESSAGE)) blocker.proceed();
        else blocker.reset();
    }, [blocker]);

    useEffect(() => {
        if (!dirty) return undefined;
        const onBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [dirty]);
};

export const confirmDiscard = () => window.confirm(MESSAGE);
