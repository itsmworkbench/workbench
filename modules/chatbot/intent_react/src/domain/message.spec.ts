import { getStyleForMessage, Message } from "./message";

describe('getStyleForMessage', () => {
  test('returns correct styles for user role', () => {
    const message: Message = { content: 'Hello', role: 'user' };
    const expectedStyles = {
      justifyContent: 'flex-start',
      backgroundColor: '#DCF8C6',
      padding: '10px',
      borderRadius: '10px',
      maxWidth: '80%',
      whiteSpace: 'pre-line',
    };

    const result = getStyleForMessage(message);

    expect(result).toEqual(expectedStyles);
  });

  test('returns correct styles for assistant role', () => {
    const message: Message = { content: 'Hello', role: 'assistant' };
    const expectedStyles = {
      justifyContent: 'flex-end',
      backgroundColor: '#91d7df',
      padding: '10px',
      borderRadius: '10px',
      maxWidth: '80%',
      whiteSpace: 'pre-line',
    };

    const result = getStyleForMessage(message);

    expect(result).toEqual(expectedStyles);
  });

  test('returns correct styles for system role', () => {
    const message: Message = { content: 'Hello', role: 'system' };
    const expectedStyles = {
      justifyContent: 'flex-end',
      backgroundColor: '#91d7df',
      padding: '10px',
      borderRadius: '10px',
      maxWidth: '80%',
      whiteSpace: 'pre-line',
    };

    const result = getStyleForMessage(message);

    expect(result).toEqual(expectedStyles);
  });
});
