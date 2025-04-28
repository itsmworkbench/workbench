import { LoopbackTransport } from "./loopbackTransport";

export const clientTransport = new LoopbackTransport('client');
export const serverTransport = new LoopbackTransport('server');

clientTransport.connect(serverTransport);

