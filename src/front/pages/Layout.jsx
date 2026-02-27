import { useEffect } from "react"
import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx"

export const Layout = () => {
    const { store, dispatch } = useGlobalReducer()

    // Re-hydrate user from token on page load/refresh
    useEffect(() => {
        const token = store.token
        if (token && !store.user) {
            const backendUrl = import.meta.env.VITE_BACKEND_URL
            fetch(backendUrl + "/api/me", {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.ok ? res.json() : Promise.reject())
                .then(user => dispatch({ type: "set_user", payload: user }))
                .catch(() => dispatch({ type: "logout" }))
        }
    }, [])

    return (
        <ScrollToTop>
            <div className="app-shell">
                <Navbar />
                <main className="app-main">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </ScrollToTop>
    )
}