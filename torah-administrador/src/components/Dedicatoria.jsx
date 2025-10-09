import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Container, Row, Button, Col } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer, toast } from 'react-toastify';
import { UseDedicatoria } from '../hooks/UseDedicatoria';
import Form from 'react-bootstrap/Form';

const Dedicatoria = () => {
    const [dedicatoriaContenidoInputValue, setDedicatoriaContenidoInputValue] = useState('');

    const hasFetched = useRef(false);

    const {
        dedicatorias,
        fetchDedicatorias,
        actualizarDedicatoria,
        crudDone,
        loadingActualizacionDedicatoria,
        errorActualizacionDedicatoria,
        loadingDedicatorias,
        errorDedicatorias
    } = UseDedicatoria();

    const handleUpdateDedicatoria = () => {
        actualizarDedicatoria(dedicatorias[0]?.id, dedicatoriaContenidoInputValue);
    };

    const handleChangeDedicatoriaContenidoInputValue = (e) => {
        setDedicatoriaContenidoInputValue(e.target.value);
    };

    useEffect(() => {
        if (!hasFetched.current) {
            fetchDedicatorias();
            hasFetched.current = true;
        }
    }, []);

    useMemo(() => {
        if (errorDedicatorias) {
            toast.error(errorDedicatorias, { position: "bottom-right" });
        }
    }, [errorDedicatorias]);

    useMemo(() => {
        if (dedicatorias?.length > 0) {
            setDedicatoriaContenidoInputValue(dedicatorias[0]?.contenido);
        }
    }, [dedicatorias]);

    useMemo(() => {
        if (loadingActualizacionDedicatoria === true) {
            toast.info("Salvando cambios...", { position: "bottom-right" });
        }
    }, [loadingActualizacionDedicatoria]);

    useMemo(() => {
        if (errorActualizacionDedicatoria) {
            toast.error("Hubo un problema salvando datos de dedicatoria: " + errorActualizacionDedicatoria, { position: "bottom-right" });
        }
    }, [errorActualizacionDedicatoria]);

    useMemo(() => {
        if (crudDone === true) {
            toast.success("Datos de dedicatoria salvado satisfactoriamente", { position: "bottom-right" });
        }
    }, [crudDone]);

    return (
        <div>
            <Container>
                <Row className="d-flex justify-content-center align-items-center">
                    <ToastContainer />
                    {loadingDedicatorias ? (<Spinner animation="border" variant="primary" />) :
                        (
                            <Container>
                                <h2>Dedicatoria</h2>
                                <Form>
                                    <Form.Group className="mb-3" controlId="DedicatoriaForm">
                                        <Form.Label>Contenido</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={8}
                                            autoFocus
                                            value={dedicatoriaContenidoInputValue || ""}
                                            onChange={handleChangeDedicatoriaContenidoInputValue}
                                        />
                                    </Form.Group>
                                    <Row>
                                        <Col>
                                            <Button variant="primary" onClick={handleUpdateDedicatoria} disabled={loadingActualizacionDedicatoria || dedicatoriaContenidoInputValue.length == 0}>
                                                {!loadingActualizacionDedicatoria ? "Guardar Cambios" : "Cargando"}
                                                {loadingActualizacionDedicatoria ? (
                                                    <Spinner
                                                        style={{ width: "0.7rem", height: "0.7rem" }}
                                                        type="grow"
                                                        color="light"
                                                    />
                                                ) : null}
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </Container>
                        )}
                </Row>
            </Container>
        </div>
    );
};

export default Dedicatoria;