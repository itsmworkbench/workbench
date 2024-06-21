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
  contextProcessing: T
  promptCreation: T
  sendToAgent: T
  resultReturned: T
  updateContext: T
  returnResult: T
}
export type AgentStages = keyof AgentStageAnd<any>
export type AgentData = AgentStageAnd<string>

export interface IconAndTitle {
  icon: SvgIconComponent;
  title: string;
}

export const defaultIconAndTitles: AgentStageAnd<IconAndTitle> = {
  dataIn: { icon: DataIcon, title: 'Data In' },
  contextProcessing: { icon: ContextIcon, title: 'Context Processing' },
  promptCreation: { icon: PromptIcon, title: 'Prompt Creation' },
  sendToAgent: { icon: AgentIcon, title: 'Send to Agent' },
  resultReturned: { icon: ResultIcon, title: 'Result Returned' },
  updateContext: { icon: UpdateContextIcon, title: 'Update Context' },
  returnResult: { icon: ReturnIcon, title: 'Return Result' },
};
export type QuestionSearch = 'Question' | 'Search';

export type Query = {
  query: string
  intent: AgentData
  questionOrSearch: QuestionSearch
  agents: NameAnd<AgentData>
  compose: AgentData
}