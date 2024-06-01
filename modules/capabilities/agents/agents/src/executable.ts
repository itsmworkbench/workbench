import { ErrorsAnd, hasErrors } from "@laoban/utils";

export type Executable<Context, Query, Result> = {
  name: string
  description: string
  validate: ( c: Context, q: Query ) => Promise<string[]>
  validateResult: ( c: Context, q: Query, r: Result ) => Promise<string[]>
  fn: ( c: Context, q: Query ) => Promise<ErrorsAnd<Result> | undefined>
}

export function addLogToExecutable<Context, Query, Result> ( e: Executable<Context, Query, Result>, log: ( c: Context, q: Query, r: Result ) => void ): Executable<Context, Query, Result> {
  return {
    ...e,
    fn: async ( c, q ) => {
      const result = await e.fn ( c, q )
      if ( result !== undefined && !hasErrors ( result ) ) log ( c, q, result )
      return result
    }
  }
}

export async function execute<Context, Query, Result> ( e: Executable<Context, Query, Result>, c: Context, q: Query ): Promise<ErrorsAnd<Result>> {
  const inputErrors = await e.validate ( c, q )
  if ( inputErrors.length > 0 ) return inputErrors
  let result = await e.fn ( c, q );
  const resultErrors = hasErrors ( result ) ? result : await e.validateResult ( c, q, result )
  if ( resultErrors.length > 0 ) return resultErrors
  return result
}
export async function executeAgentNeedDefined<Context, Query, Result> ( msg: string, e: Executable< Context, Query, Result>, c: Context, q: Query ): Promise<ErrorsAnd<Result>> {
  const result = await execute ( e, c, q )
  if ( result === undefined ) throw new Error ( msg )
  return result
}
