import { pathToLens } from "./optics";

const data = {
  "a": {
    "b": {
      "c": 1
    }
  }
}
type Data = typeof data
const p2Lens = pathToLens<Data> ()
describe ( "pathToLens", () => {
  it ( "should return identity for empty path", () => {
    let lens = p2Lens ( "" );
    expect ( lens.description ).toEqual ( "I" )
    expect ( lens.getOption ( data ) ).toEqual ( data )
  } )
  it ( "should return lens for a.b.c", () => {
    let lens = p2Lens ( "a.b.c" );
    expect ( lens.getOption ( data ) ).toEqual ( 1 )
  } )
} )