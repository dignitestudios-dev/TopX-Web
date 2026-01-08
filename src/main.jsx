import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import "typeface-poppins";
import { ToasterContainer } from "./components/global/Toaster.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store.jsx";
import { SocketProvider } from "./context/SocketContext";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <SocketProvider>
          <App />
        </SocketProvider>
      </Provider>
    </BrowserRouter>
      <ToasterContainer />
  </StrictMode>
);
