export type Message = {
  content: string;
  role: 'user' | 'system' | 'assistant';
};

export const getStyleForMessage = ( { role }: Message ) => {
  return {
    justifyContent: role === 'user' ? 'flex-start' : 'flex-end',
    backgroundColor: role === 'user' ? '#DCF8C6' : '#91d7df',
    padding: '10px',
    borderRadius: '10px',
    maxWidth: '80%',
    whiteSpace: 'pre-line',
  };
};