
import { TextEncoder, TextDecoder } from "util";

function getDocDefinedBecauseInNodeJestEnvironemnt() {
    try {
        return document !== undefined;
    } catch (e) {
        return false;
    }
}

if (getDocDefinedBecauseInNodeJestEnvironemnt()) {
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
}

Object.defineProperty(window, 'crypto', {   get() {     return require('crypto');   }, })

Object.assign(global, { TextDecoder, TextEncoder });``