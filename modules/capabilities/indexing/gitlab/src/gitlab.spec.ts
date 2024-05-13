import { parseLinkHeader } from "./gitlab.index";

describe ( 'parseLinkHeader', () => {
  it ( 'should extract the next link when present', () => {
    const linkHeader = '<https://gitlab.com/api/v4/projects?page=2>; rel="next",<https://gitlab.com/api/v4/projects?page=1>; rel="prev"';
    const result = parseLinkHeader ( linkHeader );
    expect ( result.next ).toBe ( 'https://gitlab.com/api/v4/projects?page=2' );
  } );

  it ( 'should return undefined for next when no next link is present', () => {
    const linkHeader = '<https://gitlab.com/api/v4/projects?page=1>; rel="prev"';
    const result = parseLinkHeader ( linkHeader );
    expect ( result.next ).toBeUndefined ();
  } );

  it ( 'should handle null link headers gracefully', () => {
    const result = parseLinkHeader ( null );
    expect ( result.next ).toBeUndefined ();
  } );

  it ( 'should handle empty link headers gracefully', () => {
    const result = parseLinkHeader ( '' );
    expect ( result.next ).toBeUndefined ();
  } );
} );