const MAX_SIDE = 1600;
const QUALITY = 0.85;

/*
  Reduce la imagen antes de subirla (lado mayor 1600 px, WebP) para que la base de datos
  y la descarga sin conexión de la app no crezcan de más. Los GIF se suben tal cual (pueden ser animados).
*/
export const prepareImage = async (file) => {
    if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen.');
    if (file.type === 'image/gif') return file;

    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY));
    // Navegadores sin WebP devuelven PNG; en ese caso se usa JPEG, que pesa menos.
    const result = blob?.type === 'image/webp' ? blob : await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
    const ext = result.type === 'image/webp' ? 'webp' : 'jpg';
    const name = file.name.replace(/\.[^.]+$/, '') || 'imagen';
    return new File([result], `${name}.${ext}`, { type: result.type });
};
