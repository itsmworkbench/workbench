import { FileNamesForTemporal } from "./filenames";
import { SideeffectFn, WorkflowAndInstanceId, WorkflowEngine } from "@itsmworkbench/workflow";
import { NameAnd } from "@laoban/utils";
import { fileExistingState, fileUpdateEventHistory } from "./file.event.history";
import { inMemoryIncMetric, Sideeffect } from "@itsmworkbench/kleislis";
import fs from "fs";
import path from "node:path";

const writeMetricsForFile = ( names: FileNamesForTemporal, metrics: NameAnd<number> ): SideeffectFn =>
  async ( wf: WorkflowAndInstanceId ): Promise<Sideeffect> => {
    const file = names.metrics ( wf );
    await fs.promises.mkdir ( path.dirname ( file ), { recursive: true } )
    console.log ( 'finished mkdir for file', file )
    const result: Sideeffect = async () => {
      await fs.promises.writeFile ( file, JSON.stringify ( metrics ) ) };
    return result;
  };

export function fileWorkflowEngine ( names: FileNamesForTemporal, wf?: WorkflowAndInstanceId): WorkflowEngine {
  const metrics: NameAnd<number> = {}
  return {
    existingState: fileExistingState ( names ),
    incMetric: () => inMemoryIncMetric ( metrics ),
    nextInstanceId: names.nextInstanceId,
    writeMetrics: writeMetricsForFile ( names, metrics ),
    updateEventHistory: fileUpdateEventHistory ( names )
  }
}