import React, { useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { AuthModal } from "./RegisterForm.jsx";
import { ProfileImageUploader } from "./ProfileImageUploader.jsx";

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();
	const { user } = store;

	const [showProfileModal, setShowProfileModal] = useState(false);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [authType, setAuthType] = useState("login");

	const openAuth = (type) => {
		setAuthType(type);
		setShowAuthModal(true);
	};

	const handleLogout = () => {
		dispatch({ type: "logout" });
		setShowProfileModal(false);
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
							<button
								className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 rounded-pill px-3"
								onClick={() => setShowProfileModal(true)}
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
								<i className="fas fa-chevron-down small"></i>
							</button>
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

			{/* Profile Modal */}
			{showProfileModal && (
				<div
					className="modal show d-block"
					tabIndex="-1"
					style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
					onClick={(e) => e.target === e.currentTarget && setShowProfileModal(false)}
				>
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">
									<i className="fas fa-user-circle me-2"></i>Mi Perfil
								</h5>
								<button
									type="button"
									className="btn-close"
									onClick={() => setShowProfileModal(false)}
								></button>
							</div>
							<div className="modal-body text-center py-4">
								<ProfileImageUploader />
								<h5 className="mt-3 mb-1">{user?.email}</h5>
								<p className="text-muted small">
									<i className="fas fa-shield-alt me-1"></i>
									Cuenta activa
								</p>
							</div>
							<div className="modal-footer justify-content-center">
								<button
									className="btn btn-danger rounded-pill px-4"
									onClick={handleLogout}
								>
									<i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Auth Modal */}
			<AuthModal
				show={showAuthModal}
				onClose={() => setShowAuthModal(false)}
				type={authType}
			/>
		</>
	);
};
