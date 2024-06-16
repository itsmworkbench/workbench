import React from 'react';
import { List, ListItem } from '@mui/material';

export type MessagesListProps<T> = {
  items: T[];
  itemStyle: ( t: T ) => React.CSSProperties;
  children: ( t: T, index: number ) => React.ReactNode;
};

export function MessagesList<T> ( { items, children, itemStyle }: MessagesListProps<T> ) {
  if ( items.length === 0 ) return <></>
  return (
    <List aria-live="polite">
      {items.map ( ( item, index ) => {
        const { justifyContent, ...style } = itemStyle ( item );
        return <ListItem sx={{ justifyContent }} key={index}>
          <div style={style}>{children ( item, index )}</div>
        </ListItem>;
      } )}
    </List>
  );
}
