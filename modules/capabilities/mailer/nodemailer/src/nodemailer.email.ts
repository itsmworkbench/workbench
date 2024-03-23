import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { emailConfigFromUrlStore, EmailFn, Mailer } from "@itsmworkbench/mailer";
import Mail from "nodemailer/lib/mailer";

export function sendEmailRaw ( transporter: Mail<SMTPTransport.SentMessageInfo>,
                               from: string ): EmailFn {
  return async email => {
    try {
      return await transporter.sendMail ( { ...email, from } )
    } catch ( e ) {
      return [ e.toString () ]
    }
  }
}

function testEmail ( transporter: Mail<SMTPTransport.SentMessageInfo> ) {
  return async () => {
    try {
      await transporter.verify ();
      return 'Test connection OK'
    } catch ( e ) {
      return [ e.toString () ]
    }
  };
}
export async function mailerFromConfig ( config: any ): Promise<Mailer> {
  let transporter: Mail<SMTPTransport.SentMessageInfo> = nodemailer.createTransport ( config.smtp )
  return {
    sendEmail: sendEmailRaw ( transporter, config.email ),
    test: testEmail ( transporter )
  }
}
export async function mailerFromUrlStore ( urlStore: any, organisation: string, name: string ): Promise<Mailer> {
  const config: any = await emailConfigFromUrlStore ( urlStore, organisation, name )
  console.log ( 'config', config )
  return mailerFromConfig ( config )
}
