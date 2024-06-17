import React, { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { doTwoThings } from "../utils";

export type ChatTextInputProps = {
  input: string
  setInput: ( s: string ) => void
  send: ( s: string ) => void
}
function ChatTextInput ( { input, setInput, send }: ChatTextInputProps ) {
  return <TextField
    value={input}
    onChange={e => setInput ( e.target.value )}
    onKeyDown={e => e.key === 'Enter' && send ( input )}
    variant="outlined"
    placeholder="Type your message..."
    fullWidth
    sx={{ marginRight: '10px' }}
    aria-label="Chat input field"
  />;
}

export type ChatTextLineProps = {
  send: ( s: string ) => void


}
export function ChatTextLine ( { send }: ChatTextLineProps ) {
  const [ input, setInput ] = useState<string> ( '' );
  const onClick = doTwoThings ( send, _ => setInput ( '' ) );
  return <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <ChatTextInput input={input} setInput={setInput} send={onClick}/>
    <Button variant="contained" color="primary" onClick={() => onClick ( input )} endIcon={<SendIcon/>} aria-label="Send message"/>
  </Box>
}