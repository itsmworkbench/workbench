import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatBot } from './ChatBot';
import { SendMessageFn } from "../clients/sendMessage";
import { Message } from "../domain/message";

// A simple implementation of sendMessage to use in tests
const sendMessage: SendMessageFn = async (query: string, messages: Message[]): Promise<Message[]> => {
  return [...messages, { content: query, role: 'user' }];
};
const dispMessage = (m: Message, i: number) => <span>{m.content}</span>;
//mostly smoke tests. The individual components are well tested. We don't want to duplicate them here
describe('ChatBot', () => {
  test('renders initial state correctly', () => {
    render(<ChatBot sendMessage={sendMessage} dispMessage={dispMessage} />);
    expect(screen.getByText('ChatBot')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  test('sends a message and updates message list', async () => {
    render(<ChatBot sendMessage={sendMessage} dispMessage={dispMessage} />);
    const inputField = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByLabelText('Send message');

    fireEvent.change(inputField, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  test('scrolls to bottom when new message is added', async () => {
    render(<ChatBot sendMessage={sendMessage}  dispMessage={dispMessage}/>);
    const inputField = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByLabelText('Send message');

    fireEvent.change(inputField, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      const messageList = screen.getByRole('list');
      expect(messageList.scrollTop).toBe(messageList.scrollHeight - messageList.clientHeight);
    });
  });
});
