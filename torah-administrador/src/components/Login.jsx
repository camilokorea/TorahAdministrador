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
    login(input);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
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
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  onChange={handleInput}
                  placeholder="example@yahoo.com"
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a valid username. It must contain at least 6 characters.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  onChange={handleInput}
                  placeholder="Enter your password"
                />
                <Form.Control.Feedback type="invalid">
                  your password should be more than 6 character
                </Form.Control.Feedback>
              </Form.Group>
              <div className="d-grid">
                <Button variant="primary" type="submit">
                  Login
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
