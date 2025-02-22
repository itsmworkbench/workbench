import {ErrorsOr} from "@itsmworkbench/errors";
import {generateRandomBase64, throwErrorIfNotBase64} from "@itsmworkbench/utils";
import {DecryptFn} from "../authentication/authentication";

export const plainTextForTest = 'plain text'

//Will normally be the browser's localStorage
export type SecretDataStore = {
    getItem(key: string): string | null
    setItem(key: string, value: string): void
}
export type SecretDataWithoutPasswordChecked = {
    salt: string
    rootKey: string
    testValue?: string
}
export type SecretData = SecretDataWithoutPasswordChecked & {
    cryptoKeyString: string
}

export function hasPassword(s: SecretDataWithoutPasswordChecked): boolean {
    return !!s.testValue
}

export function hasEnteredPassword(s: SecretDataWithoutPasswordChecked): s is SecretData {
    return (s as SecretData).cryptoKeyString !== undefined
}

export async function setNewPassword(sdStore: SecretDataStore, s: SecretDataWithoutPasswordChecked, password: string, force: boolean): Promise<SecretData> {
    if (hasPassword(s) && !force) {
        throw new Error("Password already set")
    }
    const cryptoKeyString = await deriveCryptoKeyString(s, password)
    const testValue = await encryptString(cryptoKeyString)(plainTextForTest)
    sdStore.setItem('itsm.testValue', testValue)
    const newSecretData: SecretData = {...s, cryptoKeyString, testValue};
    return newSecretData
}

export async function validatePassword(sdStore, s: SecretDataWithoutPasswordChecked, password: string): Promise<ErrorsOr<SecretData>> {
    if (!hasPassword(s)) throw new Error("No password set, should not have called validatePassword")
    const cryptoKeyString = await deriveCryptoKeyString(s, password)
    const newSecretData: SecretData = {...s, cryptoKeyString}
    try {
        const test = await decryptString(cryptoKeyString)(s.testValue)
        if (test !== plainTextForTest) return {errors: ['Invalid password']}
        return {value: newSecretData}
    } catch (e: any) {
        return {errors: ['Invalid password']}
    }
}

export function loadOrGenerate(sdStore: SecretDataStore, name: string, length: number) {
    const value = sdStore.getItem(name)
    if (value) return value
    const newValue = generateRandomBase64(length)()
    sdStore.setItem(name, newValue)
    return newValue
}

export function defaultSecretData(sdStore: SecretDataStore = localStorage): SecretDataWithoutPasswordChecked {
    const salt = loadOrGenerate(sdStore, 'itsm.salt', 16)
    const rootKey = loadOrGenerate(sdStore, 'itsm.rootKey', 32)
    const testValue = sdStore.getItem('itsm.testValue') // it will be undefined if we haven't set a password
    return {salt, rootKey, testValue}
}


/**
 * Encrypt a plaintext string with the given AES-GCM key.
 * Returns a single Base64 string containing both IV and ciphertext.
 */
export function encryptString(cryptoKey: string): DecryptFn {
    return async (plaintext: string): Promise<string> => {
        const realCryptoKey = await base64ToCryptoKey(cryptoKey);
        // 1) Encode plaintext to bytes
        const encoder = new TextEncoder();
        const plainBytes = encoder.encode(plaintext);

        // 2) Generate a 12-byte IV for AES-GCM
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // 3) Encrypt
        const cipherBuffer = await crypto.subtle.encrypt(
            {name: "AES-GCM", iv},
            realCryptoKey,
            plainBytes
        );

        // 4) Convert IV and ciphertext to Base64
        const ivBase64 = btoa(String.fromCharCode(...iv));
        const cipherArray = new Uint8Array(cipherBuffer);
        const cipherBase64 = btoa(String.fromCharCode(...cipherArray));

        // 5) Return a single string with both
        // e.g. "ivBase64:cipherBase64"
        return `${ivBase64}:${cipherBase64}`;
    }
}

