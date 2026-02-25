import React, { useState } from "react";
import { toast } from 'react-toastify';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const AuthModal = ({ show, onClose, type = 'register' }) => {
    const { dispatch } = useGlobalReducer();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const errorMessages = {
        USER_ALREADY_EXISTS: "El usuario ya existe",
        BAD_REQUEST: "Email y password son requeridos",
        AUTH_ERROR: "Credenciales incorrectas",
        SERVER_ERROR: "Error del servidor"
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file");

            const endpoint = type === 'login' ? '/api/login' : '/api/register';
            const response = await fetch(backendUrl + endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (type === 'login') {
                    dispatch({ type: "set_token", payload: data.token });
                    dispatch({ type: "set_user", payload: data.user });
                    toast.success("¡Bienvenido de vuelta!");
                } else {
                    toast.success("¡Registro exitoso! Ahora inicia sesión.");
                }
                setEmail("");
                setPassword("");
                onClose();
            } else {
                toast.error(errorMessages[data.code_error] || errorMessages['SERVER_ERROR']);
            }

        } catch (error) {
            toast.error(errorMessages['SERVER_ERROR']);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className={`fas ${type === 'login' ? 'fa-sign-in-alt' : 'fa-user-plus'} me-2`}></i>
                            {type === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="tu@email.com"
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Mínimo 8 caracteres"
                                    minLength="8"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading
                                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</>
                                    : (type === 'login' ? 'Iniciar Sesión' : 'Registrarse')
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
