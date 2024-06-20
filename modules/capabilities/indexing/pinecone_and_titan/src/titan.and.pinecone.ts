import { TitanConfig, titanVectorisation } from "./titan";
import { massTurnEsIndexToPineconeIndexAndBody, PineconeConfig, postAllIndexes } from "./pinecone";
import { FetchFn } from "@itsmworkbench/indexing";

export function postToPineconeUsingTitan ( titanConfig: TitanConfig, pineconeConfig: PineconeConfig, fetch: FetchFn ) {
  const vectorisation = titanVectorisation ( titanConfig, fetch );
  return async ( lines: string[] ) => {
    const iAndBody = await massTurnEsIndexToPineconeIndexAndBody ( pineconeConfig.fields, vectorisation, lines );
    return await postAllIndexes ( fetch, pineconeConfig, iAndBody )
  }
}