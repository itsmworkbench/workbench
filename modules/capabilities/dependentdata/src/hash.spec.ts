import { diHashChanged } from './hash';

describe ( 'diDashChanged', () => {
  test ( 'should return false for equal strings', () => {
    expect ( diHashChanged ( 'test', 'test' ) ).toBe ( false );
  } );

  test ( 'should return true for different strings', () => {
    expect ( diHashChanged ( 'test1', 'test2' ) ).toBe ( true );
  } );

  test ( 'should return false for two equal string arrays', () => {
    expect ( diHashChanged ( [ 'a', 'b' ], [ 'a', 'b' ] ) ).toBe ( false );
  } );

  test ( 'should return true for different string arrays', () => {
    expect ( diHashChanged ( [ 'a', 'b' ], [ 'a', 'c' ] ) ).toBe ( true );
  } );

  test ( 'should return true for string arrays of different lengths', () => {
    expect ( diHashChanged ( [ 'a', 'b' ], [ 'a', 'b', 'c' ] ) ).toBe ( true );
  } );

  test ( 'should return true for a string and a string array', () => {
    expect ( diHashChanged ( 'a', [ 'a' ] ) ).toBe ( true );
  } );

  test ( 'should return true for a string array and a string', () => {
    expect ( diHashChanged ( [ 'a' ], 'a' ) ).toBe ( true );
  } );

  test ( 'should return false for an empty string and an empty string array', () => {
    expect ( diHashChanged ( '', [] ) ).toBe ( true );
  } );

  test ( 'should return false for two empty string arrays', () => {
    expect ( diHashChanged ( [], [] ) ).toBe ( false );
  } );

  test ( 'should return true for non-matching elements in string arrays', () => {
    expect ( diHashChanged ( [ 'a', 'b', 'c' ], [ 'a', 'c', 'b' ] ) ).toBe ( true );
  } );
} );
