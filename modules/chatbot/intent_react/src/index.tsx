import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatTextInput, ChatTextLine } from "./components/ChatTextLine";
import { Pipeline, TitleAndCheckbox } from "./components/agent.pipeline";
import { QuestionOrSearch } from "./components/question.or.search";
import { Box, Grid, Stack } from "@mui/material";
import { sample } from "./domain/sample";
import { AgentStageAnd, defaultIconAndTitles, Query, QuestionSearch } from "./domain/domain";
import { LensProps, LensState, setJsonForFlux } from "@focuson/state";
import { ThreeColumnGrid } from "./components/three.column.grid";
import { aiClient, defaultOpenAiConfig, OpenAiRequest, OpenAiResponse } from "./agent/openai";


const rootElement = document.getElementById ( 'root' )!;
const root = ReactDOM.createRoot ( rootElement );
const data: AgentStageAnd<string> = {
  dataIn: 'some data in',
  context: 'some context processing',
  prompt: 'some prompt creation',
  sentToAgent: 'some send to agent',
  result: 'some result returned',
  contextChanges: 'some update context',
  returnResult: 'some return result',
};

type Context = {}
const openAi: ( request: OpenAiRequest ) => Promise<OpenAiResponse> = aiClient ( {
  ...defaultOpenAiConfig,
  basePrompt: `You are working out two things.
   The first things is whether the user is asking a question or searching for something. It is a search if they want a list of some results. 
   Your second is a list of sensible search agents to ask to resolve the query. The list of search agents followed. It is an exclusive list don't add others to the list 
   jira:   This agent composes JQL queries to try and answer the question
   confluence: This agent composes CQL queries to try and find documents 
   search: an agent that searches the internet. This is great answer if the query makes little sense
   
  Your answer should be two lines. The first should be the word 'Question' or 'Search'. The second should be a json list of strings.
  `,
  promptFn: req => []

} )
async function doTheIntentStuff ( query: string, context: Context ) {
  const request: OpenAiRequest = { query, messages: [], source: [] }
  const result = await openAi ( request )
  const data: AgentStageAnd<string> = {
    dataIn: request.query,
    context: request.messages.join ( '\n' ),
    prompt: result.prompt.join ( '\n' ),
    sentToAgent: result.messages.map ( m => m.content ).join ( '\n' ),
    result: JSON.stringify ( result.response, null, 2 ),
    contextChanges: 'None',
    returnResult: result.response.map ( m => m.content ).join ( '\n' )
  }
  return data
}

export function Intent<S> ( { state }: LensProps<S, Query, any> ) {
  const queryState = state.focusOn ( 'query' );
  const rootAgentState = state.doubleUp ().focus2On ( 'selectedAgents' );
  const send = async ( text: string ) => {
    const data = await doTheIntentStuff ( text, {} )
    const answer = data.returnResult;
    const lines = answer.split ( '\n' )
    const questionOrAnswer = lines[ 0 ] as QuestionSearch
    function getSearchAgents () {
      try {
        return JSON.parse ( lines [ 1 ] );
      } catch ( e: any ) {
        console.error ( `failed to get list of search agents.`, data.result, lines, lines[1] )
      }
      return []
    }
    const searchAgents = getSearchAgents ()
    const queryLens = state.optional.focusQuery ( 'query' )
    const intentLens = state.optional.focusQuery ( 'intent' )
    const selectedLens = state.optional.focusQuery ( 'selectedAgents' )
    const questionOrAnswerLens = state.optional.focusQuery ( 'questionOrSearch' )
    const newMain = queryLens.set (
      intentLens.set (
        selectedLens.set (
          questionOrAnswerLens.set ( state.main, questionOrAnswer ),
          searchAgents ),
        data ),
      text );
    state.dangerouslySetMain ( newMain, 'send' );
  }
  return <Box sx={{ width: '80vw', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
    <Stack display="flex" flexDirection="column" alignItems="center" marginTop={2} spacing={2}>
      <TitleAndCheckbox title='Type here'/>
      <ChatTextLine send={send}/>
      <TitleAndCheckbox title='Query'/>
      <ChatTextInput input={queryState.optJsonOr ( '' )} setInput={() => {}}/>
      <ThreeColumnGrid children={[
        <Pipeline key='intent' iconsAndTitle={defaultIconAndTitles} title='Intent' state={rootAgentState.focus1On ( 'intent' )}/>,
        <QuestionOrSearch key='qors' state={state.focusOn ( 'questionOrSearch' )}/>,
        <Pipeline key='resp' iconsAndTitle={defaultIconAndTitles} title='Compose Response' state={rootAgentState.focus1On ( 'compose' )}/>,
        ...Object.entries ( sample.agents ).map ( ( [ name, agent ] ) => (
          <Grid item key={name} xs={12} sm={6} md={4}>
            <Pipeline iconsAndTitle={defaultIconAndTitles} title={name} state={rootAgentState.focus1On ( name as any )} checkbox={true}/>
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