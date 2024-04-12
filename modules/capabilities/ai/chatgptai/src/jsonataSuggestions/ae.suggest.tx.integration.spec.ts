import { generateJsonataExpression, AISuggestTxInput } from './ae.suggest.tx'; // Adjust the import path as necessary

describe('generateJsonataExpression Integration Test', () => {
    it('should return a string that could be a valid JSONata expression', async () => {
        const testInput: AISuggestTxInput = {
            input: {
                loans: [
                    { loanId: "L001", amount: 10000, interestRate: 5.5, duration: 10 },
                    { loanId: "L002", amount: 20000, interestRate: 4.5, duration: 12 }
                ]
            },
            output: {
                totalLoanAmount: 30000,
                averageInterestRate: 5.0
            }
        };

        const jsonataExpression = await generateJsonataExpression(testInput);

        expect(typeof jsonataExpression).toBe('object');
        console.log(jsonataExpression)
    });
});
