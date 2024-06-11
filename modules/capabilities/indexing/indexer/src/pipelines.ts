import { hasErrors, NameAnd } from "@laoban/utils";
import * as fs from "node:fs";
import { YamlCapability } from "@itsmworkbench/yaml";

export type Pipeline = {
  index: string;
  fields: string[];

  vectorField: string;// default: 'full_text_embeddings'
  type: string; //default: dense_vector
  dims?: number; // default: 384 or undefined if type is not dense_vector
  fullText: string; // default: 'full_text'
  vectorisationModel: string; // default: defaultVectorisationModel
}
export type Pipelines = NameAnd<Pipeline>

// export const defaultVectorisationModel = ".elser_model_2_linux-x86_64";
export const defaultVectorisationModel = '.multilingual-e5-small_linux-x86_64';

export function validatePipeline ( prefix: string, defaultVectorisationModel: string, f: any ): Pipeline {
  if ( typeof f !== 'object' ) throw new Error ( prefix + ' content must be an object' )
  const keys = Object.keys ( f )
  for ( const key of keys ) if ( [ 'index', 'fields', 'vectorisationModel', 'fullText', 'vectorField', 'vectorisationModel' ].indexOf ( key ) === -1 ) throw new Error ( prefix + ' invalid key ' + key )
  if ( typeof f.index !== 'string' ) throw new Error ( prefix + ' index must be a string' )
  if ( !Array.isArray ( f.fields ) ) throw new Error ( prefix + ' fields must be an array' )
  f.fields.forEach ( ( field: any, i ) => {if ( typeof field !== 'string' ) throw new Error ( prefix + ' fields[' + i + '] must be a string' )} )
  if ( f.fullText === undefined ) f.fullText = 'full_text'
  if ( typeof f.fullText !== 'string' ) throw new Error ( prefix + ' fullText must be a string' )
  if ( f.vectorField === undefined ) f.vectorField = 'full_text_embeddings'
  if ( typeof f.vectorField !== 'string' ) throw new Error ( prefix + ' vectorField must be a string' )
  if ( f.vectorisationModel === undefined ) f.vectorisationModel = defaultVectorisationModel
  if ( typeof f.vectorisationModel !== 'string' ) throw new Error ( prefix + ' vectorisationModel must be a string' )
  if ( f.type === undefined ) f.type = 'dense_vector'
  if ( typeof f.type !== 'string' ) throw new Error ( prefix + ' type must be a string' )
  if ( f.type === 'dense_vector' ) {
    if ( f.dims === undefined ) f.dims = 384
    if ( typeof f.dims !== 'number' ) throw new Error ( prefix + ' dims must be a number' )
  } else if ( f.type !== 'sparse_vector' ) throw new Error ( prefix + ' type must be dense_vector or sparse_vector' )
  return f as Pipeline
}
export function validatePipelines ( prefix: string, vectorisationModel: string, f: any ): Pipelines {
  if ( typeof f !== 'object' ) throw new Error ( prefix + ' content must be an object' )
  const keys = Object.keys ( f )
  const result: Pipelines = {}
  keys.forEach ( ( key, i ) => {result[ key ] = validatePipeline ( prefix + '.' + key, vectorisationModel, f[ key ] )} )
  return result
}

export async function loadAndValidatePipelines ( file: string, yaml: YamlCapability, vectorisationModel ): Promise<Pipelines> {
  const pipelines = await fs.promises.readFile ( file ).then ( ( data ) => yaml.parser ( data.toString ( 'utf8' ) ) )
  if ( hasErrors ( pipelines ) ) throw new Error ( pipelines.join ( '\n' ) )
  return validatePipelines ( file, vectorisationModel, pipelines )
}

export function pipelineBody ( name: string, pipeline: Pipeline, ): any {
  const value = pipeline.fields.map ( ( field ) => `{{{${field}}}}` ).join ( ' ' )
  return {
    "description": `Pipeline to process fields for vectorization for ${name} into ${pipeline.vectorisationModel}`,
    "processors": [
      {
        "set": {
          "field": pipeline.fullText,
          value,
        }
      },
      {
        "inference": {
          "model_id": pipeline.vectorisationModel,
          "input_output": [
            {
              "input_field": pipeline.fullText,
              "output_field": pipeline.vectorField
            }
          ]
        }
      }
    ]
  }
}

export function usePipelineBody ( name: string | null ): any {
  return {
    "index": {
      "default_pipeline": name
    }
  }
}