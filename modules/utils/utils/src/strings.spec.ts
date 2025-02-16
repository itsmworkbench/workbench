import {camelCaseToWords, ellipsesInMiddle, simpleTemplate, splitAndCapitalize, toCamelCase} from "./strings";

describe('toCamelCase', () => {
  test('converts mixed separators while preserving existing camelCase', () => {
    const input = "Example-string_with mixedSeparation";
    const output = "exampleStringWithMixedSeparation";
    expect(toCamelCase(input)).toBe(output);
  });

  test('converts string starting with uppercase', () => {
    const input = "ThisStartsWithUppercase and_has_mixed-separation";
    const output = "thisStartsWithUppercaseAndHasMixedSeparation";
    expect(toCamelCase(input)).toBe(output);
  });

  test('preserves existing camelCase within the string', () => {
    const input = "alreadyInCamelCase ANDThisIsMixed";
    const output = "alreadyInCamelCaseANDThisIsMixed";
    expect(toCamelCase(input)).toBe(output);
  });

  test('converts all lowercase with separators to camelCase', () => {
    const input = "all-lowercase with_separators";
    const output = "allLowercaseWithSeparators";
    expect(toCamelCase(input)).toBe(output);
  });

  test('handles numbers and special characters within the string', () => {
    const input = "some_numbers123 and_special$chars";
    const output = "someNumbers123AndSpecialChars";
    expect(toCamelCase(input)).toBe(output);
  });
});

// Import the function if it's defined in a separate module, for example:
// import { splitAndCapitalize } from './path-to-your-function';

describe('splitAndCapitalize', () => {
  it('converts camelCase to space-separated words with the first letter capitalized', () => {
    expect(splitAndCapitalize('helloWorld')).toBe('Hello World');
    expect(splitAndCapitalize('ThisIsASample')).toBe('This Is A Sample');
  });

  it('handles single-word input without spaces', () => {
    expect(splitAndCapitalize('Word')).toBe('Word');
  });

  it('returns an empty string for empty input', () => {
    expect(splitAndCapitalize('')).toBe('');
  });

  it('returns an empty string for undefined input', () => {
    expect(splitAndCapitalize(undefined)).toBe('');
  });

});

describe('simpleTemplate', () => {
  it('should correctly replace the template placeholders with corresponding object values', () => {
    const template = 'Hello, {name}! Your role is {role}.';
    const data = { name: 'Alice', role: 'admin' };
    const expected = 'Hello, Alice! Your role is admin.';
    expect(simpleTemplate(template, data)).toEqual(expected);
  });

  it('should leave the placeholder intact if no corresponding key is found', () => {
    const template = 'Hello, {name}! Your role is {role}.';
    const data = { name: 'Bob' }; // 'role' key is missing
    const expected = 'Hello, Bob! Your role is {role}.';
    expect(simpleTemplate(template, data)).toEqual(expected);
  });

  it('should handle multiple occurrences of the same placeholder', () => {
    const template = '{greeting}, {name}! {greeting}, how are you?';
    const data = { greeting: 'Hello', name: 'Charlie' };
    const expected = 'Hello, Charlie! Hello, how are you?';
    expect(simpleTemplate(template, data)).toEqual(expected);
  });

  it('should correctly handle empty values in data object', () => {
    const template = 'Data: {value}';
    const data = { value: '' };
    const expected = 'Data: ';
    expect(simpleTemplate(template, data)).toEqual(expected);
  });

  it('should correctly handle numerical values in data object', () => {
    const template = 'The number is {number}';
    const data = { number: 123 };
    const expected = 'The number is 123';
    expect(simpleTemplate(template, data)).toEqual(expected);
  });

  it('should return the original string when data object is empty', () => {
    const template = 'Hello, {name}!';
    const data = {};
    const expected = 'Hello, {name}!';
    expect(simpleTemplate(template, data)).toEqual(expected);
  });

  it('should correctly handle null and undefined as values', () => {
    const template = 'Null value: {nullValue}, Undefined value: {undefinedValue}';
    const data = { nullValue: null, undefinedValue: undefined };
    const expected = 'Null value: null, Undefined value: undefined';
    expect(simpleTemplate(template, data)).toEqual(expected);
  });
});


describe("ellipsesInMiddle", () => {
  test("returns full string if within maxLength", () => {
    expect(ellipsesInMiddle("short", 10)).toBe("short");
  });

  test("truncates with default ellipses in the middle", () => {
    expect(ellipsesInMiddle("abcdefghijklmno", 11)).toBe("abcd...lmno");
  });

  test("truncates with custom ellipses", () => {
    expect(ellipsesInMiddle("abcdefghijklmno", 11, "[...]")).toBe("abc[...]mno");
  });

  test("returns only ellipsis if maxLength is too small", () => {
    expect(ellipsesInMiddle("abcdefghij", 4)).toBe("...");
    expect(ellipsesInMiddle("abcdefghij", 5, "[...]")).toBe("[...]");
  });

  test("handles edge cases with extremely small maxLength", () => {
    expect(ellipsesInMiddle("abcdefghij", 3)).toBe("...");
    expect(ellipsesInMiddle("abcdefghij", 2, "--")).toBe("--");
  });
});


describe('camelCaseToWords', () => {
  it('converts simple camelCase strings to words', () => {
    expect(camelCaseToWords('thisText')).toBe('This Text');
    expect(camelCaseToWords('anotherExample')).toBe('Another Example');
  });

  it('handles multiple uppercase letters correctly', () => {
    expect(camelCaseToWords('HTMLParserTest')).toBe('HTML Parser Test');
    expect(camelCaseToWords('XmlHTTPRequest')).toBe('Xml HTTP Request');
  });

  it('handles single word strings', () => {
    expect(camelCaseToWords('example')).toBe('Example');
  });

  it('handles strings with numbers', () => {
    expect(camelCaseToWords('test123String')).toBe('Test 123 String');
    expect(camelCaseToWords('123startHere')).toBe('123 Start Here');
    expect(camelCaseToWords('this1Is2ATest3')).toBe('This 1 Is 2 A Test 3');
  });

  it('handles strings with special characters', () => {
    expect(camelCaseToWords('test_with_special_@')).toBe('Test_with_special_@');
    expect(camelCaseToWords('another-Test')).toBe('Another-Test');
  });

  it('handles empty strings', () => {
    expect(camelCaseToWords('')).toBe('');
  });

  it('handles strings with existing spaces', () => {
    expect(camelCaseToWords('thisText AlreadyFormatted')).toBe('This Text Already Formatted');
  });

  it('handles strings that are already properly formatted', () => {
    expect(camelCaseToWords('Already Proper')).toBe('Already Proper');
  });

  it('trims leading and trailing spaces', () => {
    expect(camelCaseToWords('  thisText  ')).toBe('This Text');
  });
});
