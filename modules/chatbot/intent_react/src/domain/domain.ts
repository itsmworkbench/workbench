import { NameAnd } from "@laoban/utils";
import DataIcon from "@mui/icons-material/DataUsage";
import ContextIcon from "@mui/icons-material/Settings";
import PromptIcon from "@mui/icons-material/QuestionAnswer";
import AgentIcon from "@mui/icons-material/SmartToy";
import ResultIcon from "@mui/icons-material/CheckCircle";
import UpdateContextIcon from "@mui/icons-material/Update";
import ReturnIcon from "@mui/icons-material/Reply";
import { SvgIconComponent } from "@mui/icons-material";


export type AgentStageAnd<T> = {
  dataIn: T
  context: T
  prompt: T
  sentToAgent: T
  result: T
  contextChanges: T
  returnResult: T
}
export type AgentStages = keyof AgentStageAnd<any>
export type AgentData = AgentStageAnd<string>

export type SelectedAgentList = string[]
export interface IconAndTitle {
  icon: SvgIconComponent;
  title: string;
}

export function emptyAgentStateAnd<T> ( t: T ): AgentStageAnd<T> {
  return {
    dataIn: t,
    context: t,
    prompt: t,
    sentToAgent: t,
    result: t,
    contextChanges: t,
    returnResult: t,
  };
}
export const defaultIconAndTitles: AgentStageAnd<IconAndTitle> = {
  dataIn: { icon: DataIcon, title: 'Data In' },
  context: { icon: ContextIcon, title: 'Context' },
  prompt: { icon: PromptIcon, title: 'Prompt' },
  sentToAgent: { icon: AgentIcon, title: 'Sent to Agent' },
  result: { icon: ResultIcon, title: 'Result' },
  contextChanges: { icon: UpdateContextIcon, title: 'Context changes' },
  returnResult: { icon: ReturnIcon, title: 'Return' },
};
export type QuestionSearch = 'Question' | 'Search';

export type Query = {
  query: string
  intent: AgentData
  questionOrSearch: QuestionSearch
  selectedAgents: string[]
  agents: NameAnd<AgentData>
  compose: AgentData
}