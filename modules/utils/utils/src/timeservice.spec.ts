import { calculateSinceDate, DateTimeService } from "./timeservice";

describe ( 'calculateSinceDate', () => {
  const fixedTime = new Date ( '2024-05-25T12:00:00Z' ).getTime ();
  const timeService = () => fixedTime;

  it ( 'should correctly calculate the date for "-1d"', () => {
    const result = calculateSinceDate ( timeService ) ( '1d' );
    expect ( result.toISOString () ).toBe ( '2024-05-24T12:00:00.000Z' );
  } );
  it ( 'should correctly calculate the date for "-10d"', () => {
    const result = calculateSinceDate ( timeService ) ( '1d' );
    expect ( result.toISOString () ).toBe ( '2024-05-24T12:00:00.000Z' );
  } );
  it ( 'should correctly calculate the date for "-100d"', () => {
    const result = calculateSinceDate ( timeService ) ( '1d' );
    expect ( result.toISOString () ).toBe ( '2024-05-24T12:00:00.000Z' );
  } );
  it ( 'should not die when used with real time service', () => {
    const result = calculateSinceDate ( DateTimeService ) ( '1d' );
    const string = result.toISOString ();
    expect ( string.indexOf ( 'NaN' ) ).toBe ( -1 );

  } )

  it ( 'should correctly calculate the date for "-5h"', () => {
    const result = calculateSinceDate ( timeService ) ( '5h' );
    expect ( result.toISOString () ).toBe ( '2024-05-25T07:00:00.000Z' );
  } );

  it ( 'should correctly calculate the date for "-30m"', () => {
    const result = calculateSinceDate ( timeService ) ( '30m' );
    expect ( result.toISOString () ).toBe ( '2024-05-25T11:30:00.000Z' );
  } );

  it ( 'should throw an error for unsupported time unit', () => {
    expect ( () => calculateSinceDate ( timeService ) ( '1w' ) ).toThrow ( 'Unsupported time unit: w' );
  } );
} );
