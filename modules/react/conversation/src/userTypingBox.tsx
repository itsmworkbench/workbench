import React, { useRef } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { SideEffect } from "@intellimaintain/react_core";
import { LensProps2 } from "@focuson/state";
import { makeSideeffectForMessage } from '@intellimaintain/components';


interface UserTypingBoxProps<S, C> extends LensProps2<S, string, SideEffect[], C> {
  from: string
}

export function UserTypingBox<S, C> ( { state, from }: UserTypingBoxProps<S, C> ) {
  const inputRef = useRef<HTMLTextAreaElement> ( null );
  function sendMessage () {
    if ( inputRef.current ) {
      const message = { who: from, message: inputRef.current.value.trim () };
      let sideEffect: SideEffect = makeSideeffectForMessage ( message );
      state.transformJson (
        msg => '',
        old => [ ...(old || []), sideEffect ],
        'sent message' );
      inputRef.current.value = '';
    }
  }
  function handleBlur () {
    if ( inputRef.current ) {
      const message = inputRef.current.value;
      state.state1 ().setJson ( message, 'chat changed' );
    }
  }
  const handleKeyPress = ( event: React.KeyboardEvent<HTMLDivElement> ) => {
    if ( event.key === 'Enter' )
      if ( !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey ) {
        event.preventDefault (); // Prevent default to avoid adding a new line on Ctrl+Enter or Shift+Enter
        sendMessage ();
      }
  };

  return (
    <Box sx={{
      display: 'flex', // Enables flex container
      alignItems: 'center', // Vertically centers the items
      gap: 1, // Adds a gap between items
    }}>
      <TextField
        multiline
        variant="outlined"
        placeholder="Type a message..."
        inputRef={inputRef} // Use ref to access the input for sending message
        onKeyDown={handleKeyPress}
        onBlur={handleBlur}
        defaultValue={state.optJson1 () || ''}
        fullWidth
      />
      <IconButton color="primary" onClick={sendMessage}>
        <SendIcon/>
      </IconButton>
    </Box>
  );
}
