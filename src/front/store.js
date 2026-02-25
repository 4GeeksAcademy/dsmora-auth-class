export const initialStore = () => {
  return {
    message: "Loading message from the backend...",
    token: localStorage.getItem("token") || null,
    user: null,
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return { ...store, message: action.payload };

    case "set_user":
      return { ...store, user: action.payload };

    case "set_token":
      localStorage.setItem("token", action.payload);
      return { ...store, token: action.payload };

    case "logout":
      localStorage.removeItem("token");
      return { ...store, token: null, user: null };

    default:
      throw Error("Unknown action: " + action.type);
  }
}
