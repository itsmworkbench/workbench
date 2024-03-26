import React, { useContext } from "react";
import { AI, AIEmailsFn, AIKnownTicketVariablesFn, AiTicketVariablesFn } from "@itsmworkbench/ai";


export interface AIServiceProps {
  ai: AI
  children: React.ReactNode;
}
export const AIContext = React.createContext<AI | undefined> ( undefined );
export function AIProvider ( { children, ai }: AIServiceProps ) {
  return <AIContext.Provider value={ai}> {children} </AIContext.Provider>;
}

// Hook for consuming the service
export function useAI (): AI {
  const context = useContext ( AIContext );
  if ( context === undefined ) {
    throw new Error ( "useAI must be used within a AIProvider" );
  }
  return context;
}
export function useAiEmail (): AIEmailsFn {
  return useAI ().emails;
}
export function useAiVariables (): AiTicketVariablesFn {
  return useAI ().variables
}
export function useAiKnownVariables (): AIKnownTicketVariablesFn {
  return useAI ().knownVariables
}