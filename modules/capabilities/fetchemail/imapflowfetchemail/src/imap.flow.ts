import { ImapFlow } from 'imapflow';
import { FetchEmailer, FetchEmailFn, FetchEmailOptions, ListEmailsFn, ListEmailsOptions } from "@itsmworkbench/fetchemail";
import { hasErrors, toArray } from "@laoban/utils";
import { NamedUrl, UrlStore } from "@itsmworkbench/urlstore";

const client = new ImapFlow ( {
  host: 'imap.example.com', // Replace with your IMAP server's host
  port: 993,
  secure: true,
  auth: {
    user: 'user@example.com', // Replace with the IMAP account username
    pass: 'password', // Replace with the IMAP account password
  },
} );
export type Fn<From, To> = ( from: From ) => Promise<To>
export type IMapFn<From, To> = ( client: ImapFlow, from: From ) => Promise<To>;

const useClient = <From, To> ( clientFn: () => ImapFlow, fn: IMapFn<From, To> ): Fn<From, To> => {
  return async ( from ) => {
    const client = clientFn ()
    await client.connect ();
    try {
      return await fn ( client, from )
    } finally {
      await client.logout ();
    }
  }
}
const useAndLockClient = <From, To> ( clientFn: () => ImapFlow, fn: IMapFn<From, To> ): Fn<From, To> => {
  return useClient ( clientFn, async ( client, from: From ): Promise<To> => {
    let lock = await client.getMailboxLock ( 'INBOX' );
    try {
      return await fn ( client, from )
    } finally {
      await lock.release ();
    }
  } )
}

function transformEmailForRead ( message: any ) {

  let bodyStructure = message.bodyStructure;
  // Check if bodyStructure has childNodes and iterate

  const bodyParts: string[] = toArray ( bodyStructure.childNodes ).filter ( node => node.type === 'text/plain' ).map ( node => node.part )

  return {
    uid: message.uid.toString (),
    internalDate: message.internalDate.toISOString (),
    envelope: {
      date: message.envelope.date,
      subject: message.envelope.subject,
      from: message.envelope.from.map ( addr => ({ name: addr.name, address: addr.address }) ),
      to: message.envelope.to.map ( addr => ({ name: addr.name, address: addr.address }) ),
      cc: message.envelope.cc?.map ( addr => ({ name: addr.name, address: addr.address }) ) ?? [],
    },
    flags: message.flags,
    bodyParts,
    bodyStructure
  };
}
const listEmails = ( clientFn: () => ImapFlow ): ListEmailsFn =>
  useAndLockClient ( clientFn, async ( client, options: ListEmailsOptions ) => {
    await client.mailboxOpen ( 'INBOX' );
    console.log ( 'options', options )
    console.log ( 'from', options.from )
    let uids: Number[] = await client.search ( { from: options.from }, { uid: true, } );
    console.log ( 'uids', uids )
    const emailsData = [];
    for ( const uid of toArray ( uids ) ) {
      const fetchResult = await client.fetchOne ( uid, { envelope: true, flags: true, uid: true, internalDate: true, bodyStructure: true } );
      if ( fetchResult ) {
        emailsData.push ( transformEmailForRead ( fetchResult ) );
      }
    }
    return { emails: emailsData };
  } )

export function fetchEmail ( client: () => ImapFlow ): FetchEmailFn {
  return useAndLockClient ( client, async ( client, options: FetchEmailOptions ) => {
    await client.mailboxOpen ( 'INBOX' );
    console.log ( 'options', options )
    console.log ( 'uid', options.uid )
    let query = {
      envelope: true,
      bodyParts: options.bodyParts, // '1' for HTML part, '1.TEXT' for plain text as per your email structure
    };
    console.log ( 'query', query )
    const fetchResult = await client.fetchOne ( options.uid, query )
    let subject = fetchResult.envelope.subject;
    let from = fetchResult.envelope.from.map ( addr => `${addr.name} <${addr.address}>` ).join ( ', ' );
    let date = fetchResult.envelope.date;
    console.log ( 'fetchResult-bodyParts', fetchResult.bodyParts )
    const textBody: string[] = toArray ( options.bodyParts ).map ( part => {
      console.log('part', typeof part, part, fetchResult?.bodyParts?.get ( part ))
      return fetchResult?.bodyParts?.get ( part )?.toString ( 'utf8' ); } )
    return { subject, from, date, textBody }
  } )
}

export function fetchEmailFromClient ( client: () => ImapFlow ): FetchEmailer {
  return {
    listEmails: listEmails ( client ),
    fetchEmail: fetchEmail ( client ),
    testConnection: async () =>
      useClient ( client , async ( _: any ): Promise<'Test connection OK'> => 'Test connection OK' ) ( 'ignore' )
  }
}

export function fetchEmailerFromConfig ( config: any ) {
  console.log ( 'fetchEmailerFromConfig config', config )
  return fetchEmailFromClient ( () => new ImapFlow ( config.imap ) )
}
export async function fetchEmailerFromUrlStore ( urlStore: UrlStore, organisation: string, who: string ) {
  const named: NamedUrl = { scheme: 'itsm', organisation, namespace: 'operator', name: who }
  const config = await urlStore.loadNamed ( named )
  if ( hasErrors ( config ) ) throw new Error ( 'Failed to load config' + JSON.stringify ( config ) )
  return fetchEmailerFromConfig ( config.result )
}