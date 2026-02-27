import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { ProfileImageUploader } from "../components/ProfileImageUploader.jsx";
import { toast } from "react-toastify";

const COLUMNS = [
    { key: "PENDING", label: "Pendiente", icon: "fa-clock", color: "#f59e0b" },
    { key: "ON_GOING", label: "En Curso", icon: "fa-spinner", color: "#3b82f6" },
    { key: "COMPLETED", label: "Completado", icon: "fa-check-circle", color: "#10b981" },
];

export const Profile = () => {
    const { store, dispatch } = useGlobalReducer();
    const { user, token } = store;
    const navigate = useNavigate();
    const [todos, setTodos] = useState([]);
    const [loadingTodos, setLoadingTodos] = useState(false);
    const [editEmail, setEditEmail] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ password: "", new_password: "", confirm: "" });
    const [savingPwd, setSavingPwd] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }
        fetchTodos();
    }, [token]);

    const fetchTodos = async () => {
        setLoadingTodos(true);
        try {
            const res = await fetch(`${backendUrl}/api/todos`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setTodos(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingTodos(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.confirm) {
            toast.error("Las contraseñas no coinciden");
            return;
        }
        setSavingPwd(true);
        try {
            const res = await fetch(`${backendUrl}/api/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    password: passwordForm.password,
                    new_password: passwordForm.new_password,
                }),
            });
            if (res.ok) {
                toast.success("Contraseña actualizada");
                setPasswordForm({ password: "", new_password: "", confirm: "" });
            } else {
                const data = await res.json();
                toast.error(data.message || "Error al cambiar contraseña");
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setSavingPwd(false);
        }
    };

    const countByStatus = (status) => todos.filter((t) => t.status === status).length;

    if (!user) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status" />
            </div>
        );
    }

    return (
        <div className="profile-page">
            {/* Hero */}
            <div className="profile-hero">
                <div className="profile-avatar-section">
                    <ProfileImageUploader size={110} />
                    <div>
                        <h3 className="mb-1 text-white">{user.email}</h3>
                        <span className="badge bg-success">
                            <i className="fas fa-shield-alt me-1"></i>Cuenta activa
                        </span>
                    </div>
                </div>
            </div>

            <div className="profile-body container py-4">
                {/* Stats */}
                <div className="row g-3 mb-4">
                    <div className="col-12">
                        <h5 className="fw-bold mb-3">
                            <i className="fas fa-chart-bar me-2 text-primary"></i>Resumen de tareas
                        </h5>
                    </div>
                    {COLUMNS.map((col) => (
                        <div className="col-sm-4" key={col.key}>
                            <div className="stat-card" style={{ borderTop: `4px solid ${col.color}` }}>
                                {loadingTodos ? (
                                    <div className="spinner-border spinner-border-sm" style={{ color: col.color }} />
                                ) : (
                                    <div className="stat-number" style={{ color: col.color }}>
                                        {countByStatus(col.key)}
                                    </div>
                                )}
                                <div className="stat-label">
                                    <i className={`fas ${col.icon} me-1`} style={{ color: col.color }}></i>
                                    {col.label}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Progress bar total */}
                    {todos.length > 0 && (
                        <div className="col-12">
                            <div className="card border-0 shadow-sm p-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <small className="fw-semibold">Progreso total</small>
                                    <small className="text-muted">
                                        {countByStatus("COMPLETED")}/{todos.length} completadas
                                    </small>
                                </div>
                                <div className="progress" style={{ height: 10, borderRadius: 10 }}>
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${(countByStatus("COMPLETED") / todos.length) * 100}%`,
                                            background: "linear-gradient(135deg, #10b981, #3b82f6)",
                                            borderRadius: 10,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Account info */}
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <h6 className="card-title fw-bold mb-3">
                                    <i className="fas fa-user me-2 text-primary"></i>Información de la cuenta
                                </h6>
                                <div className="mb-2">
                                    <small className="text-muted">Correo electrónico</small>
                                    <p className="mb-0 fw-semibold">{user.email}</p>
                                </div>
                                <div className="mb-2">
                                    <small className="text-muted">Estado</small>
                                    <p className="mb-0">
                                        <span className="badge bg-success-subtle text-success">Activo</span>
                                    </p>
                                </div>
                                <div>
                                    <small className="text-muted">Tareas totales</small>
                                    <p className="mb-0 fw-semibold">{todos.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <h6 className="card-title fw-bold mb-3">
                                    <i className="fas fa-lock me-2 text-warning"></i>Cambiar contraseña
                                </h6>
                                <form onSubmit={handleChangePassword}>
                                    <div className="mb-2">
                                        <input
                                            type="password"
                                            className="form-control form-control-sm"
                                            placeholder="Contraseña actual"
                                            value={passwordForm.password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <input
                                            type="password"
                                            className="form-control form-control-sm"
                                            placeholder="Nueva contraseña"
                                            value={passwordForm.new_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <input
                                            type="password"
                                            className="form-control form-control-sm"
                                            placeholder="Confirmar nueva contraseña"
                                            value={passwordForm.confirm}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-warning btn-sm w-100"
                                        disabled={savingPwd}
                                    >
                                        {savingPwd ? (
                                            <><span className="spinner-border spinner-border-sm me-1"></span>Guardando...</>
                                        ) : (
                                            <><i className="fas fa-save me-1"></i>Cambiar contraseña</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
