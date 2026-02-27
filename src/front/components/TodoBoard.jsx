import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const COLUMNS = [
    { key: "PENDING", label: "Pendiente", icon: "fa-clock", color: "#f59e0b", bg: "#fffbeb" },
    { key: "ON_GOING", label: "En Curso", icon: "fa-spinner", color: "#3b82f6", bg: "#eff6ff" },
    { key: "COMPLETED", label: "Completado", icon: "fa-check-circle", color: "#10b981", bg: "#ecfdf5" },
];

// ─── Task Modal ────────────────────────────────────────────────────────────────
const TaskModal = ({ todo, onClose, onSave, onDelete }) => {
    const [form, setForm] = useState({
        title: todo?.title || "",
        description: todo?.description || "",
        status: todo?.status || "PENDING",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(form);
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!window.confirm("¿Eliminar esta tarea?")) return;
        setLoading(true);
        await onDelete();
        setLoading(false);
    };

    const col = COLUMNS.find((c) => c.key === form.status);

    return (
        <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1060 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content task-modal-content">
                    <div
                        className="modal-header task-modal-header"
                        style={{ background: `linear-gradient(135deg, ${col?.color}cc, ${col?.color})` }}
                    >
                        <h5 className="modal-title text-white">
                            <i className={`fas ${col?.icon} me-2`}></i>
                            {todo ? "Editar Tarea" : "Nueva Tarea"}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Título</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    required
                                    disabled={loading}
                                    placeholder="¿Qué hay que hacer?"
                                    autoFocus
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Descripción</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    disabled={loading}
                                    placeholder="Detalles opcionales..."
                                />
                            </div>

                            <div className="mb-1">
                                <label className="form-label fw-semibold">Estado</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {COLUMNS.map((c) => (
                                        <button
                                            key={c.key}
                                            type="button"
                                            className={`btn btn-sm status-chip ${form.status === c.key ? "active" : ""}`}
                                            style={{
                                                background: form.status === c.key ? c.color : "transparent",
                                                color: form.status === c.key ? "#fff" : c.color,
                                                border: `2px solid ${c.color}`,
                                                borderRadius: 20,
                                                fontWeight: 600,
                                            }}
                                            onClick={() => setForm({ ...form, status: c.key })}
                                            disabled={loading}
                                        >
                                            <i className={`fas ${c.icon} me-1`}></i>
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex justify-content-between">
                            {todo ? (
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={handleDelete}
                                    disabled={loading}
                                >
                                    <i className="fas fa-trash me-1"></i>Eliminar
                                </button>
                            ) : (
                                <span />
                            )}
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                                    {loading ? (
                                        <><span className="spinner-border spinner-border-sm me-1"></span>Guardando...</>
                                    ) : (
                                        <><i className="fas fa-save me-1"></i>Guardar</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ─── Task Card ─────────────────────────────────────────────────────────────────
const TaskCard = ({ todo, onOpen, onDragStart, onDragEnd, isDragging }) => {
    const col = COLUMNS.find((c) => c.key === todo.status);

    return (
        <div
            className={`task-card ${isDragging ? "dragging" : ""}`}
            draggable
            onDragStart={(e) => onDragStart(e, todo)}
            onDragEnd={onDragEnd}
            onClick={() => onOpen(todo)}
            title="Clic para editar / Arrastra para mover"
        >
            <div className="task-card-body">
                <h6 className="task-card-title">{todo.title}</h6>
                {todo.description && (
                    <p className="task-card-desc">{todo.description}</p>
                )}
            </div>
            <div className="task-card-footer">
                <span
                    className="task-status-badge"
                    style={{ background: col?.color + "22", color: col?.color }}
                >
                    <i className={`fas ${col?.icon} me-1 small`}></i>
                    {col?.label}
                </span>
                <i className="fas fa-grip-vertical text-muted small drag-handle"></i>
            </div>
        </div>
    );
};

// ─── Column ────────────────────────────────────────────────────────────────────
const BoardColumn = ({ column, todos, onOpenTask, onDropCard, onDragStart, onDragEnd, draggingId }) => {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsOver(true);
    };
    const handleDragLeave = () => setIsOver(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsOver(false);
        onDropCard(column.key);
    };

    return (
        <div
            className={`board-column ${isOver ? "column-drag-over" : ""}`}
            style={{ "--col-color": column.color, "--col-bg": column.bg }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="column-header" style={{ borderBottom: `3px solid ${column.color}` }}>
                <span className="column-title" style={{ color: column.color }}>
                    <i className={`fas ${column.icon} me-2`}></i>
                    {column.label}
                </span>
                <span className="column-count" style={{ background: column.color }}>
                    {todos.length}
                </span>
            </div>
            <div className="column-body">
                {todos.map((todo) => (
                    <TaskCard
                        key={todo.id}
                        todo={todo}
                        onOpen={onOpenTask}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        isDragging={draggingId === todo.id}
                    />
                ))}
                {isOver && draggingId && (
                    <div className="drop-placeholder">
                        <i className="fas fa-arrow-down me-1"></i> Soltar aquí
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Board ────────────────────────────────────────────────────────────────
export const TodoBoard = () => {
    const { store } = useGlobalReducer();
    const [todos, setTodos] = useState([]);
    const [modalTodo, setModalTodo] = useState(undefined); // undefined = closed, null = new, object = edit
    const draggingRef = useRef(null);
    const [draggingId, setDraggingId] = useState(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const token = store.token;

    useEffect(() => {
        if (token) fetchTodos();
    }, [token]);

    const fetchTodos = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/todos`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setTodos(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (form) => {
        const isEdit = modalTodo && modalTodo.id;
        const url = isEdit ? `${backendUrl}/api/todos/${modalTodo.id}` : `${backendUrl}/api/todos`;
        const method = isEdit ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                const saved = await res.json();
                if (isEdit) {
                    setTodos((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
                    toast.success("Tarea actualizada");
                } else {
                    setTodos((prev) => [...prev, saved]);
                    toast.success("Tarea creada");
                }
                setModalTodo(undefined);
            } else {
                toast.error("Error al guardar la tarea");
            }
        } catch (err) {
            toast.error("Error de conexión");
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!modalTodo?.id) return;
        try {
            const res = await fetch(`${backendUrl}/api/todos/${modalTodo.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setTodos((prev) => prev.filter((t) => t.id !== modalTodo.id));
                toast.success("Tarea eliminada");
                setModalTodo(undefined);
            }
        } catch (err) {
            toast.error("Error al eliminar");
            console.error(err);
        }
    };

    const handleDragStart = (e, todo) => {
        draggingRef.current = todo;
        setDraggingId(todo.id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnd = () => {
        draggingRef.current = null;
        setDraggingId(null);
    };

    const handleDropCard = async (targetStatus) => {
        const todo = draggingRef.current;
        // Limpiar estado de drag ANTES del re-render optimista para que
        // el elemento no quede con la clase "dragging" si se desmonta
        draggingRef.current = null;
        setDraggingId(null);

        if (!todo || todo.status === targetStatus) return;

        // Optimistic update
        setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, status: targetStatus } : t)));

        try {
            const res = await fetch(`${backendUrl}/api/todos/${todo.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...todo, status: targetStatus }),
            });
            if (!res.ok) {
                // Revert
                setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)));
                toast.error("Error al actualizar estado");
            }
        } catch {
            setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)));
            toast.error("Error de conexión");
        }
    };

    if (!token) {
        return (
            <div className="alert alert-info">Por favor, inicia sesión para ver tus tareas</div>
        );
    }

    const completed = todos.filter((t) => t.status === "COMPLETED").length;

    return (
        <div className="board-wrapper">
            {/* Header */}
            <div className="board-header">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="mb-0">
                            <i className="fas fa-columns me-2"></i>Mis Tareas
                        </h4>
                        <small className="opacity-75">
                            {completed} de {todos.length} completadas
                            {todos.length > 0 && ` · ${Math.round((completed / todos.length) * 100)}%`}
                        </small>
                    </div>
                    <button
                        className="btn btn-light btn-sm fw-semibold rounded-pill px-3"
                        onClick={() => setModalTodo(null)}
                    >
                        <i className="fas fa-plus me-1"></i>Nueva Tarea
                    </button>
                </div>
                {todos.length > 0 && (
                    <div className="progress mt-2" style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.3)" }}>
                        <div
                            className="progress-bar bg-white"
                            style={{ width: `${(completed / todos.length) * 100}%`, borderRadius: 4 }}
                        />
                    </div>
                )}
            </div>

            {/* Board */}
            <div className="board-columns">
                {COLUMNS.map((col) => (
                    <BoardColumn
                        key={col.key}
                        column={col}
                        todos={todos.filter((t) => t.status === col.key)}
                        onOpenTask={(todo) => setModalTodo(todo)}
                        onDropCard={handleDropCard}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        draggingId={draggingId}
                    />
                ))}
            </div>

            {todos.length === 0 && (
                <div className="text-center text-muted py-5">
                    <i className="fas fa-inbox fa-3x mb-3 d-block"></i>
                    <p>No tienes tareas. ¡Crea una nueva para empezar!</p>
                </div>
            )}

            {/* Modal */}
            {modalTodo !== undefined && (
                <TaskModal
                    todo={modalTodo}
                    onClose={() => setModalTodo(undefined)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};
