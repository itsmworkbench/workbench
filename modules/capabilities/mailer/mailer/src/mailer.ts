// Import nodemailer
import nodemailer from 'nodemailer';
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { ErrorsAnd } from "@laoban/utils";

export interface EmailDetails {
  to: string
  subject: string
  text: string
}
export interface EmailResult {
  messageId: string
}
export type MailerFn = ( email: EmailDetails ) => Promise<ErrorsAnd<EmailResult>>
export type TestMailerFn = () => Promise<ErrorsAnd<'Test connection OK'>>
export interface Mailer {
  sendEmail: MailerFn
  test: TestMailerFn
}
