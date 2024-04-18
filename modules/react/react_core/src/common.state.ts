import { Capability, PhaseName } from "@itsmworkbench/domain";
import { Operator } from "@itsmworkbench/operator";

export interface WorkspaceSelectionState {
  workspaceTab?: string
}
export interface TabPhaseAndActionSelectionState  extends WorkspaceSelectionState{
  workspaceTab?: string
  phase?: PhaseName
  action?: string
}

export function workbenchName(capability: Capability){
  return `${capability}Workbench`
}

export interface DebugState {
  showDevMode?: boolean
  selectedDebugTab?: string | undefined

}

export interface BasicData{
  operator: Operator
  organisation: string
}