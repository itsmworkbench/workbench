import {cryptoKeyToBase64, decryptString, encryptString} from "./secret.data";


describe("encryptString and decryptString", () => {
    let cryptoKey: string;

    beforeAll(async () => {
        // Create a random 256-bit AES-GCM key for testing
        cryptoKey = await cryptoKeyToBase64(await crypto.subtle.generateKey(
            {name: "AES-GCM", length: 256},
            true,
            ["encrypt", "decrypt"]
        ));
    });

    it("should encrypt and decrypt the same message", async () => {
        const original = "Hello, World!";
        console.log('cryptoKey', cryptoKey)
        const encrypted = await encryptString(cryptoKey)(original);
        const decrypted = await decryptString(cryptoKey)(encrypted);
        expect(decrypted).toBe(original);
    });

    it("should fail to decrypt with a different key", async () => {
        // Create a second key
        const differentKey = await cryptoKeyToBase64(await crypto.subtle.generateKey(
            {name: "AES-GCM", length: 256},
            true,
            ["encrypt", "decrypt"]
        ));

        const original = "SecretMessage";
        const encrypted = await encryptString(cryptoKey)(original);

        // Attempt decryption with the other key
        await expect(decryptString(differentKey)(encrypted)).rejects.toThrow();
    });
});


describe("cryptoKeyToBase64", () => {
    let key: CryptoKey;

    beforeAll(async () => {
        // Generate a test AES-GCM key
        // Must set extractable: true so exportKey("raw") is allowed
        key = await crypto.subtle.generateKey(
            {name: "AES-GCM", length: 256},
            true, // extractable
            ["encrypt", "decrypt"]
        );
    });

    it("should return a Base64 string", async () => {
        const base64Str = await cryptoKeyToBase64(key);
        expect(typeof base64Str).toBe("string");
        expect(base64Str.length).toBeGreaterThan(0);

        // Optional: Quick check if it looks like Base64 (roughly)
        // This regex checks typical Base64 chars plus optional '=' padding
        expect(base64Str).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    });

    it("should throw if key is not extractable", async () => {
        // Generate a non-extractable key
        const nonExtractableKey = await crypto.subtle.generateKey(
            {name: "AES-GCM", length: 256},
            false, // extractable = false
            ["encrypt", "decrypt"]
        );

        // Expect cryptoKeyToBase64 to fail
        await expect(cryptoKeyToBase64(nonExtractableKey)).rejects.toThrow();
    });
});
