import React, { useState } from "react";
import { TodoList } from "../components/TodoList.jsx";
import { AuthModal } from "../components/RegisterForm.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
	const { store } = useGlobalReducer();
	const { user } = store;

	const [showAuthModal, setShowAuthModal] = useState(false);
	const [authType, setAuthType] = useState('login');

	const openAuth = (type) => {
		setAuthType(type);
		setShowAuthModal(true);
	};

	return (
		<div className="home-wrapper">
			{user ? (
				<div className="todo-wrapper">
					<TodoList />
				</div>
			) : (
				<div className="landing-wrapper">
					<div className="text-center px-3">
						<i className="fas fa-tasks fa-4x text-primary mb-3 d-block"></i>
						<h1 className="fw-bold text-dark mb-2">TodoMaster</h1>
						<p className="lead text-muted mb-4">
							Organiza tus tareas, alcanza tus metas.<br />
							Simple, rápido y eficiente.
						</p>

						<div className="row g-3 justify-content-center" style={{ maxWidth: 600, margin: '0 auto' }}>
							<div className="col-4">
								<div className="feature-card">
									<i className="fas fa-list-check mb-2 text-primary"></i>
									<h6>Organiza</h6>
									<p className="text-muted small mb-0">Crea y gestiona tus tareas</p>
								</div>
							</div>
							<div className="col-4">
								<div className="feature-card">
									<i className="fas fa-clock mb-2 text-success"></i>
									<h6>Ahorra Tiempo</h6>
									<p className="text-muted small mb-0">Control de pendientes</p>
								</div>
							</div>
							<div className="col-4">
								<div className="feature-card">
									<i className="fas fa-chart-line mb-2 text-info"></i>
									<h6>Productivo</h6>
									<p className="text-muted small mb-0">Alcanza tus objetivos</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			<AuthModal
				show={showAuthModal}
				onClose={() => setShowAuthModal(false)}
				type={authType}
			/>

			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				closeOnClick
				draggable
				pauseOnHover
			/>
		</div>
	);
};
