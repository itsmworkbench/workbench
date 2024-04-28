import { extractVariableNames, findUsedVariables } from "./extract.variables";

describe ( 'findUsedVariables', () => {
  const variables = {
    'user.name': 'John Doe',
    'user.age': '30',
    'unused.variable': 'Some unused value',
    'partially.matched': 'JohnX',
  };

  const inputString = "Hello, John Doe! You are 30 years old.";

  it ( 'identifies variables that are used in the input string', () => {
    const expectedUsedVariables = [ 'user.age', 'user.name', ].sort ();
    const usedVariables = findUsedVariables ( inputString, variables ).sort ();
    expect ( usedVariables ).toEqual ( expectedUsedVariables );
  } );

  it ( 'does not include variables that are not used', () => {
    const unexpectedVariable = [ 'unused.variable' ];
    const usedVariables = findUsedVariables ( inputString, variables ).sort ();
    expect ( usedVariables ).toEqual ( expect.not.arrayContaining ( unexpectedVariable ) );
  } );

  it ( 'handles variables with values that could match multiple parts of the input', () => {
    const expectedUsedVariables = [ 'user.age', 'user.name' ].sort (); // Adjust expectations as needed
    const usedVariables = findUsedVariables ( inputString, variables ).sort ();
    expect ( usedVariables ).toEqual ( expectedUsedVariables );
  } );

  it ( 'returns an empty array when no variables are used', () => {
    const noMatchVariables = { 'irrelevant.variable': 'No Match' };
    const expectedUsedVariables = [];
    const usedVariables = findUsedVariables ( inputString, noMatchVariables ).sort ();
    expect ( usedVariables ).toEqual ( expectedUsedVariables );
  } );
} );
// logger.test.ts

// logger.test.ts

describe('extractVariableNames', () => {
  it('should extract single variable names correctly', () => {
    const template = 'Function called with {param}';
    expect(extractVariableNames(template)).toEqual(['param']);
  });

  it('should extract multiple variable names correctly', () => {
    const template = 'Entered {in} ==>{out}';
    expect(extractVariableNames(template)).toEqual(['in', 'out']);
  });

  it('should handle variable names with dots', () => {
    const template = 'Environment settings {env.name1} and {env.name2}';
    expect(extractVariableNames(template)).toEqual(['env.name1', 'env.name2']);
  });

  it('should handle no variable names', () => {
    const template = 'No variables here';
    expect(extractVariableNames(template)).toEqual([]);
  });


  // Updated test case
  it('should ignore malformed braces and handle well-formed braces correctly', () => {
    const template = 'This is {wrong and this {is correct} also {another.one}';
    expect(extractVariableNames(template)).toEqual(['is correct', 'another.one']);
  });

  it('should handle empty braces', () => {
    const template = 'Empty {} should not count';
    expect(extractVariableNames(template)).toEqual([]);
  });

  it('should trim spaces in the brackets', () => {
    const template = 'Spacing { variable } is trimmed';
    expect(extractVariableNames(template)).toEqual(['variable']);
  });
});
