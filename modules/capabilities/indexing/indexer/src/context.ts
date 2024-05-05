import { CliContext } from "@itsmworkbench/cli";
import { YamlCapability } from "@itsmworkbench/yaml";
import { FetchFn } from "@itsmworkbench/indexing";

export interface IndexerContext extends CliContext {
  yaml: YamlCapability
  fetch: FetchFn
}