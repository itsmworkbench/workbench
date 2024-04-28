import fs from "fs";
import { inMemoryIncMetric, MetricHookState } from "@itsmworkbench/kleislis";
import { NameAnd } from "@laoban/utils";
import { FileNamesForTemporal } from "./filenames";

// export async function swapFiles ( file: string, newData: string ): Promise<void> {
//   try {
//     const tempFilePath = `${file}.tmp`;
//     console.log(`Swapping files. File ${file}. Newdata ${newData}`)
//     await fs.promises.writeFile ( tempFilePath, newData );
//     await fs.promises.rename ( tempFilePath, file );
//     console.log(`Finished swap files. File ${file}. Newdata ${newData}`)
//   } catch ( e ) {
//     console.error ( `Error swapping files. File ${file}. Newdata ${newData}. Error: ${e.message}` );
//     throw e
//   }
// }


export const metricsOnFile = ( names: FileNamesForTemporal ) => ( workspaceInstanceId: string ): MetricHookState => {
  const file = names.metrics ( workspaceInstanceId );
  const metrics: NameAnd<number> = {}
  return {
    incMetric: inMemoryIncMetric ( metrics ),
    writeMetrics: async () => fs.promises.writeFile( file, JSON.stringify ( metrics ) )
  }

};
