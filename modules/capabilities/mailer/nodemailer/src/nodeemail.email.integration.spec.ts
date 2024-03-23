import { mailerFromConfig, sendEmailRaw } from "./nodemailer.email";
import { hasErrors } from "@laoban/utils";

const jsyaml = require ( 'js-yaml' );
const goodConfig = `
name: phil
email: liubaoyu2014@gmail.com
smtp:
  service: gmail
  auth:
    user: liubaoyu2014@gmail.com
    pass: ${process.env.LBY}
`
const badConfig = `
name: phil
email: liubaoyu2014@gmail.com
smtp:
  service: gmail
  auth:
    user: liubaoyu2014@gmail.com
    pass: notSetUpSoDoesntWork
`

describe ( "nodeemail integration test", () => {
  describe ( "sendEmail", () => {
    it ( "should send email", async () => {
      const config = jsyaml.load ( goodConfig )
      const mailer = await mailerFromConfig ( config )

      const result = await mailer.sendEmail ( {
        to: 'phil.rice@validoc.org',
        subject: "Email from automated test",
        text: "Here is the email from the automated test"
      } )
      console.log ( result )
      if ( hasErrors ( result ) ) {
        throw new Error ( result.toString () )
      }

    } )

    it ( "should report when not set up properly", async () => {
      const config = jsyaml.load ( badConfig )
      const mailer = await mailerFromConfig ( config )
      const result = await mailer.sendEmail ( {
        to: 'phil.rice@validoc.org',
        subject: "Email from automated test",
        text: "Here is the email from the automated test"
      } )
      if ( !hasErrors ( result ) ) {
        fail ( 'Should have failed' )
      }
      let errorMsg = result.toString ();
      expect ( errorMsg ).toContain ( 'Invalid login' )
      expect ( errorMsg ).toContain ( 'Username and Password not accepted' )
    } )
  } )
  describe ( "testEmail", () => {
    it ( "should report OK with good config", async () => {
      const config = jsyaml.load ( goodConfig )
      const mailer = await mailerFromConfig ( config )
      const result = await mailer.test ()
      expect ( result ).toBe ( 'OK' )

    } )
    it ( "should report error with bad config", async () => {
      const config = jsyaml.load ( badConfig )
      const mailer = await mailerFromConfig ( config )
      const result = await mailer.test ()
      let errorMsg = result.toString ();
      expect ( errorMsg ).toContain ( 'Invalid login' )
      expect ( errorMsg ).toContain ( 'Username and Password not accepted' )
    } )
  } )
} )