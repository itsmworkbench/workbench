import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessagesList } from "./messages.list";

import { getStyleForMessage, Message } from "../domain/message";


// Mock messages
const messages: Message[] = [
  { content: 'Hello, how are you?', role: 'user' },
  { content: 'I am fine, thank you!', role: 'system' },
];
const getBackgroundColor = ( element: HTMLElement ) => {
  return window.getComputedStyle ( element ).backgroundColor;
};
describe ( 'messageslist', () => {

  test ( 'renders MessagesList with items', () => {
    render (
      <MessagesList<Message> items={messages} itemStyle={getStyleForMessage}>
        {( message ) => <span>{message.content}</span>}
      </MessagesList>
    );

    const howAreYou = screen.getByText ( 'Hello, how are you?' );
    expect ( howAreYou ).toBeInTheDocument ();
    const fineThankYou = screen.getByText ( 'I am fine, thank you!' );
    expect ( fineThankYou ).toBeInTheDocument ();

  } );

} )
