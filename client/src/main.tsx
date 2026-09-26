import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import { registerSW } from "virtual:pwa-register";

import App from "./App";
import "./styles/global.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#b8892d",
            borderRadius: 10,
            fontFamily: "Inter, Arial, sans-serif",
          },
        }}
      >
        <AuthProvider>
          <CartProvider>
          <WishlistProvider>
      <App />
    </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);