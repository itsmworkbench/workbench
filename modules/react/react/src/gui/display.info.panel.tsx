import { DisplayMarkdown } from "@itsmworkbench/components";
import React from "react";
import { ItsmState } from "../state/itsm.state";
import { LensProps } from "@focuson/state";
import { DisplayYaml, useVariables, useYaml } from "@itsmworkbench/components";

export function DisplayInfoPanel<S> ( { state }: LensProps<S, ItsmState, any> ) {
  const variables: any = useVariables ()
  const yamlCapability = useYaml ()
  const yaml = yamlCapability.writer ( variables )
  return <div>
    <DisplayMarkdown md={state.optJson ()?.forTicket?.ticket?.description || state.optJson ()?.forTicket?.tempData?.newTicket?.ticketDetails || '<No Ticket>'}/>
    <pre>{yaml}</pre>
  </div>
}