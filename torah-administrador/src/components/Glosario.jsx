import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Container, Row, Button, Col } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer, toast } from 'react-toastify';
import { UseGlosario } from '../hooks/UseGlosario';
import Form from 'react-bootstrap/Form';

const Glosario = () => {
    const [glosarioContenidoInputValue, setGlosarioContenidoInputValue] = useState('');

    const hasFetched = useRef(false);

    const {
        glosarios,
        fetchGlosarios,
        actualizarGlosario,
        crudDone,
        loadingActualizacionGlosario,
        errorActualizacionGlosario,
        loadingGlosarios,
        errorGlosarios
    } = UseGlosario();

    const handleUpdateGlosario = () => {
        actualizarGlosario(glosarios[0]?.id, glosarioContenidoInputValue);
    };

    const handleChangeGlosarioContenidoInputValue = (e) => {
        setGlosarioContenidoInputValue(e.target.value);
    };

    useEffect(() => {
        if (!hasFetched.current) {
            fetchGlosarios();
            hasFetched.current = true;
        }
    }, []);

    useMemo(() => {
        if (errorGlosarios) {
            toast.error(errorGlosarios, { position: "bottom-right" });
        }
    }, [errorGlosarios]);

    useMemo(() => {
        if (glosarios?.length > 0) {
            setGlosarioContenidoInputValue(glosarios[0]?.contenido);
        }
    }, [glosarios]);

    useMemo(() => {
        if (loadingActualizacionGlosario === true) {
            toast.info("Salvando cambios...", { position: "bottom-right" });
        }
    }, [loadingActualizacionGlosario]);

    useMemo(() => {
        if (errorActualizacionGlosario) {
            toast.error("Hubo un problema salvando datos de glosario: " + errorActualizacionGlosario, { position: "bottom-right" });
        }
    }, [errorActualizacionGlosario]);

    useMemo(() => {
        if (crudDone === true) {
            toast.success("Datos de glosario salvado satisfactoriamente", { position: "bottom-right" });
        }
    }, [crudDone]);

    return (
        <div>
            <Container>
                <Row className="d-flex justify-content-center align-items-center">
                    <ToastContainer />
                    {loadingGlosarios ? (<Spinner animation="border" variant="primary" />) :
                        (
                            <Container>
                                <h2>Glosario</h2>
                                <Form>
                                    <Form.Group className="mb-3" controlId="GlosarioForm">
                                        <Form.Label>Contenido</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={8}
                                            autoFocus
                                            value={glosarioContenidoInputValue || ""}
                                            onChange={handleChangeGlosarioContenidoInputValue}
                                        />
                                    </Form.Group>
                                    <Row>
                                        <Col>
                                            <Button variant="primary" onClick={handleUpdateGlosario} disabled={loadingActualizacionGlosario || glosarioContenidoInputValue.length == 0}>
                                                {!loadingActualizacionGlosario ? "Guardar Cambios" : "Cargando"}
                                                {loadingActualizacionGlosario ? (
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

export default Glosario;