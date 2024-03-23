import React, { useContext } from "react";
import { Mailer } from "@itsmworkbench/mailer";


export interface MailerProviderProps {
  mailer: Mailer
  children: React.ReactNode;
}
export const MailerContext = React.createContext<Mailer | undefined> ( undefined );
export function MailerProvider ( { children, mailer }: MailerProviderProps ) {
  return <MailerContext.Provider value={mailer}> {children} </MailerContext.Provider>;
}

// Hook for consuming the service
export function useMailer (): Mailer {
  const context = useContext ( MailerContext );
  if ( context === undefined ) {
    throw new Error ( "useMailer must be used within a MailerProvider" );
  }
  console.log('useMailer', context)
  return context;
}
