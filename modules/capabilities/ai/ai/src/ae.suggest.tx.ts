
export type AISuggestTxInput = {
  input: any
  output: any
}

export type AISuggestTxOutput = string

export type AISuggestTx = ( suggest: AISuggestTxInput ) => Promise<AISuggestTxOutput>