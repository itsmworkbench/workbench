import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { LensProps } from "@focuson/state";
import Grid from '@mui/material/Grid';
import { ApprovalState, defaultTicketTypeDetails, TicketTypeDetails,TicketTypeName } from "@itsmworkbench/tickettype";

export interface SelectTicketTypeProps<S> extends LensProps<S, TicketTypeDetails, any> {
  readonly? : boolean
}

export function TicketTypeSelect<S>({ state ,disabled}: LensProps<S, TicketTypeName, any> & { disabled: boolean }) {
  return (
    <FormControl fullWidth>
      <InputLabel>Ticket Type</InputLabel>
      <Select
        value={state.optJson() || ''}
        label="Ticket Type"
        disabled={disabled}
        onChange={event => state.setJson(event.target.value as TicketTypeName, '')}
      >
        <MenuItem value="General">General</MenuItem>
        <MenuItem value="Update Database">Update Database</MenuItem>
        <MenuItem value="Install Software">Install Software</MenuItem>
      </Select>
    </FormControl>
  );
}
export function ApprovalStateSelect<S>({ state, disabled }: LensProps<S, ApprovalState, any> & { disabled: boolean }) {
  return (
    <FormControl fullWidth>
      <InputLabel>Type of Approval</InputLabel>
      <Select
        value={state.optJson() || ''}
        label="Type of Approval"
        disabled={disabled}
        onChange={event => state.setJson(event.target.value as ApprovalState, '')}
      >
        <MenuItem value="Pre Approved">Pre Approved</MenuItem>
        <MenuItem value="Needs Approval">Needs Approval</MenuItem>
        <MenuItem value="No Approval Needed">No Approval Needed</MenuItem>
      </Select>
    </FormControl>
  );
}
export function ValidateInvolvedPartiesCheckbox<S>({ state, disabled }: LensProps<S, boolean, any> & { disabled: boolean }) {
  return (
    <FormControlLabel
      control={<Checkbox checked={state.optJson() || false} onChange={event => state.setJson(event.target.checked, '')} />}
      label="Validate Involved Parties"
      disabled={disabled}
    />
  );
}

export function SelectTicketType<S>({ state, readonly }: SelectTicketTypeProps<S>) {
  const disabled = readonly === true;

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={4}>
        <TicketTypeSelect state={state.focusOn('ticketType')} disabled={disabled} />
      </Grid>
      <Grid item xs={4}>
        <ApprovalStateSelect state={state.focusOn('approvalState')} disabled={disabled} />
      </Grid>
      <Grid item xs={4}>
        <ValidateInvolvedPartiesCheckbox state={state.focusOn('validateInvolvedParties')} disabled={disabled} />
      </Grid>
    </Grid>
  );
}
