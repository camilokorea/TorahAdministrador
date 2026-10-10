import React, { useRef, useState } from 'react';
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react';
import { api, imagenUrl } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { prepareImage } from '../../lib/image';
import { btn } from '../../lib/ui';

// Sube una imagen (reducida en el navegador) y devuelve su id por onChange.
const ImageField = ({ value, onChange, label = 'Imagen', aspect = 'aspect-video', removable = true }) => {
    const { token } = useAuth();
    const inputRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const onFile = async (file) => {
        if (!file) return;
        setBusy(true);
        setError('');
        try {
            const prepared = await prepareImage(file);
            const { id } = await api.subirImagen(token, prepared);
            onChange(id);
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            {value ? (
                <div className="group relative overflow-hidden rounded-xl border border-line bg-surface-2">
                    <img src={imagenUrl(value)} alt="" className={`w-full object-cover ${aspect}`} />
                    <div className="absolute right-2 top-2 flex gap-1.5 opacity-90 group-hover:opacity-100">
                        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className={`${btn.small} bg-surface/95 text-ink shadow`}>
                            <RefreshCw size={14} className={busy ? 'animate-spin' : ''} aria-hidden="true" /> {busy ? 'Subiendo…' : 'Cambiar'}
                        </button>
                        {removable && (
                            <button type="button" onClick={() => onChange(null)} disabled={busy} aria-label={`Quitar ${label.toLowerCase()}`} className={`${btn.small} bg-surface/95 text-danger shadow`}>
                                <Trash2 size={14} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        onFile(e.dataTransfer.files?.[0]);
                    }}
                    disabled={busy}
                    className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-surface px-4 py-8 text-sm text-muted transition hover:border-brand/50 hover:text-ink ${aspect === 'aspect-[3/1]' ? '' : ''}`}
                >
                    <ImagePlus size={24} aria-hidden="true" />
                    {busy ? 'Subiendo…' : `${label}: haz clic o arrastra una imagen aquí`}
                    <span className="text-xs">JPG, PNG o WebP. Se reduce automáticamente.</span>
                </button>
            )}
            {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
        </div>
    );
};

export default ImageField;
