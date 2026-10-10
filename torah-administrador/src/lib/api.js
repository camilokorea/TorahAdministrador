const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bibliaapi.comunidadmenorah.com/api/';

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

const STATUS_MESSAGES = {
    400: 'La solicitud no es válida.',
    401: 'La sesión expiró o no es válida.',
    403: 'No tienes permiso para hacer esto.',
    404: 'No se encontró el recurso.',
    500: 'Error interno del servidor.',
    502: 'El servidor no está disponible.',
    503: 'El servicio no está disponible.',
};

let unauthorizedHandler = null;

// El AuthProvider registra aquí qué hacer cuando la API responde 401.
export const onUnauthorized = (handler) => {
    unauthorizedHandler = handler;
};

export const imagenUrl = (id) => (id ? `${API_BASE_URL}Imagen/${id}` : null);

const request = async (path, { method = 'GET', body, form, token } = {}) => {
    let response;
    try {
        response = await fetch(API_BASE_URL + path, {
            method,
            cache: 'no-store',
            headers: {
                ...(body ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: form ?? (body ? JSON.stringify(body) : undefined),
        });
    } catch {
        throw new ApiError('No hay conexión con el servidor. Revisa tu internet.', 0);
    }

    if (!response.ok) {
        if (response.status === 401 && token) unauthorizedHandler?.();
        let message = STATUS_MESSAGES[response.status] ?? `Error ${response.status}.`;
        try {
            const data = await response.json();
            if (data?.message) message = data.message;
        } catch {
            // Respuesta sin cuerpo JSON.
        }
        throw new ApiError(message, response.status);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
};

export const api = {
    login: (email, password) => request('Auth/login', { method: 'POST', body: { email, password } }),

    listLibros: () => request('Libro/list'),
    getLibro: (id) => request(`Libro/get?id=${encodeURIComponent(id)}`),
    updateNombre: (token, id, nombre) => request('Libro/actualizar/nombre', { method: 'PATCH', token, body: { id, nombre } }),
    updateAbreviatura: (token, id, abreviatura) => request('Libro/actualizar/abreviatura', { method: 'PATCH', token, body: { id, abreviatura } }),
    // versiculoNumero es la posición (base 0) dentro del arreglo de versículos del capítulo.
    updateVersiculo: (token, id, capituloNumero, versiculoNumero, versiculo) =>
        request('Libro/actualizar/versiculo', { method: 'PATCH', token, body: { id, capituloNumero, versiculoNumero, versiculo } }),
    // posicion: dónde queda el nuevo versículo dentro del arreglo (0 = al inicio).
    insertVersiculo: (token, id, capituloNumero, posicion, versiculo) =>
        request('Libro/insertar/versiculo', { method: 'POST', token, body: { id, capituloNumero, posicion, versiculo } }),
    // versiculo: el texto actual en esa posición; si no coincide, la API responde 409 y no borra nada.
    deleteVersiculo: (token, id, capituloNumero, posicion, versiculo) =>
        request('Libro/eliminar/versiculo', { method: 'POST', token, body: { id, capituloNumero, posicion, versiculo } }),

    listDedicatoria: () => request('Dedicatoria/list'),
    updateDedicatoria: (token, id, contenido) => request('Dedicatoria/actualizar/contenido', { method: 'PATCH', token, body: { id, contenido } }),

    listGlosario: () => request('Glosario/list'),
    updateGlosario: (token, id, contenido) => request('Glosario/actualizar/contenido', { method: 'PATCH', token, body: { id, contenido } }),

    ultimaVersion: () => request('VersionControlador/ultimaversion'),

    listEstudios: (token) => request('Estudio/list', { token }),
    getEstudio: (token, id) => request(`Estudio/get?id=${encodeURIComponent(id)}`, { token }),
    crearEstudio: (token, titulo) => request('Estudio/crear', { method: 'POST', token, body: { titulo } }),
    // estudio debe incluir la revision que se leyó; si otra persona guardó antes, responde 409.
    guardarEstudio: (token, estudio) => request('Estudio/guardar', { method: 'POST', token, body: estudio }),
    estadoEstudio: (token, id, publicado) => request('Estudio/estado', { method: 'POST', token, body: { id, publicado } }),
    eliminarEstudio: (token, id) => request('Estudio/eliminar', { method: 'POST', token, body: { id } }),
    ordenarEstudios: (token, ids) => request('Estudio/ordenar', { method: 'POST', token, body: { ids } }),

    subirImagen: (token, archivo) => {
        const form = new FormData();
        form.append('archivo', archivo);
        return request('Imagen/subir', { method: 'POST', token, form });
    },
};
