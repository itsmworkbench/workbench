import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { emailConfigFromUrlStore, EmailFn } from "@itsmworkbench/mailer";

export function sendEmail ( transport: SMTPTransport | SMTPTransport.Options | string,
                            from: string ): EmailFn {
  console.log('transport', transport)
  let transporter = nodemailer.createTransport ( transport )
  return async email => await transporter.sendMail ( { ...email, from } )
}
export async function sendEmailFnFromUrlStore ( urlStore: any, organisation: string, name: string ): Promise<EmailFn> {
  const config: any = await emailConfigFromUrlStore ( urlStore, organisation, name )
  console.log('config', config)
  return sendEmail ( config.smtp, config.email )
}
