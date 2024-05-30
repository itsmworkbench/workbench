import { mapK } from "@laoban/utils";

/**
 * AgentBuilder interface for creating agents with different execution strategies.
 * This interface is an example of the tagless interpreter pattern.
 *
 * In the tagless interpreter pattern, we define an interface that describes the operations
 * we want to perform without specifying how they should be implemented.
 * Different implementations of this interface can provide different outputs
 * Good examples are: A string display of the agents, a function builder for agents, a function builder with built in profiling or debugging, etc.

 * In this case, AgentBuilder allows for lifting functions into agents, chaining agents to run sequentially,
 * and executing agents in parallel.
 *
 * @template B - The type of the agent being built.
 * @template Context - The type of the context passed to the agents.
 * @template Result - The type of the result produced by the agents.
 */
export interface AgentBuilder<B, Context, Input, Result> {
  lift: ( name: string, description: string, fn: ( c: Context, q: Input ) => Promise<Result> ) => B;
  resultToInput: ( r: Result ) => Input | undefined//needed if we are going to chain
  chain: ( bs: B[] ) => B;
  parallel: ( bs: B[] ) => B;
}

/**
 * Chains multiple agents into a single agent that executes sequentially.
 * @param builder - The agent builder.
 * @param bs - The agents to chain.
 * @returns The chained agent.
 */
export function chainAgents<B> ( builder: AgentBuilder<B, any, any, any>, bs: B[] ): B {
  return builder.chain ( bs );
}

/**
 * Executes multiple agents in parallel.
 * @param builder - The agent builder.
 * @param bs - The agents to execute in parallel.
 * @param resultToInput - Function to convert the result of an agent to the input of the next agent.
 * @returns The parallel agent.
 */
export function parallelAgents<B, Input, Result> ( builder: AgentBuilder<B, any, Input, Result>, bs: B[], resultToInput: ( r: Result ) => Input ): B {
  return builder.parallel ( bs );
}

export const stringBuilder: AgentBuilder<string, any, any, any> = {
  lift: ( name: string, description: string, fn: ( c: any, q: any ) => Promise<any> ) => name,
  resultToInput: ( r: any ) => undefined,
  chain: ( bs: string[] ) => bs.join ( '->' ),
  parallel: ( bs: string[] ) => '[' + bs.join ( ',' ) + ']'
}

export type Agent<Context, Input, Result> = ( context: Context, query: Input ) => Promise<Result | undefined>;

/**
 * Creates a function builder for agents with chaining and parallel execution.
 * @param resultToInput - Function to convert the result of an agent to the input of the next agent.
 * @param merger - Function to merge the results of parallel agents.
 * @returns The agent builder.
 */
export function functionBuilder<Context, Input, Result> ( merger: ( rs: Result[] ) => Result, resultToInput?: ( r: Result ) => Input | undefined ): AgentBuilder<Agent<Context, Input, Result>, Context, Input, Result> {
  if ( resultToInput === undefined ) resultToInput = ( r: Result ) => undefined
  return {
    lift: ( name: string, description: string, fn: ( context: Context, query: Input ) => Promise<Result> ) => fn,
    chain: ( bs: Agent<Context, Input, Result>[] ) => {
      if ( bs.length === 0 ) return async () => undefined;
      const [ first, ...rest ] = bs;
      return async ( context: Context, query: Input ) => {
        let result = await first ( context, query );
        for ( const b of rest ) {
          if ( result === undefined ) return undefined;
          result = await b ( context, resultToInput ( result ) );
        }
        return result
      };
    },
    resultToInput,
    parallel: ( bs: Agent<Context, Input, Result>[] ) =>
      async ( context: Context, query: Input ) =>
        merger ( await mapK ( bs, b => b ( context, query ) ) )
  };
}
export const descriptionBuilder: AgentBuilder<string, any, any, any> = {
  lift: (name: string, description: string, fn: (c: any, q: any) => Promise<any>) => `${name}:${description}`,
  resultToInput: (r: any) => undefined,
  chain: (bs: string[]) => `chained:(${bs.join(', ')})`,
  parallel: (bs: string[]) => `parallel:(${bs.join(', ')})`
};
