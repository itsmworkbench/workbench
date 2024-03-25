export interface EmailEnvelope {
  date: string;
  subject: string;
  from: { name: string; address: string }[];
  to: { name: string; address: string }[];
  cc?: { name: string; address: string }[];
}

export interface EmailSummary {
  uid: string;
  internalDate: string;
  envelope: EmailEnvelope;
  flags: string[];
  bodyParts: string[];
}

export interface ListEmailsOptions {
  from: string
  sinceDays: number // number of days to go back
}

export interface ListEmailsResult {
  emails: EmailSummary[];

}

export type ListEmailsFn = ( options: ListEmailsOptions ) => Promise<ListEmailsResult>;

export interface EmailContent {
  subject: string; // Subject of the email
  from: string; // From address of the email
  date: string; // Date of the email
  textBody?: string[]; // Plain text body of the email
  htmlBody?: string[]; // HTML body of the email
}
export function isEmailContent ( content: any ): content is EmailContent {
  return (content as EmailContent).textBody !== undefined || (content as EmailContent).htmlBody !== undefined
}

export interface FetchEmailOptions {
  uid: string; // UID of the email to fetch
  bodyParts: string[]; // List of text parts to fetch
}

export type FetchEmailResult = EmailContent | null;

export type FetchEmailFn = ( options: FetchEmailOptions ) => Promise<FetchEmailResult>;
export type FetchEmailTestFn = () => Promise<'Test connection OK'>

export type FetchEmailer = {
  listEmails: ListEmailsFn;
  fetchEmail: FetchEmailFn;
  testConnection: FetchEmailTestFn
}