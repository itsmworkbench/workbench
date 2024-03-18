import {EmailData} from "@itsmworkbench/ai_ticketvariables";
import {generateAllPurposeEmail} from "./chatgpt.emails.purpose";
import {generalEmail} from "./chatgpt.emails";


const sampleTicket = `Ticket SR5542
=============
Ticket colour
P4
Customer: bob.grey@thecompany.co.

Issue:
* in the DSS production environment the colour of the button is wrong. It should be blue and is red.
* The button is button id but-blue-123

Action requested:
* Please change the colour of the button

Thanks`;

// describe ( 'ChatGPTEmailGeneration', () => {
//     test ( 'should generate email from EmailData', async () => {
//         const emailData: EmailData = {
//             purpose: "requestApproval", //changing for now
//             ticketId: "ticketId",
//             ticket: sampleTicket
//         };
//
//         // Call the function with the variables to generate an email
//         const emailContent = await generateAllPurposeEmail ( emailData );
//
//         // Check if emailContent is a string (indicatively checking if an email was generated)
//         expect ( typeof emailContent ).toBe ( 'string' );
//         // Further tests can be added to check the content of the email if necessary
//     } );
//
//     test ( 'should generate general email with the EmailResult', async () => {
//         const emailData: EmailData = {
//             purpose: "requestApproval", //changing for now
//             ticketId: "ticketId",
//             ticket: sampleTicket
//         };
//         // Call the function with the variables to generate an email
//         const generalEmailReturn = await generalEmail ( emailData );
//
//         expect ( typeof generalEmailReturn ).toBe ( 'object' );
//     } );
// } );

describe('ChatGPTEmailGeneration', () => {
    test('should generate email content with specific markers from EmailData', async () => {
        const emailData: EmailData = {
            purpose: "requestApproval",
            ticketId: "SR5542",
            ticket: sampleTicket
        };

        const emailContent = await generateAllPurposeEmail(emailData);

        expect(typeof emailContent).toBe('string');
        expect(emailContent).toContain('<!-- SUBJECT START -->');
        expect(emailContent).toContain('<!-- SUBJECT END -->');
        expect(emailContent).toContain('<!-- EMAIL START -->');
        expect(emailContent).toContain('<!-- EMAIL END -->');
    });

    test('generalEmail should return EmailResult with subject and email properties', async () => {
        const emailData: EmailData = {
            purpose: "requestApproval",
            ticketId: "SR5542",
            ticket: sampleTicket
        };

        const result = await generalEmail(emailData);

        expect(typeof result).toBe('object');
        expect(result).toHaveProperty('subject');
        expect(result).toHaveProperty('email');
        // Optionally, check for the absence of the error property if success is expected
        expect(result.error).toBeUndefined();
    });

    test('requestClosure email should not mention approval in the subject or body', async () => {
        const emailData: EmailData = {
            purpose: "requestClosure",
            ticketId: "SR5542",
            ticket: sampleTicket
        };

        const result = await generalEmail(emailData);

        expect(typeof result).toBe('object');
        expect(result.subject).not.toMatch(/approval/i); // Checking subject does not contain "approval"
        expect(result.email).not.toMatch(/approval/i);
    });
});