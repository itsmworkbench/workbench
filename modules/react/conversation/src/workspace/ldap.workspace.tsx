import React from "react";
import { HasSideeffects } from "@itsmworkbench/react_core";


//interface UserTypingBoxProps<S, C> extends LensProps3<S, string, NameAnd<Variables>, SideEffect[], C> {
//   from: string
// }
export function DisplayLdapWorkbench<S, S1 extends HasSideeffects> () {
  return <div>LDAP</div>
  // const { state } = qd
  // const { knowledgeArticle, action, variables, title, actionName } = calculateActionDetails ( state, 'ldap' );
  // if ( action?.by !== 'LDAP' ) return <div>Action is not a ldap action it is {JSON.stringify ( action )}</div>
  //
  // const whoName = (action as any).who
  // const who = whoName && replaceVar ( 'finding who', '${' + whoName + '}', variables, { variableDefn: dollarsBracesVarDefn, emptyTemplateReturnsSelf: true } )
  //
  // return <Container maxWidth="md">
  //   <Typography variant="h4" gutterBottom>
  //     {title}
  //   </Typography>
  //
  //   <Box marginBottom={2}>
  //     <Typography variant="subtitle1" gutterBottom>User name</Typography>
  //     <TextField fullWidth variant="outlined" value={who}/>
  //     <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
  //       <FakeSendButton state={state} icon={<PlayArrowIcon/>} actionName={actionName} message={`Need to make pretty gui... Checked ${who}`} value={true}>Execute</FakeSendButton>
  //       <Button variant="contained" color="primary" endIcon={<TestIcon/>}> Test Connection </Button>
  //       <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
  //       <Button variant="contained" color="secondary" endIcon={<CancelIcon/>}> Cancel </Button>
  //     </Box>
  //   </Box>
  //
  //   {/*<Paper style={{ padding: '16px', marginBottom: '16px' }}>*/}
  //   {/*  {correctWhen && <Typography variant="subtitle1">The result is correct when "{correctWhen.toString ()}"</Typography>}*/}
  //   {/*</Paper>*/}
  //   {/*<pre>{JSON.stringify ( action, null, 2 )}</pre>*/}
  //   {/*<pre>{JSON.stringify ( variables?.approval, null, 2 )}</pre>*/}
  //   {/*<pre>{JSON.stringify ( variables?.approval?.to, null, 2 )}</pre>*/}
  //   {/*<pre>{JSON.stringify ( variables, null, 2 )}</pre>*/}
  //
  // </Container>
}
