import React from "react";
import { LensProps, LensProps2 } from "@focuson/state";
import { SideEffect } from '@itsmworkbench/react_core';
import { DisplayText, DropdownAsTitle } from "@itsmworkbench/components";
import { Template, Templates } from "@itsmworkbench/templates";


export function DisplayTemplate<S> ( { state }: LensProps<S, Template, any> ) {
  const template = state.json ()
  return <DisplayText text={template.template}/>
}
export function DisplayTemplates<S> ( { path, state }: LensProps2<S, Templates, SideEffect[], any> & { path: string } ) {
  return <DropdownAsTitle path={path} state={state} purpose='Template'>{
    state => <DisplayTemplate state={state}/>
  }</DropdownAsTitle>
}