import React, { useEffect, useRef } from "react";
import { List } from "@mui/material";

const scrollableStyle = {
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 200px)', // Adjust based on your layout
  marginBottom: '10px'
};
export type ScrollableProps = {
  children: React.ReactNode
  dependencies: any[]
}
export function Scrollable ( { children, dependencies }: ScrollableProps ) {
  const endOfListRef = useRef ( null );
  useEffect ( () => {
    const parent = (endOfListRef?.current as any)?.parentElement
    if ( parent ) {
      const listElement = parent
      const scrollHeight = listElement.scrollHeight;
      const height = listElement.clientHeight;
      const maxScrollTop = scrollHeight - height;
      listElement.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, dependencies );
  return (
    <List sx={scrollableStyle} aria-live="polite">
      {children}
      <div ref={endOfListRef}/>
    </List>
  );
}