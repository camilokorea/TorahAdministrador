import React, { useEffect } from 'react';
import { Table, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer, toast } from 'react-toastify';
import { UseLibroCrud } from '../hooks/UseLibroCrud';
import Accordion from 'react-bootstrap/Accordion';

const Torah = () => {
    const {
        testamentos,
        libros,
        loading,
        loadingTestamentos,
        errorLibros,
        errorTestamentos,
        fetchLibros,
        fetchTestamentos
    } = UseLibroCrud();

    useEffect(() => {
        if (errorLibros) {
            toast.error(errorLibros, { position: "bottom-right" });
        }
    }, [errorLibros]);

    useEffect(() => {
        if (errorTestamentos) {
            toast.error(errorTestamentos, { position: "bottom-right" });
        }
    }, [errorTestamentos]);

    useEffect(() => {
        fetchLibros();
        fetchTestamentos();
    }, []);

    return (
        <Container>
            <Row className="d-flex justify-content-center align-items-center">
                <ToastContainer />
                {loadingTestamentos ? (<Spinner animation="border" variant="primary" />) :
                    (
                        <Accordion defaultActiveKey="0">
                            {testamentos?.map((testamento, indexTestamento) => (
                                <Accordion.Item eventKey={indexTestamento.toString()} key={testamento}>
                                    <Accordion.Header>{testamento}</Accordion.Header>
                                    <Accordion.Body>
                                        {loading ? (<Spinner animation="border" variant="primary" />) :
                                            (
                                                <Table striped bordered hover>
                                                    <thead>
                                                        <tr>
                                                            <th>Nombre</th>
                                                            <th>Prefijo</th>
                                                            <th>Testamento</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {libros.map((libro) => (
                                                            libro?.testamento == testamento ? (
                                                                <tr key={libro.id}>
                                                                    <td>
                                                                        <Link to={`/libro/${libro.id}`}>{libro.nombre}</Link>
                                                                    </td>
                                                                    <td>{libro.abreviacion}</td>
                                                                    <td>{libro.testamento}</td>
                                                                </tr>
                                                            ) : <div></div>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            )}

                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    )
                }
            </Row>
        </Container>
    );
};

export default Torah;
