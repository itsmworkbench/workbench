
export type AISuggestTxInput = {
  input: any
  output: any
}

export type AISuggestTxOutput = string

export type AISuggestTx = ( suggest: AISuggestTxInput ) => Promise<AISuggestTxOutput>

export type SuggestJsonSChemaInput = {
  input: any
}
export type SuggestJsonSChemaOutput = string

export type AISuggestJsonSchema = ( suggest: SuggestJsonSChemaInput ) => Promise<SuggestJsonSChemaOutput>