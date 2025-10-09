// src/components/AuthenticatedLayout.js
import React, { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Container, Row, Col, Nav, Button, Offcanvas } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import Torah from './Torah';
import Dedicatoria from './Dedicatoria';
import Glosario from './Glosario';
import Libro from './Libro';

const AuthenticatedLayout = () => {
    const [showSidebar, setShowSidebar] = useState(false);
    const { logout } = useAuth(); // Consumimos el contexto

    return (
        <Container fluid>
            <Row>
                {/* Botón de menú hamburguesa en móviles */}
                <Button
                    variant="primary"
                    className="d-md-none mb-2 z-1 position-fixed top-0"
                    onClick={() => setShowSidebar(true)}
                >
                    Menú
                </Button>

                {/* Menú lateral responsivo */}
                <Offcanvas
                    show={showSidebar}
                    onHide={() => setShowSidebar(false)}
                    className="d-md-none"
                >
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Menú</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Nav className="flex-column">
                            <Nav.Link as={NavLink} to="/" end onClick={() => setShowSidebar(false)}>
                                Torah
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/dedicatoria" onClick={() => setShowSidebar(false)}>
                                Dedicatoria
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/glosario" onClick={() => setShowSidebar(false)}>
                                Glosario
                            </Nav.Link>
                            <Button variant="danger" onClick={logout} className="mt-3">
                                Cerrar Sesión
                            </Button>
                        </Nav>
                    </Offcanvas.Body>
                </Offcanvas>

                {/* Menú lateral para pantallas grandes */}
                <Col xs={3} sm={3} md={2} lg={2} className="bg-light vh-100 d-none d-md-block position-fixed top-0">
                    <Nav className="flex-column p-3">
                        <Nav.Link as={NavLink} to="/" end>
                            Torah
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/dedicatoria">
                            Dedicatoria
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/glosario">
                            Glosario
                        </Nav.Link>
                        <Button variant="danger" onClick={logout} className="mt-3">
                            Cerrar Sesión
                        </Button>
                    </Nav>
                </Col>

                {/* Contenido principal */}
                <Col xs={12} sm={12} md={10} lg={10} className="p-4 right-absolute">
                    <Routes>
                        <Route path="/" element={<Torah />} />
                        <Route path="/libro/:id" element={<Libro />} />
                        <Route path="/dedicatoria" element={<Dedicatoria />} />
                        <Route path="/glosario" element={<Glosario />} />
                    </Routes>
                </Col>
            </Row>
        </Container>
    );
};

export default AuthenticatedLayout;
