import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UseHttpCodes } from '../hooks/UseHttpCodes';

// URL base del API
const API_URL = 'https://bibliaapi.comunidadmenorah.com/api/Libro/';
// const API_URL = 'https://localhost:7116/api/Libro/';

// Custom Hook
export const UseLibroCrud = () => {
  const {
    token
  } = useAuth();

  const {
    codigosHttp
  } = UseHttpCodes();

  const [libros, setLibros] = useState([]);
  const [testamentos, setTestamentos] = useState([]);
  const [libro, setLibro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCrud, setLoadingCrud] = useState(false);
  const [loadingTestamentos, setLoadingTestamentos] = useState(false);
  const [errorTestamentos, setErrorTestamentos] = useState(null);
  const [errorLibro, setErrorLibro] = useState(null);
  const [errorCrud, setErrorCrud] = useState(null);
  const [crudDone, setCrudDone] = useState(false);
  const [errorLibros, setErrorLibros] = useState(null);

  // Obtener todos los libros
  const fetchLibros = async () => {
    setLoading(true);
    setErrorLibros(null);
    try {
      const response = await fetch(API_URL + 'list');

      if (!response.ok) {
        setErrorLibros('Se produjo un error al tratar de obtener la lista de libros de la Torah');
      } else {
        const data = await response.json();
        setLibros(data);
      }
    } catch (err) {
      setErrorLibros(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener todos los testamentos
  const fetchTestamentos = async () => {
    setLoadingTestamentos(true);
    setErrorTestamentos(null);
    try {
      const response = await fetch(API_URL + 'list/testamento');

      if (!response.ok) {
        setErrorTestamentos('Se produjo un error al tratar de obtener la lista de testamentos de la Torah');
      } else {
        const data = await response.json();
        setTestamentos(data);
      }
    } catch (err) {
      setErrorTestamentos(err.message);
    } finally {
      setLoadingTestamentos(false);
    }
  };

  // Obtener libro
  const fetchLibro = async (id) => {
    setLoading(true);
    setErrorLibro(null);
    try {
      const response = await fetch(API_URL + 'get?id=' + id);

      if (!response.ok) {
        setErrorLibro('Error obteniendo datos del libro');
      } else {
        const data = await response.json();
        setLibro(data);
      }
    } catch (err) {
      setErrorLibro(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar nombre de libro
  const actualizarNombre = async (id, nombre) => {
    setLoadingCrud(true);
    setErrorCrud(null);
    setCrudDone(false);
    try {
      const response = await fetch(API_URL + 'actualizar/nombre', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          {
            id: id,
            nombre: nombre
          }),
      });

      if (!response.ok) {
        setErrorCrud('Se produjo un error al tratar de actualizar el nombre de libro: ' + response.status + ' ' + codigosHttp[response.status]);
      } else {
        setErrorCrud(null);
        setCrudDone(true);
        setLibro((prev) => {
          prev.nombre = nombre;
          return prev;
        });
      }
    } catch (err) {
      setErrorCrud(err.message);
    } finally {
      setLoadingCrud(false);
    }
  };

  // Actualizar abreviatura de libro
  const actualizarAbreviatura = async (id, abreviatura) => {
    setLoadingCrud(true);
    setErrorCrud(null);
    setCrudDone(false);
    try {
      const response = await fetch(API_URL + 'actualizar/abreviatura', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          {
            id: id,
            abreviatura: abreviatura
          }),
      });

      if (!response.ok) {
        setErrorCrud('Se produjo un error al tratar de actualizar la abreviatura de libro: ' + response.status + ' ' + codigosHttp[response.status]);
      } else {
        setErrorCrud(null);
        setCrudDone(true);
        setLibro((prev) => {
          prev.abreviacion = abreviatura;
          return prev;
        });
      }
    } catch (err) {
      setErrorCrud(err.message);
    } finally {
      setLoadingCrud(false);
    }
  };

  // Actualizar versiculo de libro
  const actualizarVersiculo = async (libroVersiculoInputValue) => {
    setLoadingCrud(true);
    setErrorCrud(null);
    setCrudDone(false);
    try {
      const response = await fetch(API_URL + 'actualizar/versiculo', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          {
            id: libroVersiculoInputValue.libroId,
            capituloNumero: libroVersiculoInputValue.capituloNumero,
            versiculoNumero: libroVersiculoInputValue.versiculoNumero,
            versiculo: libroVersiculoInputValue.versiculo
          }),
      });

      if (!response.ok) {
        setErrorCrud('Se produjo un error al tratar de actualizar el versículo: ' + response.status + ' ' + codigosHttp[response.status]);
      } else {
        setErrorCrud(null);
        setCrudDone(true);
        setLibro((prev) => {
          prev.capitulos[prev.capitulos.findIndex(item => item.capituloNumero == libroVersiculoInputValue.capituloNumero)].versiculos[libroVersiculoInputValue.versiculoNumero] = libroVersiculoInputValue.versiculo;
          return prev;
        });
      }
    } catch (err) {
      setErrorCrud(err.message);
    } finally {
      setLoadingCrud(false);
    }
  };

  return {
    testamentos,
    libros,
    libro,
    loading,
    loadingCrud,
    loadingTestamentos,
    errorLibro,
    errorCrud,
    errorLibros,
    errorTestamentos,
    crudDone,
    fetchLibros,
    fetchTestamentos,
    fetchLibro,
    actualizarNombre,
    actualizarAbreviatura,
    actualizarVersiculo
  };
};
