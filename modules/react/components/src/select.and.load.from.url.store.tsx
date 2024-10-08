import React, { useEffect, useState } from 'react';
import { LensProps } from "@focuson/state";
import { LoadingValue, useUrlStore } from '@itsmworkbench/components';
import { BasicData } from "@itsmworkbench/react_core";
import { ListNamesResult } from "@itsmworkbench/urlstore";
import { ErrorsAnd, hasErrors } from '@laoban/utils';
import { Grid, List, ListItem, ListItemText, Pagination, TextField } from "@mui/material";
import { useSideEffects } from "./hooks/useSideEffects";
import { IdAnd, IdAndName, IdNameAnd } from "@itsmworkbench/utils";

export interface SelectAndLoadUrlProps<S, T> extends LensProps<S, IdAnd<T>, any> {
  basicData: BasicData
  namespace: string
  pageSize?: number
  targetPath: string
  Title: React.ReactNode
  Text: React.ReactNode
  TextIfNoKas: React.ReactNode
  Summary: ( idAndItem: IdNameAnd<T> | undefined ) => React.ReactNode
  Save: ( idAndItem: IdNameAnd<T> | undefined ) => React.ReactNode
}

export function SelectAndLoadFromUrlStore<S, T> ( { state, basicData, namespace, pageSize, Title, Text, TextIfNoKas, Summary, Save }: SelectAndLoadUrlProps<S, T> ) {
  if ( pageSize === undefined ) pageSize = 10;
  const urlStore = useUrlStore ();
  const [ filter, setFilter ] = useState ( '' );
  const [ page, setPage ] = useState ( 1 );
  const [ summary, setSummary ] = useState<IdNameAnd<T> | undefined> ( undefined );
  const [ kas, setKas ] = useState<ErrorsAnd<ListNamesResult> | undefined> ( undefined );
  const addSe = useSideEffects ( state )
  useEffect ( () => {urlStore.list ( { filter, order: 'name', org: basicData.organisation, namespace, pageQuery: { page, pageSize } } ).then ( setKas )},
    [ filter ]
  )

  function setSummaryLoad ( item: string ) {
    urlStore.loadNamed<T> ( { scheme: 'itsm', name: item, organisation: basicData.organisation, namespace } ).then ( res => {
      console.log ( 'setSummaryLoad', res )
      if ( hasErrors ( res ) )
        console.error ( res )
      else {
        // state.setJson({ id: res.id, item: res.result }, '')
        console.log('setSummaryLoad', res.id, res.result, item)
        console.log('setSummaryLoad - item', item)
        setSummary ( { id: res.id, item: res.result, name: item } )
        // console.log ( 'setSummaryLoad', state, res.result )
        // const se: EventSideEffect = { command: 'event', event: { event: 'setId', id: res.id, path: targetPath, context: { data: res.result } } }
        // addSe ( se )
      }
    } )
  }
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        {Title}
      </Grid>
      <Grid item xs={4}>{!hasErrors ( kas ) && kas?.names.length === 0 ? TextIfNoKas : Text}</Grid>
      <Grid item xs={4}>
        <TextField
          label="Filter"
          variant="outlined"
          onChange={( e ) => setFilter ( e.target.value )}
          fullWidth
          margin="normal"
        />
      </Grid>
      <Grid item xs={4}>
        <ResultsList items={kas} onSelect={setSummaryLoad}/>
        <Pagination
          onChange={( event, page ) => setPage ( page )}
          color="primary"
          variant="outlined"
          shape="rounded"
        />
      </Grid>
      <Grid item xs={12}>
        {Save ( summary )}
      </Grid>
      <Grid item xs={12}>
        {Summary ( summary )}
      </Grid>
    </Grid>
  )
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
