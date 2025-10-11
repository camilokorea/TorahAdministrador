import React, { useState, useMemo } from 'react';
import { Form, Button, Container, Row } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer, toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();

  const {
    loading,
    login,
    error,
    isAuthenticated
  } = useAuth();

  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);

  useMemo(() => {
    if (error) {
      toast.error(error, { position: "bottom-right" });
    }
  }, [error]);

  useMemo(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    login(input, rememberMe);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  return (
    <Container>
      <ToastContainer />
      <Row>
        <h2>Sistema Administrador Torah Ministerio Menorah</h2>
      </Row>
      <Row className="d-flex justify-content-center align-items-center">
        {(() => {
          if (loading) return <Spinner animation="border" variant="primary" />;
          if (isAuthenticated) return (<div className="d-flex justify-content-center align-items-center"><Spinner animation="border" variant="primary" />&nbsp;<p>Autenticado...Redireccionando</p></div>);
          return (
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Usuario</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  onChange={handleInput}
                  placeholder="ejemplo@yahoo.com"
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, ingrese un usuario válido. Debe contener al menos 6 caracteres.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  onChange={handleInput}
                  placeholder="Ingrese su contraseña"
                />
                <Form.Control.Feedback type="invalid">
                  La contraseña debe tener más de 6 caracteres
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="rememberMe">
                <Form.Check
                  type="checkbox"
                  label="Recordar sesión"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                />
              </Form.Group>
              <div className="d-grid">
                <Button variant="success" type="submit">
                  Iniciar sesión
                </Button>
              </div>
            </Form>
          );
        })()}
      </Row>
    </Container>
  );
};

export default Login;
