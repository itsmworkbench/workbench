import { jsYaml } from "./jsYaml";

const capability = jsYaml ()
describe ( "YamlCapability using jsYaml", () => {
  it ( "should write {}", () => {
    expect ( capability.writer ( {} ) ).toEqual ( `{}\n` )
  } )
  it ( "should write {a: 1, b: 2}", () => {
    expect ( capability.writer ( { a: 1, b: 2 } ) ).toEqual ( `a: 1\nb: 2\n` )
  } )
} )