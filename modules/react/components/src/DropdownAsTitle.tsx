import React, { ReactNode } from "react";
import { Box, Card, CardContent, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { LensProps, LensProps2, LensState } from "@focuson/state";

import { SetIdEvent, SetValueEvent } from "@itsmworkbench/events";
import { Loading } from "@itsmworkbench/components";
import { SideEffect } from "@itsmworkbench/react_core";
import { IdAndName, SelectedAndList } from "@itsmworkbench/utils";
import { ErrorsAnd, hasErrors } from "@laoban/utils";


//observations... it will take time to load the selected item
//we want to display loading while it is loading
//changing the selection will fire an event 'setId' with the new id
//the data should be in the id store!
//annoyingly the path is not the lens description... might want to change that...


export interface DropdownAsTitleProps<S, T extends IdAndName> extends LensProps2<S, SelectedAndList<T>, SideEffect[], any> {
  purpose: string
  path: string
  children: ( state: LensState<S, T, any> ) => React.ReactElement
}
export function DropdownAsTitle<S, T extends IdAndName> ( { state, children, path, purpose }: DropdownAsTitleProps<S, T> ) {
  const { selected, options } = state.optJson1 () || { options: [], item: undefined, selected: undefined }
  function handleChange ( event: SelectChangeEvent<string>, child: ReactNode ): void {
    let id = event?.target?.value;
    if ( id ) {
      console.log ( 'handleChange', id, event?.target?.value, event?.target?.name, event.target )
      const setSelectedEvent: SetValueEvent = { event: 'setValue', path: path + '.selected', value: id, context: {} };
      const loadItemEvent: SetIdEvent = { event: 'setId', id, path: path + '.item', context: {} };
      state.transformJson (
        ( { options, selected, item } ) => ({ options, selected: id, item: undefined }),
        old => [ ...(old || []), { command: 'event', event: setSelectedEvent }, { command: 'event', event: loadItemEvent } ],
        `${purpose} selected ${id}` );
    }
  }
  console.log ( 'options', options )

  return <Card sx={{ height: '100%' }} variant="outlined">
    <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '75vh' }}>
      <Select
        value={selected || ''}
        onChange={handleChange}
        aria-label={`Select${purpose ? ' ' + purpose : ''}`}
        displayEmpty
        fullWidth
      > <MenuItem disabled value=""> <em>Please select a {purpose}</em> </MenuItem>
        {options.map ( ( option ) => (
          <MenuItem key={option.name} value={option.id}>{option.name}</MenuItem>
        ) )}
      </Select>
      <Box sx={{ flexGrow: 1, overflowY: 'scroll', border: '1px solid #ccc' }}>
        <LoadingOr state={state.state1 ()} children={children}/>
      </Box>
    </CardContent></Card>
}

export interface LoadingOrProps<S, T extends IdAndName> extends LensProps<S, SelectedAndList<T>, any> {
  children: ( state: LensState<S, T, any> ) => React.ReactElement
}
export function LoadingOr<S, T extends IdAndName> ( { state, children }: LoadingOrProps<S, T> ) {
  const item = state.optJson ();
  if ( item === undefined || item.selected === undefined ) return <></>
  const newState: LensState<S, T, any> = state.focusOn ( 'item' )
  return item.item === undefined ? <Loading/> : children ( newState );
}

export interface LoadingValueProps<T> {
  children: ( t: T ) => React.ReactNode
  value: ErrorsAnd<T> | undefined
  errors?: ( errors: string[] ) => React.ReactElement
}
export function LoadingValue<T> ( { children, value, errors }: LoadingValueProps<T> ): React.ReactElement {
  if ( value === undefined ) {return <Loading/>}
  if ( hasErrors ( value ) ) return errors ? errors ( value ) : <pre>{value.join ( '\n' )}</pre>
  {return <>{children ( value as T )}</>}
}