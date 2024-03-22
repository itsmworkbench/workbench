import { sendEmail } from "./nodemailer.email";

const jsyaml = require ( 'js-yaml' );

describe ( "nodeemail integration test", () => {
  it ( "should send email", async () => {
    // Arrange
    const configstring = `
name: phil
email: liubaoyu2014@gmail.com
smtp:
  service: gmail
  auth:
    user: liubaoyu2014@gmail.com
    pass: ${process.env.LBY}
`
    const config = jsyaml.load ( configstring )
    console.log ( config )

    const result = await sendEmail ( config.smtp, config.email ) ( {

      to: 'phil.rice@validoc.org',
      subject: "Email from automated test",
      text: "Here is the email from the automated test"
    } )
    console.log ( result )

  } )
} )