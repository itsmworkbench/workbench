import { JSONObject } from "@itsmworkbench/utils";
import { Paper, Typography } from "@mui/material";
import React from "react";
import { useYaml } from "../hooks/useYaml";

const yaml = require ( 'js-yaml' );


export interface YamlDisplayMUIProps {
  yaml: any
  maxHeight?: string
}
export function DisplayYaml ( { yaml, maxHeight }: YamlDisplayMUIProps ) {
  const y = useYaml ()
  if ( yaml === undefined ) return <Paper>Nothing to display</Paper>
  const result = y.writer ( yaml )
  try {
    return (
      <Typography component="pre" style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight, overflowY: 'auto' }}>
        <code>{result}</code>
      </Typography>
    );
  } catch ( e: any ) {
    return <Typography component="pre" style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight, overflowY: 'auto' }}>
      Error {e.toString ()}
      {yaml}
    </Typography>
  }
}
