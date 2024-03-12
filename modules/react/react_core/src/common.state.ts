import { Capability, PhaseName } from "@itsmworkbench/domain";

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