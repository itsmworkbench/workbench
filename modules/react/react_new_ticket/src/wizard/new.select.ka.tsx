import React from "react";

export const x = 1

// import { Grid, Typography } from "@mui/material";
// import { ListNamesResult } from "@itsmworkbench/url";
// import { List, ListItem, ListItemText } from "@material-ui/core";
// import { DisplayJson } from "@itsmworkbench/components";
// import { NewTicketWizardProps } from "./new.ticket.wizard";
// import { LoadKaSideEffect } from "../load.ka.sideeffect";
// import Button from "@mui/material/Button";
// import SendIcon from "@mui/icons-material/Send";
//
// export interface KaListProps<S> extends NewTicketWizardProps<S> {
//   kaList: ListNamesResult
//   readonly?: boolean
// }
// export interface SelectKnowledgeArticleForNewWizardProps<S> extends KaListProps<S> {
//
//   next: ( enabled: boolean ) => React.ReactElement
//   prev: React.ReactElement
// }
// export function KaList<S> ( { state, kaList }: KaListProps<S> ) {
//   return <List>
//     {kaList.names.map ( ( ka, index ) => {
//       let id = `itsm/${kaList.org}/${kaList.namespace}/${ka}`;
//       const isSelected = false
//
//       return (
//         <ListItem
//           button
//           selected={isSelected}
//           onClick={() => {
//             const seState = state.state2 ()
//             const existing = seState.optJson () || []
//             const se: LoadKaSideEffect = {
//               command: 'loadKa',
//               ka: {
//                 scheme: "itsm",
//                 organisation: kaList.org,
//                 namespace: kaList.namespace,
//                 name: ka
//               }
//             }
//             seState.setJson ( [ ...existing, se ], 'Clicked in KAList' )
//           }}
//           key={ka}
//         >
//           <ListItemText primary={ka}/>
//         </ListItem>
//       );
//     } )}
//   </List>
// }
//
// export function SelectKnowledgeArticleForNewWizard<S> ( { state, readonly, kaList, next, prev }: SelectKnowledgeArticleForNewWizardProps<S> ) {
//   const disabled = readonly === true;
//
//   return (
//     <><Grid container spacing={2}>
//       <Grid item xs={12} md={6} sx={{ paddingRight: 4 }}>
//         <Typography variant="body1" gutterBottom>
//           If this ticket is like one you have processed before, you may have saved a knowledge article for it. If so
//           select it from the list to the right
//         </Typography>
//       </Grid>
//       <Grid item xs={12} md={6} container direction="column" spacing={2}>
//         <KaList state={state} kaList={kaList}/>
//       </Grid>
//       <Grid item xs={12} md={6} container direction="column" spacing={2}>
//         <DisplayJson maxHeight='500px' json={state.optJson1 () || 'None Selected'}/>
//       </Grid>
//     </Grid>
//       {prev}
//       <Button
//         variant="contained"
//         color="primary"
//         endIcon={<SendIcon/>}
//         onClick={() => {
//           const existing = state.optJson2 () || [];
//           let wizardData = state.optJson1 () || {};
//           const se = {
//             command: 'addNewTicket',
//             organisation: 'me',
//             ...wizardData
//           };
//           state.state2 ().setJson ( [ ...existing, se ], 'add new ticket pressed' );
//         }}
//       >
//         Create or Replace Ticket
//       </Button>
//       {next ( true )}
//     </>
//   )
//     ;
// }
