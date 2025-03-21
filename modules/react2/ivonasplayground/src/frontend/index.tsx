import React from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from 'react-toastify';
import SQLExecutor from "./components/SQLExecutor";

const container = document.getElementById("root");

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <SQLExecutor />
            <ToastContainer />
        </React.StrictMode>
    );
} else {
    console.error("Root container not found!");
}
