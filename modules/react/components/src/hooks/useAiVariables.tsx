
import React, { useContext } from "react";
import { AiTicketVariablesFn } from "@itsmworkbench/ai";


export interface AiVariablesServiceProps {
  aiVariables: AiTicketVariablesFn
  children: React.ReactNode;

}
export const AiVariablesContext = React.createContext<AiTicketVariablesFn | undefined> ( undefined );
export function AiVariablesProvider ( { children, aiVariables }: AiVariablesServiceProps ) {
  return <AiVariablesContext.Provider value={aiVariables}> {children} </AiVariablesContext.Provider>;
}

// Hook for consuming the service
export function useAiVariables (): AiTicketVariablesFn {
  const context = useContext ( AiVariablesContext );
  if ( context === undefined ) {
    throw new Error ( "useAiVariables must be used within a AiVariablesProvider" );
  }
  return context;
}
