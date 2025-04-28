import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import {server} from "./src/client-server/mcpServer.ts";
import {serverTransport} from "./src/client-server/loopback/loopbackConnection.ts";

server.connect(serverTransport);
console.log("The server trannsport is this: ", serverTransport);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);

