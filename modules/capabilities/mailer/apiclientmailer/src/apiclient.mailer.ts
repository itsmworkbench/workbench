import { EmailFn, Mailer } from "@itsmworkbench/mailer";

function sendEmail ( url: string ) {
  return async ( email: any ) => {
    const response = await fetch ( url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify ( email )
    } );
    return response.json ();
  };
}
export function apiClientMailer ( url: string ): Mailer {
  return {
    sendEmail: sendEmail ( url ),
    test: () => sendEmail ( url + "/test" ) ( {} )
  }
}