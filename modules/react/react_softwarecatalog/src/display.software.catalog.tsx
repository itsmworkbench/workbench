import React from "react";
import { LensProps2 } from "@focuson/state";
import { DisplayYaml, DropdownAsTitle } from "@itsmworkbench/components";
import { SideEffect } from "@itsmworkbench/react_core";
import { SoftwareCatalogs } from "@itsmworkbench/softwarecatalog";


export function DisplaySoftwareCatalogs<S> ( { state, path }: LensProps2<S, SoftwareCatalogs, SideEffect[], any> &{path:string}) {
  return <DropdownAsTitle state={state} path={path} purpose='Software Catalog'>{
    state =>  <DisplayYaml yamlContent={state.optJson()}/>
  }</DropdownAsTitle>
}