import { AgentStageAnd, Query } from "./domain";

const agentData: AgentStageAnd<string> = {
  dataIn: 'Data In',
  context: 'Context Processing',
  prompt: 'Prompt Creation',
  sentToAgent: 'Send to Agent',
  result: 'Result Returned',
  contextChanges: 'Update Context',
  returnResult: 'Return Result',
};
export const sample: Query = {
  query: 'What is the weather today?',
  intent: agentData,
  selectedAgents: [],
  questionOrSearch: 'Question',
  agents: {
    jira: agentData,
    confluence: agentData,
    search: agentData,
  },
  compose: agentData
}