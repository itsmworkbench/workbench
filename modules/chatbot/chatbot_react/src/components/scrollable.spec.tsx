import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Scrollable } from './scrollable';

describe ( "Scrollable", () => {
  test ( 'renders Scrollable with children', () => {
    render (
      <Scrollable dependencies={[]}>
        <div>Child 1</div>
        <div>Child 2</div>
      </Scrollable>
    );

    // Check if the children are rendered
    expect ( screen.getByText ( 'Child 1' ) ).toBeInTheDocument ();
    expect ( screen.getByText ( 'Child 2' ) ).toBeInTheDocument ();
  } );

  test ( 'applies scrollable style', () => {
    render (
      <Scrollable dependencies={[]}>
        <div>Child 1</div>
      </Scrollable>
    );

    const listElement = screen.getByRole ( 'list' );
    expect ( listElement ).toHaveStyle ( 'overflow-y: auto' );
    expect ( listElement ).toHaveStyle ( 'max-height: calc(100vh - 200px)' );
    expect ( listElement ).toHaveStyle ( 'margin-bottom: 10px' );
  } );

  test ( 'scrolls to bottom when dependencies change', () => {
    const { rerender } = render (
      <Scrollable dependencies={[ 0 ]}>
        <div style={{ height: '150vh' }}>Child 1</div>
        <div>Child 2</div>
      </Scrollable>
    );

    // Check initial scroll position
    const listElement = screen.getByRole ( 'list' );
    expect ( listElement.scrollTop ).toBe ( 0 );

    // Change dependencies to trigger scrolling
    rerender (
      <Scrollable dependencies={[ 1 ]}>
        <div style={{ height: '150vh' }}>Child 1</div>
        <div>Child 2</div>
      </Scrollable>
    );

    // Check if it scrolled to the bottom
    expect ( listElement.scrollTop ).toBe ( listElement.scrollHeight - listElement.clientHeight );
  } );
  test ( 'handles undefined parent gracefully', () => {
    // Render Scrollable with a child but isolate the endOfListRef to a div with no parent
    const { container } = render (
      <Scrollable dependencies={[]}>
        <div>Child 1</div>
      </Scrollable>
    );

    // Manually remove the parent element to simulate the undefined parent scenario
    const endOfListDiv = container.querySelector ( 'div' );
    if ( endOfListDiv ) {
      endOfListDiv.remove ();
    }

    // Trigger useEffect
    render (
      <Scrollable dependencies={[ 1 ]}>
        <div>Child 1</div>
      </Scrollable>
    );

    // Verify no errors are thrown and component renders as expected
    expect ( screen.getByText ( 'Child 1' ) ).toBeInTheDocument ();
  } );
} );