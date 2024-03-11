import { chatgptTicketVariables } from "./chatgpt.ticket.variables";

describe ( 'ChatGPTTicketVariables', () => {
  it ( "should do cool stuff",async  () => {
    expect (await  chatgptTicketVariables ( 'ticket' ) ).toEqual ( {a:1} )

  } )

} );