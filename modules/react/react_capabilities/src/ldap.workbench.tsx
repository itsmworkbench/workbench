import { LensProps, LensState } from "@focuson/state";
import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import RefreshIcon from '@mui/icons-material/Refresh';
import { FocusedTextArea, FocusedTextInput, IProcessEventSideEffectFn, SuccessFailContextFn, SuccessFailureButton } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { LdapWorkBenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { ActionPluginDetails } from "@itsmworkbench/react_core";


export interface DisplayLdapWorkbenchProps<S> extends LensProps<S, Action, any> {
  processSe: IProcessEventSideEffectFn

}

export function DisplayLdapWorkbench<S> ( { state , processSe}: DisplayLdapWorkbenchProps<S> ) {
  let actionState: LensState<S, any, any> = state;
  const action: any = state.optJson ()
  const who = action?.who || ''
  const response = action?.response || ''

  const contextFn: SuccessFailContextFn = ( tab, phase, action, successOrFail ): LdapWorkBenchContext => ({
    where: { phase, action, tab },
    capability: 'LDAP',
    display: {
      title: `Ldap check to ${splitAndCapitalize ( action )}`,
      type: 'LDAP',
      successOrFail,
    },
    data: { who: who || '', response: response || '' }
  })

  return <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>LDAP Check</Typography>
    <Box marginBottom={2}>
      <Typography variant="subtitle1" gutterBottom>Email to check in LDAP</Typography>
      <FocusedTextInput fullWidth variant="outlined" state={actionState.focusOn ( 'who' )}/>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}>Execute </Button>
        <Button variant="contained" color="primary" endIcon={<TestIcon/>}> Test Connection </Button>
        <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
      </Box>
      <Typography variant="subtitle1" gutterBottom>LDAP Result</Typography>
      <FocusedTextArea fullWidth variant="outlined" state={actionState.focusOn ( 'response' )}/>
      <SuccessFailureButton  processSe={processSe} title='The LDAP details are good' successOrFail={true} context={contextFn}/>
      <SuccessFailureButton processSe={processSe}title='The LDAP details show a problem' successOrFail={false} context={contextFn}/>
    </Box>
  </Container>
}

export const displayLdapPlugin = <S, State> () => ( props: ( s: LensState<S, State, any> ) => DisplayLdapWorkbenchProps<S> ): ActionPluginDetails<S, State, DisplayLdapWorkbenchProps<S>> =>
  ({
    by: "LDAPWorkbench",
    props,
    render: ( s, props ) => <DisplayLdapWorkbench {...props} />
  })

