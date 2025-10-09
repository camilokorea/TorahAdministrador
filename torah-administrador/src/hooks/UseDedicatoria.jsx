import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UseHttpCodes } from '../hooks/UseHttpCodes';

// URL base del API
const API_URL = 'https://bibliaapi.comunidadmenorah.com/api/Dedicatoria/';
// const API_URL = 'https://localhost:7116/api/Dedicatoria/';

// Custom Hook
export const UseDedicatoria = () => {
    const {
        token
    } = useAuth();

    const {
        codigosHttp
    } = UseHttpCodes();

    const [dedicatorias, setDedicatorias] = useState([]);    
    const [crudDone, setCrudDone] = useState(false);
    const [loadingActualizacionDedicatoria, setLoadingActualizacionDedicatoria] = useState(false);
    const [errorActualizacionDedicatoria, setErrorActualizacionDedicatoria] = useState(null);
    const [loadingDedicatorias, setLoadingDedicatorias] = useState(false);
    const [errorDedicatorias, setErrorDedicatorias] = useState(null);
    

    // Obtener todos los dedicatorias
    const fetchDedicatorias = async () => {
        setLoadingDedicatorias(true);
        setErrorDedicatorias(null);
        try {
            const response = await fetch(API_URL + 'list');

            if (!response.ok) {
                setErrorDedicatorias('Se produjo un error al tratar de obtener la lista de dedicatorias');
            } else {
                const data = await response.json();
                setDedicatorias(data);
            }
        } catch (err) {
            setErrorDedicatorias(err.message);
        } finally {
            setLoadingDedicatorias(false);
        }
    };

    // Actualizar dedicatoria
    const actualizarDedicatoria = async (id, contenido) => {
        setLoadingActualizacionDedicatoria(true);
        setErrorActualizacionDedicatoria(null);
        setCrudDone(false);
        try {
            const response = await fetch(API_URL + 'actualizar/contenido', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(
                    {
                        id: id,
                        contenido: contenido
                    }),
            });

            if (!response.ok) {
                setErrorActualizacionDedicatoria('Se produjo un error al tratar de actualizar el dedicatoria: ' + response.status + ' ' + codigosHttp[response.status]);
            } else {
                setErrorActualizacionDedicatoria(null);
                setCrudDone(true);
                setDedicatorias((prev) => {
                    prev[prev.length - 1].contenido = contenido;
                    return prev;
                });
            }
        } catch (err) {
            setErrorActualizacionDedicatoria(err.message);
        } finally {
            setLoadingActualizacionDedicatoria(false);
        }
    };

    return {
        dedicatorias,
        fetchDedicatorias,
        actualizarDedicatoria,
        crudDone,
        loadingActualizacionDedicatoria,
        errorActualizacionDedicatoria,
        loadingDedicatorias,
        errorDedicatorias
    };
};
