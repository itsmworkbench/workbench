import { chatgptTicketVariables, clientSecret } from "./chatgpt.ticket.variables";

describe ( 'ChatGPTTicketVariables', () => {
  it ( "should do cool stuff",async  () => {
    console.log ( 'debug: clientSecret', clientSecret )
    expect (await  chatgptTicketVariables ( 'ticket' ) ).toEqual ( {a:1} )

  } )

} );