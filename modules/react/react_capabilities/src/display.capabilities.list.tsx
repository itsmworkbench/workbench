import React from "react";
import { LensProps2 } from "@focuson/state";
import { Capability } from "@itsmworkbench/domain";
import { List, ListItem, ListItemText } from "@mui/material";
import { TabPhaseAndActionSelectionState, workbenchName } from "@itsmworkbench/react_core";

export interface DisplayCapabilitiesListProps<S> extends LensProps2<S, Capability[], TabPhaseAndActionSelectionState, any> {
}
export function DisplayCapabilitiesList<S> ( { state }: DisplayCapabilitiesListProps<S> ) {
  const capabilities = state.state1 ().optJson () || [];
  const selectedTab = state.state2 ().optJson ()
  return (
    <List>
      {capabilities.map ( ( c, index ) => {
        const isSelected = selectedTab === workbenchName ( c );
        return (
          <ListItem button selected={isSelected} onClick={() => { state.state2 ().setJson ( { workspaceTab: workbenchName ( c ) }, 'Clicked in DisplayCapabilitiesList' ); }} key={c}>
            <ListItemText primary={c}/>
          </ListItem>
        );
      } )}
    </List>
  );
}
