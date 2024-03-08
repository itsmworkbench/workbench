import { appendEventProcessor, defaultEventProcessor, EventProcessor, setIdEventProcessor, setValueEventProcessor, zeroEventProcessor } from "./event.processor";
import { EventContext } from "./events";

const data = {
  "a": {
    "b": {
      "c": 1
    }
  }
}
type Data = typeof data
const eventProcessor: EventProcessor<Data> = defaultEventProcessor<Data> ( '', {} as Data, async ( id: string ) =>
  ({ id: id, result: `from ${id}`, mimeType: 'something' }) )
let context: EventContext = { some: "metadata" };
describe ( "eventProcessors", () => {
  describe ( "zeroEventProcessor", () => {
    it ( "should return zero", async () => {
      let zero = await zeroEventProcessor<Data> () ( eventProcessor, { event: "zero", context }, data )
      expect ( zero ).toEqual ( {} )
    } )
  } )
  describe ( "setIdEventProcessor", () => {
    it ( "should set value", async () => {
      let setId = await setIdEventProcessor<Data> () ( eventProcessor, { event: "setId", context, path: "a.b.c", id: "id", parser: "json" }, data )
      expect ( setId ).toEqual ( { "a": { "b": { "c": "from id" } } } )
    } )
  } )
  describe ( "setValueEventProcessor", () => {
    it ( "should set value", async () => {
      let setValue = await setValueEventProcessor<Data> () ( eventProcessor, { event: "setValue", context, path: "a.b.c", value: 2 }, data )
      expect ( setValue ).toEqual ( { a: { b: { c: 2 } } } )
    } )
    it ( "should set value when not all data in parent is there", async () => {
      let setValue = await setValueEventProcessor<Data> () ( eventProcessor, { event: "setValue", context, path: "e.f.g", value: 2 }, data )
      expect ( setValue ).toEqual ( { "a": { "b": { "c": 1 } }, "e": { "f": { "g": 2 } } } )
    } )
  } )
  describe ( "appendEventProcessor", () => {
    it ( "should append value if array doesn't exist", async () => {
      let append = await appendEventProcessor<Data> () ( eventProcessor, { event: "append", context, path: "a.b.d", value: 2 }, data )
      expect ( append ).toEqual ( { "a": { "b": { "c": 1, "d": [ 2 ] } } } )
    } )
    it ( "should append value if array doesn't exist and parents don't exist", async () => {
      let append = await appendEventProcessor<Data> () ( eventProcessor, { event: "append", context, path: "e.f.g", value: 2 }, data )
      expect ( append ).toEqual ( { "a": { "b": { "c": 1 } }, "e": { "f": { "g": [ 2 ] } } } )
    } )
    it ( "should append value if array exists", async () => {
      let append = await appendEventProcessor<Data> () ( eventProcessor, { event: "append", context, path: "d", value: 2 }, { ...data, d: [ 'a' ] } as Data )
      expect ( append ).toEqual ( { "a": { "b": { "c": 1 } }, "d": [ "a", 2 ] } )
    } )
  } )
} )