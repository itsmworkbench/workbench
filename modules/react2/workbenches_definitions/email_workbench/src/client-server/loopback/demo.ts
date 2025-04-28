// import React, { Dispatch, SetStateAction, useContext, useState } from "react";
// import { McpClient, McpServer, Transport } from "./your-mcp-types"; // Adjust import paths as needed
//
// // ----- Types -----
// type IMcpFacard = {
//     client1: McpClient; // or a nice function
//     client2: McpClient;
// };
//
// export type Setter<T> = Dispatch<SetStateAction<T>>;
// export type GetterSetter<T> = [T, Setter<T>];
//
// // ----- Context -----
// const McpFacardContext = React.createContext<GetterSetter<IMcpFacard> | undefined>(undefined);
//
// // ----- Factories -----
// type ClientServer = {
//     client: McpClient;
//     server: McpServer;
// };
//
// type ClientServerMaker = (t: Transport) => ClientServer;
//
// const forClient1: ClientServerMaker = (transport: Transport) => {
//     // Your actual implementation here
//     return { client: /*...*/, server: /*...*/ };
// };
//
// const forClient2: ClientServerMaker = (transport: Transport) => {
//     // Your actual implementation here
//     return { client: /*...*/, server: /*...*/ };
// };
//
// function createMcpFacard(transport: Transport): IMcpFacard {
//     const { client: client1 } = forClient1(transport);
//     const { client: client2 } = forClient2(transport);
//     return { client1, client2 };
// }
//
// // ----- Provider -----
// type McpFacardProviderProps = {
//     children: React.ReactNode;
//     transportFn: () => Transport;
// };
//
// function McpFacardProvider({ children, transportFn }: McpFacardProviderProps) {
//     const ops: GetterSetter<IMcpFacard> = useState<IMcpFacard>(() => createMcpFacard(transportFn()));
//
//     return (
//         <McpFacardContext.Provider value={ops}>
//             {children}
//             </McpFacardContext.Provider>
//     );
// }
//
// // ----- Hooks -----
// function useMcpFacardOps(): GetterSetter<IMcpFacard> {
//     const context = useContext(McpFacardContext);
//     if (context === undefined) {
//         throw new Error("useMcpFacard must be used within a McpFacardProvider");
//     }
//     return context;
// }
//
// function useMcpFacard(): IMcpFacard {
//     const [facard] = useMcpFacardOps();
//     return facard;
// }
//
// // ----- Usage in index.tsx -----
// /*
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import { McpFacardProvider } from "./McpFacardProvider"; // Adjust path
//
// const root = ReactDOM.createRoot(document.getElementById("root")!);
// root.render(
//   <McpFacardProvider transportFn={defaultTransport}>
//     <App />
//   </McpFacardProvider>
// );
// */
//
// // Inside App.tsx or any child component:
// /*
// const { client1 } = useMcpFacard();
// */
//
// export {
//     McpFacardProvider,
//     useMcpFacard,
//     useMcpFacardOps,
// };
//
