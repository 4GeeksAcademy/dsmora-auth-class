import { useEffect, useState } from "react"


export const NewPage = () => {

    const [state, setState] = useState(0);

    useEffect(() => { console.log('hola mundo') }, [state])

    return (
        <div className="container-fluid">
            <h1>New Page {state}</h1>
            <button className="btn btn-primary" onClick={() => setState(state + 1)}>+</button>
        </div>
    )
}