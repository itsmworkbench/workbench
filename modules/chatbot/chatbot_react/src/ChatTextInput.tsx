import React, { useCallback, useState } from "react";
import { Box, Button, debounce, TextField } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';

export type ChatTextInputProps = {
  send: ( input: string ) => void;
  sendDebounce?: number
};

export function ChatTextInput ( { send, sendDebounce }: ChatTextInputProps ) {
  sendDebounce = sendDebounce === undefined ? sendDebounce : 500;
  const [ input, setInput ] = useState<string> ( '' );
  const debouncedSend = useCallback ( debounce ( send, sendDebounce ), [ send ] );
  function onClick () {
    if ( input !== '' ) {
      debouncedSend ( input );
      setInput ( '' );
    }
  }
  return <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <TextField
      value={input}
      onChange={e => setInput ( e.target.value )}
      onKeyDown={e => e.key === 'Enter' && onClick ()}
      variant="outlined"
      placeholder="Type your message..."
      fullWidth
      sx={{ marginRight: '10px' }}
      aria-label="Chat input field"
    />
    <Button variant="contained" color="primary" onClick={onClick} endIcon={<SendIcon/>} aria-label="Send message"/>
  </Box>
}