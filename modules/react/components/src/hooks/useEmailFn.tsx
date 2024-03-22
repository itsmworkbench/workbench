import React, { useContext } from "react";
import { EmailFn } from "@itsmworkbench/mailer";


export interface EmailFnProviderProps {
  emailFn: EmailFn
  children: React.ReactNode;
}
export const EmailFnContext = React.createContext<EmailFn | undefined> ( undefined );
export function EmailFnProvider ( { children, emailFn }: EmailFnProviderProps ) {
  return <EmailFnContext.Provider value={emailFn}> {children} </EmailFnContext.Provider>;
}

// Hook for consuming the service
export function useEmailFn (): EmailFn {
  const context = useContext ( EmailFnContext );
  if ( context === undefined ) {
    throw new Error ( "useEmailFn must be used within a EmailFnProvider" );
  }
  console.log('useEmailFn', context)
  return context;
}
