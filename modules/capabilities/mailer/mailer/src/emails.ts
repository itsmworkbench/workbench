// Import nodemailer
import nodemailer from 'nodemailer';
import SMTPTransport from "nodemailer/lib/smtp-transport";

export interface EmailDetails {
  to: string
  subject: string
  text: string
}
export interface EmailResult {
  messageId: string

}
export type EmailFn = ( email: EmailDetails ) => Promise<EmailResult>