/**
 * Decrypt an AES-GCM ciphertext string (which contains IV) back to plaintext.
 * The input must be in the format "ivBase64:cipherBase64".
 */
export function decryptString(cryptoKey: string): DecryptFn {
    return async (data: string): Promise<string> => {
        const realCryptoKey = await base64ToCryptoKey(cryptoKey);
        // 1) Split the stored string into IV part and ciphertext part
        const [ivBase64, cipherBase64] = data.split(":");
        if (!ivBase64 || !cipherBase64) {
            throw new Error("Invalid encrypted data format. Expected 'iv:ciphertext'");
        }

        // 2) Decode Base64 to Uint8Array
        const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
        const cipherBytes = Uint8Array.from(atob(cipherBase64), (c) => c.charCodeAt(0));

        // 3) Decrypt
        const plainBuffer = await crypto.subtle.decrypt(
            {name: "AES-GCM", iv},
            realCryptoKey,
            cipherBytes
        );

        // 4) Convert back to string
        const decoder = new TextDecoder();
        return decoder.decode(plainBuffer);
    }
}


export async function cryptoKeyToBase64(key: CryptoKey): Promise<string> {
    // 1) Export the key in raw format
    //    This throws an error if key.extractable = false
    const raw = await crypto.subtle.exportKey("raw", key);

    // 2) Convert ArrayBuffer -> Uint8Array -> Base64 string
    const byteArray = new Uint8Array(raw);
    const charString = String.fromCharCode(...byteArray);
    return btoa(charString);
}

// base64ToCryptoKey.ts

/**
 * Converts a Base64 string (representing raw key bytes) into a CryptoKey.
 *
 * @param base64Key The Base64-encoded raw bytes of the key.
 * @param algorithm The desired algorithm, e.g. { name: "AES-GCM" }
 * @param extractable Whether the resulting CryptoKey should be extractable.
 * @param keyUsages Allowed key usages: ["encrypt", "decrypt"], etc.
 */
export async function base64ToCryptoKey(
    base64Key: string,
    algorithm: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams | HmacImportParams | AesKeyAlgorithm = {name: "AES-GCM"},
    keyUsages: KeyUsage[] = ["encrypt", "decrypt"],
    extractable: boolean = false,
): Promise<CryptoKey> {
    // 1) Decode the Base64 string into a Uint8Array
    const raw = Uint8Array.from(
        atob(base64Key),
        (c) => c.charCodeAt(0)
    );

    // 2) Import the raw bytes as a CryptoKey
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        raw,
        algorithm,
        extractable,
        keyUsages
    );

    return cryptoKey;
}

export async function deriveCryptoKeyString(s: SecretDataWithoutPasswordChecked, passwordString: string): Promise<string> {
    throwErrorIfNotBase64(s.rootKey);
    throwErrorIfNotBase64(s.salt);

    // 2) Combine rootKey + salt as additional bytes
    const rootKeyBytes = new TextEncoder().encode(s.rootKey);
    const saltBytes = new TextEncoder().encode(s.salt);
    const combinedSalt = new Uint8Array(rootKeyBytes.length + saltBytes.length);
    combinedSalt.set(rootKeyBytes, 0);
    combinedSalt.set(saltBytes, rootKeyBytes.length);

    // 3) Import the user password as a "raw" key
    const enc = new TextEncoder();
    const pwBytes = enc.encode(passwordString);
    const baseKey = await crypto.subtle.importKey(
        "raw",
        pwBytes,
        {name: "PBKDF2"},
        false,
        ["deriveBits", "deriveKey"]
    );

    // 4) Derive a 256-bit AES key via PBKDF2
    //    Increase iterations (e.g., 200k, 300k) for better security (but slower)
    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: combinedSalt,
            iterations: 200_000, // adjust for performance vs. security
            hash: "SHA-256",
        },
        baseKey,
        {name: "AES-GCM", length: 256},
        true, // extractable
        ["encrypt", "decrypt"]
    );

    // 5) Export the derived key to base64
    return await cryptoKeyToBase64(derivedKey);
}