import React, { useState, useEffect } from "react"
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {

	const { dispatch } = useGlobalReducer()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [registerMessage, setRegisterMessage] = useState("")

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}

	}

	const handleRegister = async (e) => {
		e.preventDefault()
		setRegisterMessage("")

		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ email, password })
			})

			const data = await response.json()

			if (response.ok) {
				setRegisterMessage("Usuario registrado exitosamente!")
				setEmail("")
				setPassword("")
			} else {
				setRegisterMessage(data.message || "Error al registrar usuario")
			}

		} catch (error) {
			setRegisterMessage("Error: no se pudo conectar con el backend")
			console.error(error)
		}
	}

	useEffect(() => {
		loadMessage()
	}, [])

	return (
		<div className="container-main">
			<div className="container-content mt-4">
				<h2>Registro de Usuario</h2>
				<form onSubmit={handleRegister} className="mt-3">
					<div className="mb-3">
						<label htmlFor="email" className="form-label">Email</label>
						<input
							type="email"
							className="form-control"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							placeholder="tu@email.com"
						/>
					</div>
					<div className="mb-3">
						<label htmlFor="password" className="form-label">Password</label>
						<input
							type="password"
							className="form-control"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							placeholder="Tu password"
							minLength="6"
						/>
					</div>
					<button type="submit" className="btn btn-primary">Registrar</button>
				</form>
				{registerMessage && (
					<div className={`alert mt-3 ${registerMessage.includes("exitosamente") ? "alert-success" : "alert-danger"}`}>
						{registerMessage}
					</div>
				)}
			</div>
		</div>
	);
}; 