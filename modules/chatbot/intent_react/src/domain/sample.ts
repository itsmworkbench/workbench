import { Query } from "./domain";

const agentData = {
  dataIn: 'Data In',
  contextProcessing: 'Context Processing',
  promptCreation: 'Prompt Creation',
  sendToAgent: 'Send to Agent',
  resultReturned: 'Result Returned',
  updateContext: 'Update Context',
  returnResult: 'Return Result',
};
export const sample: Query = {
  query: 'What is the weather today?',
  intent: agentData,
  questionOrSearch: 'Question',
  agents: {
    jira: agentData,
    confluence: agentData,
    search: agentData,
  },
  compose: agentData
}