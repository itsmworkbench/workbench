import { useSqler } from "@itsmworkbench/components";
import React, { useEffect } from "react";
import { ErrorsAnd, hasErrors, NameAnd } from "@laoban/utils";
import { FormControl, InputLabel, Select, Tooltip, Typography } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import InfoIcon from "@mui/icons-material/Info";
import { LensProps } from "@focuson/state";

export interface EnvDropdownWithTooltipProps<S> extends LensProps<S, string, any> {


}

export function EnvDropdownWithTooltip<S> ( { state }: EnvDropdownWithTooltipProps<S> ) {
  const sqler = useSqler ()
  const [ envs, setEnvs ] = React.useState<ErrorsAnd<NameAnd<NameAnd<string>>>> ( {} )
  useEffect ( () => {
    sqler.listEnvs ().then ( setEnvs )
  }, [] )


  const selectedValue = state.optJson () || ''
  let envName = state.optJson () || '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}> {/* Adjust the gap as needed */}
      <FormControl sx={{ width: '100%', minWidth: 120 }} size="small">
        <InputLabel id="env-select-label">Environment</InputLabel>
        <Select
          labelId="env-select-label"
          value={selectedValue}
          onChange={( e ) => state.setJson ( e.target.value, '' )}
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
          sx={{ marginTop: 2 }}
        >
          <MenuItem disabled value="">
            <em>Select an environment</em>
          </MenuItem>
          {Object.keys ( envs ).map ( ( key ) => (
            <MenuItem key={key} value={key} sx={{ padding: 2 }}>{key}</MenuItem>
          ) )}
        </Select>
      </FormControl>
      <Tooltip title={<Typography>{hasErrors ( envs ) ? JSON.stringify ( envs, null, 2 ) : envName ? JSON.stringify ( envs?.[ envName ], null, 2 ) : 'No Environment Selected'}</Typography>} placement="right">
        <InfoIcon/>
      </Tooltip>
    </div>
  );
}