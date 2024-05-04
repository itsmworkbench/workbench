import { NameAnd } from "@laoban/utils";
import { DataSource } from "./sources.domain";
import { RetryPolicyConfig } from "@itsmworkbench/kleislis"

export type WorkerConfig = {
  source: DataSource
  workerCount: number;
  fileNameTemplate: string;
  batchSize: number;
  retryPolicy: RetryPolicyConfig;
  throttle?: number;
};


export type SystemConfig = {
  sources: NameAnd<WorkerConfig>;
};

