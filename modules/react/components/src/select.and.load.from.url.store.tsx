import React, { useEffect, useState } from 'react';
import { LensProps, LensProps2 } from "@focuson/state";
import { LoadingValue, useUrlStore } from '@itsmworkbench/components';
import { BasicData, EventSideEffect } from "@itsmworkbench/react_core";
import { ListNamesResult } from "@itsmworkbench/url";
import { ErrorsAnd, hasErrors } from '@laoban/utils';
import { List, ListItem, ListItemText, Pagination, TextField } from "@mui/material";
import { useSideEffects } from "./hooks/useSideEffects";
import { IdAnd } from "@itsmworkbench/utils";

export interface SelectAndLoadUrlProps<S, T> extends LensProps<S, IdAnd<T>, any> {
  basicData: BasicData
  namespace: string
  pageSize?: number
  targetPath: string
  Title: React.ReactNode
  Summary: ( idAndItem: IdAnd<T> | undefined ) => React.ReactNode
}

export function SelectAndLoadFromUrlStore<S, T> ( { state, basicData, namespace, pageSize, Title, Summary, targetPath }: SelectAndLoadUrlProps<S, T> ) {
  if ( pageSize === undefined ) pageSize = 10;
  const urlStore = useUrlStore ();
  const [ filter, setFilter ] = useState ( '' );
  const [ page, setPage ] = useState ( 1 );
  const [ kas, setKas ] = useState<ErrorsAnd<ListNamesResult> | undefined> ( undefined );
  const addSe = useSideEffects ( state )
  useEffect ( () => {
    urlStore.list ( { filter, order: 'name', org: basicData.organisation, namespace, pageQuery: { page, pageSize } } ).then ( setKas ), [ filter ]
  } )

  function setSummaryLoad ( item: string ) {
    urlStore.loadNamed<T> ( { scheme: 'itsm', name: item, organisation: basicData.organisation, namespace } ).then ( res => {
      console.log ( 'setSummaryLoad', res )
      if ( hasErrors ( res ) )
        console.error ( res )
      else {
        // setSummary ( res.result )
        console.log ( 'setSummaryLoad', state, res.result )
        const se: EventSideEffect = { command: 'event', event: { event: 'setId', id: res.id, path: targetPath, context: { data: res.result } } }
        addSe ( se )
      }
    } )
  }
  return (
    <div>
      {Title}
      <TextField
        label="Filter"
        variant="outlined"
        onChange={( e ) => setFilter ( e.target.value )}
        fullWidth
        margin="normal"
      />
      <ResultsList items={kas} onSelect={setSummaryLoad}/>
      {Summary ( state.optJson () )}
      <Pagination
        onChange={( event, page ) => setPage ( page )}
        color="primary"
        variant="outlined"
        shape="rounded"
      />
    </div>
  );
}
interface ResultsListProps {
  items: ErrorsAnd<ListNamesResult> | undefined;
  onSelect: ( item: any ) => void; // Define the correct item type based on your needs
}

export function ResultsList ( { items, onSelect }: ResultsListProps ) {
  const urlStore = useUrlStore ();
  return <LoadingValue value={items}>{( list: ListNamesResult ) =>
    <List>
      {list.names.map ( ( item, index ) => (
        <ListItem key={index} onClick={() => onSelect ( item )}>
          <ListItemText primary={item}/>
        </ListItem>
      ) )}
    </List>}
  </LoadingValue>;
}
