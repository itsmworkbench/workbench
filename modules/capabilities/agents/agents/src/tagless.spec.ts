// Define three simple agents for functionBuilder
import { Agent, AgentBuilder, descriptionBuilder, functionBuilder, stringBuilder } from "./tagless";

const agentA: Agent<any, string, string> = async ( context, query ) => `${query}_a`;
const agentB: Agent<any, string, string> = async ( context, query ) => `${query}_b`;
const agentC: Agent<any, string, string> = async ( context, query ) => `${query}_c`;

// Function to create builders
function createAgents<B, Context> ( builder: AgentBuilder<B, Context, string, string> ): B {
  const a = builder.lift ( 'a', 'desca', agentA );
  const b = builder.lift ( 'b', 'descb', agentB );
  const c = builder.lift ( 'c', 'descc', agentC );
  const chainedAb = builder.chain ( [ a, b ] );
  const chainedAc = builder.chain ( [ a, c ] );
  return builder.parallel ( [ chainedAb, chainedAc ] );
}

// Define a merger function for the parallel execution in functionBuilder
// Create builders
describe ( 'Tagless Agent tests', () => {
  describe ( 'StringBuilder Tests', () => {
    const composedAgent = createAgents ( stringBuilder );
    test ( 'should create a chained and parallel string structure', () => {
      expect ( composedAgent ).toBe ( '[a->b,a->c]' );
    } );
  } );

  describe ( 'FunctionBuilder Tests', () => {
    const functionAgentBuilder = functionBuilder<any, string, string> (
      ( results: string[] ): string => results.join ( ',' ),
      result => result );
    const composedAgent = createAgents ( functionAgentBuilder );
    test ( 'should chain agents and execute in parallel', async () => {
      const result = await composedAgent ( {}, 'test' );
      expect ( result ).toBe ( 'test_a_b,test_a_c' ); // All agents should produce results, merged together
    } );
  } );

  describe ( 'DescriptionBuilder Tests', () => {
    const parallelDescriptionAgent = createAgents ( descriptionBuilder );
    test ( 'should create a description of the chained and parallel agents', () => {
      expect ( parallelDescriptionAgent ).toBe ( 'parallel:(chained:(a:desca, b:descb), chained:(a:desca, c:descc))' );
    } );
  } );
} );
