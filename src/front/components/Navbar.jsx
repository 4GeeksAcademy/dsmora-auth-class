import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { AuthModal } from "./RegisterForm.jsx";

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();
	const { user } = store;
	const navigate = useNavigate();

	const [showAuthModal, setShowAuthModal] = useState(false);
	const [authType, setAuthType] = useState("login");

	const openAuth = (type) => {
		setAuthType(type);
		setShowAuthModal(true);
	};

	const handleLogout = () => {
		dispatch({ type: "logout" });
	};

	return (
		<>
			<nav className="navbar navbar-expand-lg navbar-dark bg-gradient-primary shadow-sm">
				<div className="container">
					<Link className="navbar-brand d-flex align-items-center" to="/">
						<i className="fas fa-tasks me-2"></i>
						<span className="fw-bold">TodoMaster</span>
					</Link>

					<div className="ms-auto d-flex align-items-center gap-2">
						{user ? (
							<>
								<button
									className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 rounded-pill px-3"
									onClick={() => navigate("/profile")}
								>
									{user.image ? (
										<img
											src={user.image}
											alt="avatar"
											className="rounded-circle"
											style={{ width: 28, height: 28, objectFit: "cover" }}
										/>
									) : (
										<i className="fas fa-user-circle"></i>
									)}
									<span className="d-none d-md-inline">{user.email}</span>
								</button>
								<button
									className="btn btn-danger btn-sm rounded-pill px-3"
									onClick={handleLogout}
									title="Cerrar sesión"
								>
									<i className="fas fa-sign-out-alt"></i>
									<span className="d-none d-md-inline ms-1">Salir</span>
								</button>
							</>
						) : (
							<>
								<button
									className="btn btn-outline-light btn-sm rounded-pill px-3"
									onClick={() => openAuth("login")}
								>
									<i className="fas fa-sign-in-alt me-1"></i>Entrar
								</button>
								<button
									className="btn btn-light btn-sm rounded-pill px-3"
									onClick={() => openAuth("register")}
								>
									<i className="fas fa-user-plus me-1"></i>Registrarse
								</button>
							</>
						)}
					</div>
				</div>
			</nav>

			{/* Auth Modal */}
			<AuthModal
				show={showAuthModal}
				onClose={() => setShowAuthModal(false)}
				type={authType}
			/>
		</>
	);
};
