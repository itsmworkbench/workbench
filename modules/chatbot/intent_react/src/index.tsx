import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatTextInput, ChatTextLine } from "./components/ChatTextLine";
import { Pipeline, TitleAndCheckbox } from "./components/agent.pipeline";
import { QuestionOrSearch } from "./components/question.or.search";
import { Box, Stack, Grid } from "@mui/material";
import { sample } from "./domain/sample";
import { AgentStageAnd, Query, defaultIconAndTitles } from "./domain/domain";
import { LensProps, LensState, setJsonForFlux } from "@focuson/state";


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
  return <Box sx={{ width: '80vw', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
    <Stack display="flex" flexDirection="column" alignItems="center" marginTop={2} spacing={2}>
      <TitleAndCheckbox title='Type here'/>
      <ChatTextLine send={( text: string ) => queryState.setJson ( text, {} )}/>
      <TitleAndCheckbox title='Query'/>
      <ChatTextInput input={queryState.optJsonOr ( '' )} setInput={() => {}}/>
      <Grid container spacing={2} justifyContent="left">
        <Grid item xs={12} sm={6} md={4}>
          <Pipeline iconsAndTitle={defaultIconAndTitles} title='Intent' data={data}/>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuestionOrSearch questionOrSearch='Question'/>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Pipeline iconsAndTitle={defaultIconAndTitles} title='Response' data={data}/>
        </Grid>
        {Object.entries ( sample.agents ).map ( ( [ name, agent ] ) => (
          <Grid item key={name} xs={12} sm={6} md={4}>
            <Pipeline iconsAndTitle={defaultIconAndTitles} title={name} data={agent} checkbox={true}/>
          </Grid>
        ) )}
      </Grid>
    </Stack>
  </Box>

}
const context = {}
const setJson = setJsonForFlux ( 'intent', context, ( s: LensState<Query, Query, any> ) => {
    root.render ( <React.StrictMode> <Intent state={s}/> </React.StrictMode> );
  }
)
setJson ( sample )