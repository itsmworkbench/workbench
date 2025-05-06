import {LoopbackTransport} from "@mcp-extras/loopback";

export const sqlClientTransport = new LoopbackTransport({ name : 'client'});
export const emailClientTransport = new LoopbackTransport({ name : 'client'});

export const emailServerTransport = new LoopbackTransport({ name : 'server'});
export const sqlServerTransport = new LoopbackTransport({ name : 'server'});

emailClientTransport.connect(emailServerTransport);
sqlClientTransport.connect(sqlServerTransport);

