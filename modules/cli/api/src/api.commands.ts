import { CommandFn, HasCurrentDirectory, HasEnv } from "@itsmworkbench/cli";
import { startKoa } from "@itsmworkbench/koa";
import { wizardOfOzApiHandlers } from "./api";
import { loadFromIdStore } from "@itsmworkbench/idstore";
import { defaultOrganisationUrlStoreConfig } from "@itsmworkbench/defaultdomains";
import { findListIds } from "@itsmworkbench/listids";
import { YamlCapability } from "@itsmworkbench/yaml";
import { nodeUrlstore } from "@itsmworkbench/nodeurlstore";
import { shellGitsops } from "@itsmworkbench/shellgit";
import { chatgptKnownTicketVariables, chatgptTicketVariables, generalEmail } from "@itsmworkbench/ai_chatgptticketvariables";
import { AIEmailsFn } from "@itsmworkbench/ai_ticketvariables";
import { mailerFromUrlStore } from "@itsmworkbench/nodemailer";
import { MailerFn, Mailer } from "@itsmworkbench/mailer";
import { Sqler } from "@itsmworkbench/sql";
import { makeSqlerForDbPathShell } from "@itsmworkbench/dbpathsql";
import { executeScriptInShell } from "@itsmworkbench/nodeshell";
import { FetchEmailer } from "@itsmworkbench/fetchemail";
import { fetchEmailerFromUrlStore } from "@itsmworkbench/imapflowfetchemail";


export function apiCommand<Commander, Context extends HasCurrentDirectory & HasEnv, Config> ( yaml: YamlCapability ): CommandFn<Commander, Context, Config> {
  return ( context, config ) => ({
    cmd: 'api ',
    description: 'Runs the api that supports the Wizard Of Oz',
    options: {
      '-d, --directory <directory>': { description: 'The directory that files are served from', default: context.currentDirectory },
      '-p, --port <port>': { description: 'Port to run the server on', default: "1235" },
      '--debug': { description: 'More debug information ' },
      '-i,--id <idroot>': { description: "The root of the id store", default: "ids" }
    },
    action: async ( commander, opts ) => {
      const { port, debug, directory } = opts
      const aiVariables = chatgptTicketVariables
      const aiKnownVariables = chatgptKnownTicketVariables
      const aiEmails: AIEmailsFn = generalEmail

      const orgs = defaultOrganisationUrlStoreConfig ( yaml, context.env )
      const gitOps = shellGitsops ( false )
      const urlStore = nodeUrlstore ( gitOps, orgs )
      const mailer: Mailer = await mailerFromUrlStore ( urlStore, "me", "me" )
      const fetchEmailer: FetchEmailer = await fetchEmailerFromUrlStore ( urlStore, "me", "me" )
      const sqlerL: Sqler = makeSqlerForDbPathShell ( executeScriptInShell, context.currentDirectory, opts.debug === true )
      startKoa ( directory.toString (), Number.parseInt ( port.toString () ), debug === true,
        wizardOfOzApiHandlers ( aiVariables, aiKnownVariables, aiEmails, opts.debug === true, orgs.nameSpaceDetails, urlStore, mailer, fetchEmailer, sqlerL ) )
    }
  })

}