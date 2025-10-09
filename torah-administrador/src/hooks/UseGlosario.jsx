import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UseHttpCodes } from '../hooks/UseHttpCodes';

// URL base del API
const API_URL = 'https://bibliaapi.comunidadmenorah.com/api/Glosario/';
// const API_URL = 'https://localhost:7116/api/Glosario/';

// Custom Hook
export const UseGlosario = () => {
    const {
        token
    } = useAuth();

    const {
        codigosHttp
    } = UseHttpCodes();

    const [glosarios, setGlosarios] = useState([]);    
    const [crudDone, setCrudDone] = useState(false);
    const [loadingActualizacionGlosario, setLoadingActualizacionGlosario] = useState(false);
    const [errorActualizacionGlosario, setErrorActualizacionGlosario] = useState(null);
    const [loadingGlosarios, setLoadingGlosarios] = useState(false);
    const [errorGlosarios, setErrorGlosarios] = useState(null);
    

    // Obtener todos los glosarios
    const fetchGlosarios = async () => {
        setLoadingGlosarios(true);
        setErrorGlosarios(null);
        try {
            const response = await fetch(API_URL + 'list');

            if (!response.ok) {
                setErrorGlosarios('Se produjo un error al tratar de obtener la lista de glosarios');
            } else {
                const data = await response.json();
                setGlosarios(data);
            }
        } catch (err) {
            setErrorGlosarios(err.message);
        } finally {
            setLoadingGlosarios(false);
        }
    };

    // Actualizar glosario
    const actualizarGlosario = async (id, contenido) => {
        setLoadingActualizacionGlosario(true);
        setErrorActualizacionGlosario(null);
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
                setErrorActualizacionGlosario('Se produjo un error al tratar de actualizar el glosario: ' + response.status + ' ' + codigosHttp[response.status]);
            } else {
                setErrorActualizacionGlosario(null);
                setCrudDone(true);
                setGlosarios((prev) => {
                    prev[prev.length - 1].contenido = contenido;
                    return prev;
                });
            }
        } catch (err) {
            setErrorActualizacionGlosario(err.message);
        } finally {
            setLoadingActualizacionGlosario(false);
        }
    };

    return {
        glosarios,
        fetchGlosarios,
        actualizarGlosario,
        crudDone,
        loadingActualizacionGlosario,
        errorActualizacionGlosario,
        loadingGlosarios,
        errorGlosarios
    };
};
