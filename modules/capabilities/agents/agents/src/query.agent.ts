import { AgentBuilder } from "./agents.tagless";
import { flatMap, NameAnd } from "@laoban/utils";
import { Agent } from "node:http";

/**
 * QueryAgentBuilder interface for creating agents with different execution strategies.
 * This interface is an example of the tagless interpreter pattern.
 *
 * In the tagless interpreter pattern, we define an interface that describes the operations
 * we want to perform without specifying how they should be implemented.
 * Different implementations of this interface can provide different outputs
 * Good examples are: A string display of the agents, a function builder for agents, a function builder with built in profiling or debugging, etc.

 * In this case, QueryAgentBuilder that allows us to define how we process a query:
 * calculating the intent, deciding what agents are to be executed, and how to compose the result
 *
 * @template B - The type of the agent being built.
 * @template Context - The type of the context passed to the agents.
 * @template Result - The type of the result produced by the agents.
 */
export interface QueryAgentBuilder<B, Context, Input, Result> extends AgentBuilder<B, Context, Input, Result> {
  calculateIntent: B
  workOutAgents ( query: Input, ): string[];
}

function buildQuery<B, Context, Input, Result> ( builder: QueryAgentBuilder<B, Context, Input, Result>,
                                                 fn: ( b: AgentBuilder<B, Context, Input, Result> ) => NameAnd<B> ): Agent<Context, Input, Result> {
  const nameAndAgents = fn ( builder );
  return ( context, query ) => {
    const intent = builder.calculateIntent ;
    const agentNames = builder.workOutAgents ( query );
    const agents = flatMap ( agentNames, name => name in nameAndAgents ? [ nameAndAgents[ name ] ] : [] );
    return builder.parallel ( agents );
  }
}
