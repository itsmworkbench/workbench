import { Paper, Typography } from "@mui/material";
import React from "react";

export interface DisplayTextProps {
  text: string
  maxHeight?: string
}
export function DisplayText ( { text, maxHeight }: DisplayTextProps ) {
  return <Paper elevation={3} sx={{ margin: '20px', padding: '20px', borderRadius: '10px', backgroundColor: '#f5f5f5' }}>
    <pre>{text}</pre>
  </Paper>
}
export function MonospaceText ( { text }: DisplayTextProps ) {
  return (
    <Typography
      component="pre" // Use the <pre> element to preserve formatting
      sx={{
        fontFamily: '"Roboto Mono", "Courier New", monospace', // Directly specify a monospace font family
        whiteSpace: 'pre-wrap', // Ensure that whitespaces and line breaks are preserved
        overflowX: 'auto', // Adds horizontal scrolling if the content is too wide
        background: '#f5f5f5', // Optional: adds a slight background color
        padding: '8px', // Optional: adds some padding
        borderRadius: '4px', // Optional: rounds the corners for a softer look
        border: '1px solid #ddd' // Optional: adds a border
      }}
    >
      {text}
    </Typography>
  );
}