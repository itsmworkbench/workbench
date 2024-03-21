import { DisplayMarkdown } from "@itsmworkbench/components";
import React from "react";
import { ItsmState } from "../state/itsm.state";
import { LensProps } from "@focuson/state";
import { DisplayYaml, useVariables, useYaml } from "@itsmworkbench/components";
import { deepCombineTwoObjects } from "@laoban/utils";

export function DisplayInfoPanel<S> ( { state }: LensProps<S, ItsmState, any> ) {
  const variables: any = useVariables ()
  const yamlCapability = useYaml ()
  const ticket = state.optJson ()?.forTicket?.ticket;
  console.log('DisplayInfoPanel - ticket', ticket)
  const description = ticket?.description || state.optJson ()?.forTicket?.tempData?.newTicket?.ticketDetails
  const attributes = deepCombineTwoObjects ( ticket?.attributes || {}, variables )
  const yaml = yamlCapability.writer ( attributes )
  return <div>
    <DisplayMarkdown md={description}/>
    <pre>{yaml}</pre>
  </div>
}