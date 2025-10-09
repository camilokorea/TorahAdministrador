import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Container, Row, Button, Col } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer, toast } from 'react-toastify';
import { UseLibroCrud } from '../hooks/UseLibroCrud';
import { useParams } from "react-router-dom";
import Accordion from 'react-bootstrap/Accordion';
import { FaPencilAlt } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

const Libro = () => {
    const { id } = useParams();
    const [showModalLibroTitulo, setShowModalLibroTitulo] = useState(false);
    const [showModalLibroAbreviatura, setShowModalLibroAbreviatura] = useState(false);
    const [showModalLibroVersiculo, setShowModalLibroVersiculo] = useState(false);
    const [libroTituloInputValue, setLibroTituloInputValue] = useState('');
    const [libroAbreviaturaInputValue, setLibroAbreviaturaInputValue] = useState('');
    const [libroVersiculoInputValue, setLibroVersiculoInputValue] = useState({
        libroId: '',
        capituloNumero: null,
        versiculoNumero: null,
        versiculo: ''
    });

    const hasFetched = useRef(false);

    const {
        libro,
        loading,
        loadingCrud,
        errorLibro,
        errorCrud,
        crudDone,
        fetchLibro,
        actualizarNombre,
        actualizarAbreviatura,
        actualizarVersiculo
    } = UseLibroCrud();

    const handleCloseModalLibroTitulo = () => setShowModalLibroTitulo(false);
    const handleShowModalLibroTitulo = () => setShowModalLibroTitulo(true);

    const handleCloseModalLibroAbreviatura = () => setShowModalLibroAbreviatura(false);
    const handleShowModalLibroAbreviatura = () => setShowModalLibroAbreviatura(true);

    const handleCloseModalLibroVersiculo = () => setShowModalLibroVersiculo(false);
    const handleShowModalLibroVersiculo = (libroId, capituloNumero, versiculo, versiculoNumero) => {
        setLibroVersiculoInputValue({
            libroId: libroId,
            capituloNumero: capituloNumero,
            versiculoNumero: versiculoNumero,
            versiculo: versiculo
        });

        setShowModalLibroVersiculo(true);
    };

    const handleUpdateLibroTitulo = () => {
        actualizarNombre(libro?.id, libroTituloInputValue);
    };

    const handleUpdateLibroAbreviatura = () => {
        actualizarAbreviatura(libro?.id, libroAbreviaturaInputValue);
    };

    const handleUpdateLibroVersiculo = () => {
        actualizarVersiculo(libroVersiculoInputValue);
    };

    const handleChangeLibroTituloInputValue = (e) => {
        setLibroTituloInputValue(e.target.value);
    };

    const handleChangeLibroAbreviaturaInputValue = (e) => {
        setLibroAbreviaturaInputValue(e.target.value);
    };

    const handleChangeLibroVersiculoInputValue = (e) => {
        setLibroVersiculoInputValue({
            libroId: libroVersiculoInputValue.libroId,
            capituloNumero: libroVersiculoInputValue.capituloNumero,
            versiculoNumero: libroVersiculoInputValue.versiculoNumero,
            versiculo: e.target.value
        });
    };

    useEffect(() => {
        if (!hasFetched.current) {
            fetchLibro(id);
            hasFetched.current = true;
        }
    }, []);

    useMemo(() => {
        if (errorLibro) {
            toast.error(errorLibro, { position: "bottom-right" });
        }
    }, [errorLibro]);

    useMemo(() => {
        if (libro?.nombre) {
            setLibroTituloInputValue(libro?.nombre);
        }

        if (libro?.abreviacion) {
            setLibroAbreviaturaInputValue(libro?.abreviacion);
        }
    }, [libro]);

    useMemo(() => {
        if (loadingCrud === true) {
            toast.info("Salvando cambios...", { position: "bottom-right" });
        }
    }, [loadingCrud]);

    useMemo(() => {
        if (errorCrud) {
            toast.error("Hubo un problema salvando datos de libro: " + errorCrud, { position: "bottom-right" });
        }
    }, [errorCrud]);

    useMemo(() => {
        if (crudDone === true) {
            toast.success("Datos de libro salvado satisfactoriamente", { position: "bottom-right" });
            handleCloseModalLibroTitulo();
            handleCloseModalLibroAbreviatura();
            handleCloseModalLibroVersiculo();
        }
    }, [crudDone]);

    return (
        <div>
            <Container>
                <Row className="d-flex justify-content-center align-items-center">
                    <ToastContainer />
                    {loading ? (<Spinner animation="border" variant="primary" />) :
                        (
                            <Container>
                                <Row>
                                    <Container>
                                        <Row className="d-flex justify-content-left align-items-left">
                                            <Col xs={9} sm={10} md={10} lg={11}>
                                                <h3>{libro?.testamento}</h3>
                                            </Col>
                                        </Row>
                                        <Row className="d-flex justify-content-left align-items-left">
                                            <Col xs={3} sm={2} md={2} lg={1}>
                                                <Button variant="primary" size="sm" onClick={handleShowModalLibroTitulo}>
                                                    <FaPencilAlt />
                                                </Button>
                                            </Col>
                                            <Col xs={9} sm={10} md={10} lg={11}>
                                                <h4>{libro?.nombre}</h4>
                                            </Col>
                                        </Row>
                                        <Row className="d-flex justify-content-left align-items-left">
                                            <Col xs={3} sm={2} md={2} lg={1}>
                                                <Button variant="primary" size="sm" onClick={handleShowModalLibroAbreviatura}>
                                                    <FaPencilAlt />
                                                </Button>
                                            </Col>
                                            <Col xs={9} sm={10} md={10} lg={11}>
                                                <p>Abreviatura: {libro?.abreviacion}</p>
                                            </Col>
                                        </Row>
                                    </Container>
                                    <h3>Capítulos</h3>
                                    <Accordion defaultActiveKey="0">
                                        {libro?.capitulos.map((capitulo, indexCapitulo) => (
                                            <Accordion.Item eventKey={indexCapitulo.toString()} key={capitulo.capituloNumero}>
                                                <Accordion.Header>Capítulo {capitulo.capituloNumero}</Accordion.Header>
                                                <Accordion.Body>
                                                    {capitulo.versiculos.map((versiculo, indexVersiculo) => (
                                                        <Container key={String(capitulo.capituloNumero) + '-' + String(indexVersiculo.toString())}>
                                                            <Row className="d-flex justify-content-left align-items-left">
                                                                <Col xs={3} sm={2} md={2} lg={1}>
                                                                    <Button variant="primary" size="sm" onClick={() => handleShowModalLibroVersiculo(id, capitulo.capituloNumero, versiculo, indexVersiculo)}>
                                                                        <FaPencilAlt />
                                                                    </Button>
                                                                </Col>
                                                                <Col xs={9} sm={10} md={10} lg={11}>
                                                                    <p className='hover-text'>{versiculo}</p>
                                                                </Col>
                                                            </Row>
                                                        </Container>
                                                    ))}
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        ))}
                                    </Accordion>
                                </Row>
                            </Container>
                        )}
                </Row>
            </Container>
            <Modal show={showModalLibroTitulo} onHide={handleCloseModalLibroTitulo}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar nombre de Libro bíblico</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="LibroNombreForm">
                            <Form.Label>Nombre de Libro</Form.Label>
                            <Form.Control
                                type="text"
                                autoFocus
                                value={libroTituloInputValue || ""}
                                onChange={handleChangeLibroTituloInputValue}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" type="submit" disabled={loadingCrud} onClick={handleCloseModalLibroTitulo}>
                        {!loadingCrud ? "Cerrar" : "Cargando"}
                        {loadingCrud ? (
                            <Spinner
                                style={{ width: "0.7rem", height: "0.7rem" }}
                                type="grow"
                                color="light"
                            />
                        ) : null}
                    </Button>
                    <Button variant="primary" onClick={handleUpdateLibroTitulo} disabled={loadingCrud}>
                        {!loadingCrud ? "Guardar Cambios" : "Cargando"}
                        {loadingCrud ? (
                            <Spinner
                                style={{ width: "0.7rem", height: "0.7rem" }}
                                type="grow"
                                color="light"
                            />
                        ) : null}
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showModalLibroAbreviatura} onHide={handleCloseModalLibroAbreviatura}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar abreviatura de Libro bíblico</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="LibroAbreviaturaForm">
                            <Form.Label>Abreviatura de Libro</Form.Label>
                            <Form.Control
                                type="text"
                                autoFocus
                                value={libroAbreviaturaInputValue || ""}
                                onChange={handleChangeLibroAbreviaturaInputValue}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" type="submit" disabled={loadingCrud} onClick={handleCloseModalLibroAbreviatura}>
                        {!loadingCrud ? "Cerrar" : "Cargando"}
                        {loadingCrud ? (
                            <Spinner
                                style={{ width: "0.7rem", height: "0.7rem" }}
                                type="grow"
                                color="light"
                            />
                        ) : null}
                    </Button>
                    <Button variant="primary" onClick={handleUpdateLibroAbreviatura} disabled={loadingCrud}>
                        {!loadingCrud ? "Guardar Cambios" : "Cargando"}
                        {loadingCrud ? (
                            <Spinner
                                style={{ width: "0.7rem", height: "0.7rem" }}
                                type="grow"
                                color="light"
                            />
                        ) : null}
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showModalLibroVersiculo} onHide={handleCloseModalLibroVersiculo}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar versículo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="LibroVersiculoForm">
                            <Form.Label>Versículo</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                autoFocus
                                value={libroVersiculoInputValue.versiculo || ""}
                                onChange={handleChangeLibroVersiculoInputValue}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" type="submit" disabled={loadingCrud} onClick={handleCloseModalLibroVersiculo}>
                        {!loadingCrud ? "Cerrar" : "Cargando"}
                        {loadingCrud ? (
                            <Spinner
                                style={{ width: "0.7rem", height: "0.7rem" }}
                                type="grow"
                                color="light"
                            />
                        ) : null}
                    </Button>
                    <Button variant="primary" onClick={handleUpdateLibroVersiculo} disabled={loadingCrud}>
                        {!loadingCrud ? "Guardar Cambios" : "Cargando"}
                        {loadingCrud ? (
                            <Spinner
                                style={{ width: "0.7rem", height: "0.7rem" }}
                                type="grow"
                                color="light"
                            />
                        ) : null}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Libro;
