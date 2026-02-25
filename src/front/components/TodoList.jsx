import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const TodoList = () => {
    const { store } = useGlobalReducer();
    const [todos, setTodos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingTodo, setEditingTodo] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '' });

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const token = store.token;

    useEffect(() => {
        if (token) {
            fetchTodos();
        }
    }, [token]);

    const fetchTodos = async () => {
        try {
            const response = await fetch(backendUrl + '/api/todos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTodos(data);
            }
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
    };

    const handleCreateTodo = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(backendUrl + '/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const newTodo = await response.json();
                setTodos([...todos, newTodo]);
                setFormData({ title: '', description: '' });
                setShowModal(false);
                toast.success('Todo creado exitosamente');
            }
        } catch (error) {
            toast.error('Error al crear el todo');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateTodo = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(backendUrl + `/api/todos/${editingTodo.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedTodo = await response.json();
                setTodos(todos.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo));
                setFormData({ title: '', description: '' });
                setEditingTodo(null);
                setShowModal(false);
                toast.success('Todo actualizado exitosamente');
            }
        } catch (error) {
            toast.error('Error al actualizar el todo');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTodo = async (todoId) => {
        if (!window.confirm('¿Estás seguro de eliminar este todo?')) return;

        try {
            const response = await fetch(backendUrl + `/api/todos/${todoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setTodos(todos.filter(todo => todo.id !== todoId));
                toast.success('Todo eliminado exitosamente');
            }
        } catch (error) {
            toast.error('Error al eliminar el todo');
            console.error(error);
        }
    };

    const handleToggleComplete = async (todo) => {
        try {
            const response = await fetch(backendUrl + `/api/todos/${todo.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...todo, is_completed: !todo.is_completed })
            });

            if (response.ok) {
                const updatedTodo = await response.json();
                setTodos(todos.map(t => t.id === updatedTodo.id ? updatedTodo : t));
            }
        } catch (error) {
            toast.error('Error al actualizar el todo');
            console.error(error);
        }
    };

    const openCreateModal = () => {
        setEditingTodo(null);
        setFormData({ title: '', description: '' });
        setShowModal(true);
    };

    const openEditModal = (todo) => {
        setEditingTodo(todo);
        setFormData({ title: todo.title, description: todo.description });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTodo(null);
        setFormData({ title: '', description: '' });
    };

    if (!token) {
        return (
            <div className="alert alert-info">
                Por favor, inicia sesión para ver tus tareas
            </div>
        );
    }

    return (
        <div className="container-content">
            <div className="todo-header-bar">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h4>
                            <i className="fas fa-list-check me-2"></i>
                            Mis Tareas
                        </h4>
                        <div className="todo-stats">
                            {todos.filter(t => t.is_completed).length} de {todos.length} completadas
                            {todos.length > 0 && (
                                <span className="ms-2">
                                    · {Math.round((todos.filter(t => t.is_completed).length / todos.length) * 100)}% listo
                                </span>
                            )}
                        </div>
                    </div>
                    <button className="btn btn-light btn-sm fw-semibold" onClick={openCreateModal}>
                        <i className="fas fa-plus me-1"></i>
                        Nueva Tarea
                    </button>
                </div>
                {todos.length > 0 && (
                    <div className="progress mt-2" style={{ height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' }}>
                        <div
                            className="progress-bar bg-white"
                            style={{ width: `${(todos.filter(t => t.is_completed).length / todos.length) * 100}%`, borderRadius: 4 }}
                        />
                    </div>
                )}
            </div>

            <div className="todo-body">
                {todos.length === 0 ? (
                    <div className="alert alert-info mb-0 mt-2">
                        <i className="fas fa-info-circle me-2"></i>
                        No tienes tareas. ¡Crea una nueva!
                    </div>
                ) : (
                    <div className="todos-container">
                        <div className="list-group">
                            {todos.map(todo => (
                                <div key={todo.id} className={`list-group-item ${todo.is_completed ? 'todo-item-completed' : ''}`}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={todo.is_completed}
                                                    onChange={() => handleToggleComplete(todo)}
                                                />
                                                <label className="form-check-label">
                                                    <h6 className={`mb-1 todo-item-title ${todo.is_completed ? 'completed' : ''}`}>
                                                        {todo.title}
                                                    </h6>
                                                </label>
                                            </div>
                                            {todo.description && (
                                                <p className="mb-0 text-muted small ms-4">{todo.description}</p>
                                            )}
                                        </div>
                                        <div className="btn-group">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => openEditModal(todo)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeleteTodo(todo.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingTodo ? 'Editar Tarea' : 'Nueva Tarea'}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <form onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="title" className="form-label">Título</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">Descripción</label>
                                        <textarea
                                            className="form-control"
                                            id="description"
                                            rows="3"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                        {isLoading ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
