import { evaluateDis } from "./dependant.execution";
import { allDi, paramDi } from "./dependent.data.fixture";

describe ( "evaluateDis", () => {
  it ( "should just list paramsDi when empty state and nothing loaded", () => {
    let evaluate = evaluateDis ( () => undefined ) ( allDi );
    let actual = evaluate ( {} );
    expect ( actual ).toEqual ( [ {
      di: paramDi,
      "params": [],
      "type": "leave"
    } ] )
  } )
} )