import React from 'react';
import { render } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { ChatTextInput, ChatTextInputProps } from './ChatTextInput';
import '@testing-library/jest-dom';


const setup = ( props: Partial<ChatTextInputProps> = {} ) => {
  const defaultProps: ChatTextInputProps = {
    send: jest.fn (),
    sendDebounce: 10, // Setting debounce to 10ms for testing
  };
  const utils = render ( <ChatTextInput {...defaultProps} {...props} /> );
  const input = utils.getByPlaceholderText ( 'Type your message...' ) as HTMLInputElement;
  const button = utils.getByRole ( 'button', { name: 'Send message' } );
  return {
    ...utils,
    input,
    button,
  };
};

describe ( 'ChatTextInput', () => {
  test ( 'renders correctly', () => {
    const { input, button } = setup ();
    expect ( input ).toBeInTheDocument ();
    expect ( button ).toBeInTheDocument ();
  } );

  test ( 'sends a message when the Send button is clicked', async () => {
    const sendMock = jest.fn ();
    const { input, button } = setup ( { send: sendMock } );

    fireEvent.change ( input, { target: { value: 'Hello' } } );
    fireEvent.click ( button );

    await waitFor ( () => {
      expect ( sendMock ).toHaveBeenCalledWith ( 'Hello' );
    } );

    expect ( input.value ).toBe ( '' );
  } );

  test ( 'sends a message when the Enter key is pressed', async () => {
    const sendMock = jest.fn ();
    const { input } = setup ( { send: sendMock } );

    fireEvent.change ( input, { target: { value: 'Hello' } } );
    fireEvent.keyDown ( input, { key: 'Enter', code: 'Enter' } );

    await waitFor ( () => {
      expect ( sendMock ).toHaveBeenCalledWith ( 'Hello' );
    } );

    expect ( input.value ).toBe ( '' );
  } );

  test ( 'does not send a message if the input is empty', async () => {
    const sendMock = jest.fn ();
    const { button } = setup ( { send: sendMock } );

    fireEvent.click ( button );

    await waitFor ( () => {
      expect ( sendMock ).not.toHaveBeenCalled ();
    } );
  } );

  test ( 'debounce functionality works correctly', async () => {
    const sendMock = jest.fn ();
    const { input, button } = setup ( { send: sendMock } );

    fireEvent.change ( input, { target: { value: 'Hello' } } );
    fireEvent.click ( button );

    fireEvent.change ( input, { target: { value: 'Hello again' } } );
    fireEvent.click ( button );

    await waitFor ( () => {
      expect ( sendMock ).toHaveBeenCalledTimes ( 1 );
      // expect(sendMock).toHaveBeenCalledWith('Hello');
      expect ( sendMock ).toHaveBeenCalledWith ( 'Hello again' );
    } );
  } );
} );
