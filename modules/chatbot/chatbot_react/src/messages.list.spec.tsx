import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getStyleForMessage, Message, MessageListItem, MessagesList } from "./messages.list";

// Mock messages
const messages: Message[] = [
  { text: 'Hello, how are you?', sender: 'user' },
  { text: 'I am fine, thank you!', sender: 'bot' },
];
const getBackgroundColor = ( element: HTMLElement ) => {
  return window.getComputedStyle ( element ).backgroundColor;
};
describe ( 'messageslist', () => {

  describe ( 'getStyleForMessage', () => {
    it ( 'returns correct style for user message', () => {
      const style = getStyleForMessage ( { sender: 'user', text: 'Test' } );
      expect ( style ).toEqual ( {
        justifyContent: 'flex-start',
        backgroundColor: '#DCF8C6',
        padding: '10px',
        borderRadius: '10px',
        maxWidth: '60%',
      } );
    } );

    it ( 'returns correct style for bot message', () => {
      const style = getStyleForMessage ( { sender: 'bot', text: 'Test' } );
      expect ( style ).toEqual ( {
        justifyContent: 'flex-end',
        backgroundColor: '#91d7df',
        padding: '10px',
        borderRadius: '10px',
        maxWidth: '60%',
      } );
    } );
  } );

  describe ( 'MessageListItem', () => {
    it ( 'renders a user message correctly', () => {
      const message: Message = { text: 'User message', sender: 'user' };
      render ( <MessageListItem message={message}/> );

      const messageElement = screen.getByText ( 'User message' );
      expect ( messageElement ).toBeInTheDocument ();
    } );

    it ( 'renders a bot message correctly', () => {
      const message: Message = { text: 'Bot message', sender: 'bot' };
      render ( <MessageListItem message={message}/> );

      const messageElement = screen.getByText ( 'Bot message' );
      expect ( messageElement ).toBeInTheDocument ();

    } );
  } );

  describe ( 'MessagesList', () => {
    it ( 'renders the list of messages', () => {
      render ( <MessagesList messages={messages}/> );

      messages.forEach ( message => {
        const messageElement = screen.getByText ( message.text );
        expect ( messageElement ).toBeInTheDocument ();
      } );
    } );

    it ( 'applies styles correctly to the messages list container', () => {
      render ( <MessagesList messages={messages}/> );

      const listElement = screen.getByRole ( 'list' );
      expect ( listElement ).toHaveStyle ( {
        height: '300px',
        overflowY: 'auto',
        marginBottom: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
      } );
    } );
  } );
} )
