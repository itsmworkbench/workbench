import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatTextLine } from './ChatTextLine';

describe('ChatTextLine', () => {
  describe('ChatTextInput', () => {
    test('renders input field', () => {
      render(<ChatTextLine send={jest.fn()} />);
      const inputField = screen.getByPlaceholderText('Type your message...');
      expect(inputField).toBeInTheDocument();
    });

    test('calls setInput on input change', () => {
      render(<ChatTextLine send={jest.fn()} />);
      const inputField = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(inputField, { target: { value: 'Hello' } });
      expect(inputField).toHaveValue('Hello');
    });

    test('calls send on Enter key press', async () => {
      const sendMock = jest.fn();
      render(<ChatTextLine send={sendMock} />);
      const inputField = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(inputField, { target: { value: 'Hello' } });
      fireEvent.keyDown(inputField, { key: 'Enter', code: 'Enter' });
      await waitFor(() => expect(sendMock).toHaveBeenCalledWith('Hello'));
    });
  });

  describe('ChatTextLine', () => {
    test('calls send and clears input on button click', async () => {
      const sendMock = jest.fn();
      render(<ChatTextLine send={sendMock} />);
      const inputField = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByLabelText('Send message');
      fireEvent.change(inputField, { target: { value: 'Hello' } });
      fireEvent.click(sendButton);
      await waitFor(() => {
        expect(sendMock).toHaveBeenCalledWith('Hello');
        expect(inputField).toHaveValue('');
      });
    });
  });
});
