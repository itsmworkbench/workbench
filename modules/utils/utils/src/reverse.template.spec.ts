import { reverseTemplate } from "./reverse.template";

describe('reverseTemplate', () => {
  it('replaces variables with their template notation', () => {
    const variables = {
      'user.name': 'John Doe',
      'user.age': '30',
    };
    const inputString = "Hello, John Doe! You are 30 years old.";
    const expectedTemplate = "Hello, ${user.name}! You are ${user.age} years old.";
    expect(reverseTemplate(inputString, variables)).toBe(expectedTemplate);
  });


  it('handles input with no variables correctly', () => {
    const variables = {};
    const inputString = "Hello, John Doe! You are 30 years old.";
    // Expect the input string to be unchanged since there are no variables to replace
    expect(reverseTemplate(inputString, variables)).toBe(inputString);
  });

  it('correctly processes variables with dots in their names', () => {
    const variables = {
      'complex.variable.name': 'some value',
    };
    const inputString = "This is a test with some value in it.";
    const expectedTemplate = "This is a test with ${complex.variable.name} in it.";
    expect(reverseTemplate(inputString, variables)).toBe(expectedTemplate);
  });

  it('returns the original string if no replacements are made', () => {
    const variables = {
      'unused.variable': 'value',
    };
    const inputString = "This string does not contain the variable.";
    // Expect the original string back since it does not contain the variable value
    expect(reverseTemplate(inputString, variables)).toBe(inputString);
  });
});// Assuming findUsedVariables is in a file named 'variableFinder.ts'

