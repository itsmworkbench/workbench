export function generateRandomBase64(length: number): () => string {
    return () => {
        const bytes = new Uint8Array(length);
        crypto.getRandomValues(bytes);
        // Convert byte array to a string, then to Base64
        return btoa(String.fromCharCode(...bytes));
    }
}

