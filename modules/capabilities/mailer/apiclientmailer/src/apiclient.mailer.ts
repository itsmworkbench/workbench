import { EmailFn } from "@itsmworkbench/mailer";

export function sendEmailApiClient ( url: string ): EmailFn {
  return async email => {
    const response = await fetch ( url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify ( email )
    } );
    return response.json ();
  }
}