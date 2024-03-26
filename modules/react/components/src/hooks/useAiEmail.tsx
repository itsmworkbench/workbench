import React, { useContext } from "react";
import { AIEmailsFn } from "@itsmworkbench/ai";


export interface AiEmailServiceProps {
  aiEmail: AIEmailsFn
  children: React.ReactNode;

}
export const AiEmailContext = React.createContext<AIEmailsFn | undefined> ( undefined );
export function AiEmailProvider ( { children, aiEmail }: AiEmailServiceProps ) {
  return <AiEmailContext.Provider value={aiEmail}> {children} </AiEmailContext.Provider>;
}

// Hook for consuming the service
export function useAiEmail (): AIEmailsFn {
  const context = useContext ( AiEmailContext );
  if ( context === undefined ) {
    throw new Error ( "useAiEmail must be used within a AiEmailProvider" );
  }
  return context;
}
