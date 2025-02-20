// random.strings.test.ts
import {generateRandomBase64} from "./random.strings";

describe("generateRandomBase64", () => {
    it("returns a non-empty Base64 string ", () => {
        const result = generateRandomBase64(16)();

        // The Base64 output length depends on the byte length.
        // For 16 bytes, you'll get 24 Base64 chars (padded to a multiple of 4).
        // If you want a more general check, just confirm it's > 0
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");

        // Optional: check it looks like Base64 (roughly)
        // A simple regex that checks valid Base64 characters plus '=' padding
        expect(result).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    });

    it('generates the correct length of Base64 string', () => {
        expect(generateRandomBase64(12)().length).toBe(16);
        expect(generateRandomBase64(16)().length).toBe(24);
        expect(generateRandomBase64(32)().length).toBe(44);
    })

    it("generates different strings for consecutive calls", () => {
        const val1 = generateRandomBase64(16)();
        const val2 = generateRandomBase64(16)();
        expect(val1).not.toEqual(val2);
    });
});
