export function doTwoThings<X> ( one: ( x: X ) => void, two: ( x: X ) => void ) {
  return ( x: X ) => {
    one ( x );
    two ( x );
  };
}