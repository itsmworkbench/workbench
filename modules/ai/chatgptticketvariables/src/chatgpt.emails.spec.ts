jest.mock('./chatgpt.emails.proper', () => ({
    emailProcessor: jest.fn()
}));

import { emailProcessor } from "./chatgpt.emails.proper";
import { generalEmail } from "./chatgpt.emails";
import { EmailData } from "@itsmworkbench/ai_ticketvariables";

describe('ChatGPTEmailGenerationError', () => {
    test('should handle errors during email generation', async () => {
        // Setup: Mock emailProcessor to throw an error
        (emailProcessor as jest.Mock).mockImplementation(() => {
            throw new Error('Test error');
        });

        const emailData: EmailData = {
            purpose: "requestApproval", // This can be any value for the purpose of this test
            ticketId: "SR5542",
            ticket: "Sample ticket content"
        };

        // Call generalEmail and expect it to handle the error gracefully
        const result = await generalEmail(emailData);

        expect(emailProcessor).toHaveBeenCalled(); // Verify emailProcessor was called
        expect(result).toHaveProperty('error'); // Check that the result has an error property
        expect(result.error).toHaveProperty('name', 'EmailGenerationError'); // Check that the error name is as expected
        expect(result.error).toHaveProperty('message'); // Ensure there's an error message
        expect(result.error.message).toBe('Test error'); // Optionally, check the error message content
    });
});
