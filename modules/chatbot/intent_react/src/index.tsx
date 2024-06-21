import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatTextInput, ChatTextLine } from "./components/ChatTextLine";
import { Pipeline, TitleAndCheckbox } from "./components/agent.pipeline";
import { QuestionOrSearch } from "./components/question.or.search";
import { Box, Grid, Stack } from "@mui/material";
import { sample } from "./domain/sample";
import { AgentStageAnd, defaultIconAndTitles, Query } from "./domain/domain";
import { LensProps, LensState, setJsonForFlux } from "@focuson/state";
import { ThreeColumnGrid } from "./components/three.column.grid";


const rootElement = document.getElementById ( 'root' )!;
const root = ReactDOM.createRoot ( rootElement );
const data: AgentStageAnd<string> = {
  dataIn: 'some data in',
  contextProcessing: 'some context processing',
  promptCreation: 'some prompt creation',
  sendToAgent: 'some send to agent',
  resultReturned: 'some result returned',
  updateContext: 'some update context',
  returnResult: 'some return result',
};
export function Intent<S> ( { state }: LensProps<S, Query, any> ) {
  const queryState = state.focusOn ( 'query' );
  const rootAgentState = state.doubleUp ().focus2On ( 'selectedAgents' );
  return <Box sx={{ width: '80vw', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
    <Stack display="flex" flexDirection="column" alignItems="center" marginTop={2} spacing={2}>
      <TitleAndCheckbox title='Type here'/>
      <ChatTextLine send={( text: string ) => queryState.setJson ( text, {} )}/>
      <TitleAndCheckbox title='Query'/>
      <ChatTextInput input={queryState.optJsonOr ( '' )} setInput={() => {}}/>
      <ThreeColumnGrid children={[
        <Pipeline iconsAndTitle={defaultIconAndTitles} title='Intent' state={rootAgentState.focus1On ( 'intent' )}/>,
        <QuestionOrSearch state={state.focusOn ( 'questionOrSearch' )}/>,
        <Pipeline iconsAndTitle={defaultIconAndTitles} title='Response' state={rootAgentState.focus1On ( 'Response' )}/>,
        ...Object.entries ( sample.agents ).map ( ( [ name, agent ] ) => (
          <Grid item key={name} xs={12} sm={6} md={4}>
            <Pipeline iconsAndTitle={defaultIconAndTitles} title={name} state={rootAgentState.focus1On ( name as any )}/>
          </Grid>
        ) ) ]}/>
    </Stack>
  </Box>

}
const context = {}
const setJson = setJsonForFlux ( 'intent', context, ( s: LensState<Query, Query, any> ) => {
  root.render ( <React.StrictMode> <Intent state={s}/>
    <pre>{JSON.stringify ( s.main, null, 2 )}</pre>
  </React.StrictMode> );
} )
setJson ( sample )