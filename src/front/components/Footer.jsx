export const Footer = () => (
	<footer className="footer py-3 bg-dark text-white">
		<div className="container">
			<div className="row align-items-center">
				<div className="col-md-4 mb-2 mb-md-0">
					<h6 className="mb-1">
						<i className="fas fa-tasks me-2"></i>
						TodoMaster
					</h6>
					<p className="text-muted small mb-0">
						Gestiona tus tareas eficientemente.
					</p>
				</div>
				<div className="col-md-4 mb-2 mb-md-0 text-center">
					<small className="text-muted">
						© {new Date().getFullYear()} TodoMaster. Todos los derechos reservados.
					</small>
				</div>
				<div className="col-md-4 text-md-end">
					<div className="d-flex gap-3 justify-content-md-end justify-content-center">
						<a href="#" className="text-muted">
							<i className="fab fa-github"></i>
						</a>
						<a href="#" className="text-muted">
							<i className="fab fa-twitter"></i>
						</a>
						<a href="#" className="text-muted">
							<i className="fab fa-linkedin"></i>
						</a>
						<a href="#" className="text-muted">
							<i className="fab fa-instagram"></i>
						</a>
					</div>
				</div>
			</div>
		</div>
	</footer>
);
