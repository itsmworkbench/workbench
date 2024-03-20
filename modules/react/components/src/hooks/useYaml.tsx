import React, { useContext } from "react";
import { AIEmailsFn } from "@itsmworkbench/ai_ticketvariables";
import { YamlCapability } from "@itsmworkbench/yaml";



export const YamlContext = React.createContext<YamlCapability | undefined> ( undefined );

export interface YamlProviderProps {
  yamlCapability: YamlCapability
  children: React.ReactNode
}
export function YamlProvider ( { children, yamlCapability }: YamlProviderProps ) {
  return <YamlContext.Provider value={yamlCapability}> {children} </YamlContext.Provider>;
}

// Hook for consuming the service
export function useYaml (): YamlCapability {
  const context = useContext ( YamlContext );
  if ( context === undefined ) {
    throw new Error ( "useYaml must be used within a YamlProvider" );
  }
  return context;
}
