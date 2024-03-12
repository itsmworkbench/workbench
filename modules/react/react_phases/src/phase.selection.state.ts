import { PhaseName } from "@itsmworkbench/domain";
import { WorkspaceSelectionState } from "@itsmworkbench/react_core";

export interface TabPhaseAndActionSelectionState  extends WorkspaceSelectionState{
  workspaceTab?: string
  phase?: PhaseName
  action?: string
}
