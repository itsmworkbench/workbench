import React, { useEffect, useState } from 'react';
import { LensProps } from "@focuson/state";
import { TicketType } from "@itsmworkbench/tickettype";
import { LoadingValue, useUrlStore } from '@itsmworkbench/components';
import { BasicData } from "@itsmworkbench/react_core";
import { ListNamesResult } from "@itsmworkbench/url";
import { ErrorsAnd } from '@laoban/utils';
import { List, ListItem, ListItemText, Pagination, TextField } from "@mui/material";

export interface SelectAndLoadUrlProps<S, T> extends LensProps<S, TicketType, any> {
  basicData: BasicData
  namespace: string
  pageSize?: number
  Title: React.ReactNode
  Summary: ( t: T ) => React.ReactNode
}

export function SelectAndLoadFromUrlStore<S, T> ( { state, basicData, namespace, pageSize, Title, Summary }: SelectAndLoadUrlProps<S, T> ) {
  if ( pageSize === undefined ) pageSize = 10;
  const urlStore = useUrlStore ();
  const [ filter, setFilter ] = useState ( '' );
  const [ page, setPage ] = useState ( 1 );
  const [ kas, setKas ] = useState<ErrorsAnd<ListNamesResult> | undefined> ( undefined );
  const [ summary, setSummary ] = useState<T | undefined> ( undefined )
  useEffect ( () => {
    urlStore.list ( { filter, order: 'name', org: basicData.organisation, namespace, pageQuery: { page, pageSize } } ).then ( setKas ), [ filter ]
  } )

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
      <ResultsList items={kas} onSelect={setSummary}/>
      {Summary ( summary )}
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

export function ResultsList ( { items, onSelect } ) {
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
