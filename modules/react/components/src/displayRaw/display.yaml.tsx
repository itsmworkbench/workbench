import { JSONObject } from "@itsmworkbench/utils";
import { Paper, Typography } from "@mui/material";
import React from "react";

const yaml = require ( 'js-yaml' );

function turnToYaml ( jsonObject: JSONObject ) {
  if ( jsonObject === undefined ) return ''
  if ( typeof jsonObject !== 'object' ) throw new Error ( `Not an object ${typeof jsonObject} ${JSON.stringify ( jsonObject )}` );
  return Object.entries ( jsonObject ).map ( ( [ key, value ] ) =>
    Object.keys ( value || {} ).length == 0 ? '' : yaml.dump ( { [ key ]: value } ) ).filter ( x => x.length > 0 ).join ( '\n' )
}

export interface YamlDisplayMUIProps {
  yaml: any
  maxHeight?: string
}
export function DisplayYaml ( { yaml, maxHeight }: YamlDisplayMUIProps ) {
  if ( yaml === undefined ) return <Paper>Nothing to display</Paper>
  try {
    const withBlankLines = turnToYaml ( yaml )
    return (
      <Typography component="pre" style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight,overflowY:'auto' }}>
        <code>{withBlankLines}</code>
      </Typography>
    );
  } catch ( e: any ) {
    return <Typography component="pre" style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight ,overflowY:'auto'}}>
      Error {e.toString ()}
      {yaml}
    </Typography>
  }
}
