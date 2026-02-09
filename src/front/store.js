export const initialStore = () => {
  return {
    message:
      "Loading message from the backend (make sure your python 🐍 backend is running)...",
    token: null,
    favorites: [],
    shopingCart: [],
    user: {
      name: "Invitado",
      photo: "",
    },
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };

    default:
      throw Error("Unknown action.");
  }
}
