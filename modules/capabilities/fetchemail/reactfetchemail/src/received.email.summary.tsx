import React from 'react';
import { IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import Button from '@mui/material/Button';
import { EmailContent, EmailSummary, ListEmailsResult } from "@itsmworkbench/fetchemail";
import { ErrorsAnd, hasErrors, toArray } from '@laoban/utils';
import { LensProps } from "@focuson/state";
import { useFetchEmailer } from "@itsmworkbench/components";

export interface ReadEmailButtonProps<S> extends LensProps<S, ErrorsAnd<EmailContent>, any> {
  email: EmailSummary;
}
export function ReadEmailButton<S> ( { state, email }: ReadEmailButtonProps<S> ) {
  const fetchEmailer = useFetchEmailer ()
  function onClick () {
    fetchEmailer.fetchEmail ( { uid: email.uid, bodyParts: email.bodyParts } ).//
      then ( result => {
        if ( result )
          state.setJson ( result, '' );
        else
          state.setJson ( [ 'Failed to fetch email' ], '' );
      } ).catch ( ( e: any ) => {
      console.error ( e )
      state.setJson ( [ JSON.stringify ( e, null, 2 ) ], '' )
    } )
  }
  return <Button variant="contained" size="small" onClick={onClick}>Read&nbsp;Email</Button>
}
export interface EmailRowProps<S> extends LensProps<S, ErrorsAnd<EmailContent>, any> {
  email: EmailSummary;
}

export function EmailRow<S> ( { state, email }: EmailRowProps<S> ) {
  const { envelope: { date, subject }, uid } = email;

  return (
    <TableRow key={uid} sx={{
      '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' },
      '&:nth-of-type(even)': { backgroundColor: '#e0e0e0' },
    }}>
      <TableCell>{date}</TableCell>
      <TableCell>{subject}</TableCell>
      <TableCell>
        <ReadEmailButton state={state} email={email}/>
      </TableCell>
      <TableCell>
        <Tooltip title={<pre>{JSON.stringify ( email, null, 2 )}</pre>} arrow>
          <IconButton>
            <InfoIcon/>
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
    ;
}


export interface EmailsTableProps<S> extends LensProps<S, ErrorsAnd<EmailContent>, any> {
  emails: ErrorsAnd<ListEmailsResult>;
  maxHeight?: string
}

export function EmailsTable<S> ( { state, emails, maxHeight }: EmailsTableProps<S> ) {
  if ( hasErrors ( emails ) ) return <div>{JSON.stringify ( emails, null, 2 )}</div>
  const safeEmails = toArray ( emails?.emails )
  return (
    <div style={{ maxHeight, overflow: 'auto' }}>
      <Paper>
        <Table>
          <TableHead>
            <TableRow sx={{
              '& > th': {
                backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold'
              }
            }}>
              <TableCell>Date</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeEmails.map ( ( email ) => (
              <EmailRow key={email.uid} state={state} email={email}/>
            ) )}
            {safeEmails.length === 0 && <TableRow>
                <TableCell colSpan={3} align="center">No Emails</TableCell>
            </TableRow>}
          </TableBody>
        </Table>
      </Paper></div>
  );
}
