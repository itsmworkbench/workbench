import {errorsOrThrow, valueOrThrow} from "@itsmworkbench/errors";
import {defaultSecretData, hasPassword, SecretData, SecretDataStore, SecretDataWithoutPasswordChecked, setNewPassword, validatePassword,} from "./secret.data";

describe("SecretData password flow", () => {
    let memoryStore: SecretDataStore;
    let initialData: SecretDataWithoutPasswordChecked;

    beforeEach(() => {
        // 1) Create an in-memory store that mimics localStorage
        const storeObj: Record<string, string> = {
            "itsm.salt": "4FdnSm/wLEzpbN8PqZDorw==",
            "itsm.rootKey": "YkcwyeZUFYnNEAgMqwNhqaoUMIX8i/baxyqdd2pBuo4=",
        };
        memoryStore = {
            getItem(key: string) {
                return storeObj[key] ?? null;
            },
            setItem(key: string, value: string) {
                storeObj[key] = value;
            },
        };

        // 2) Load or generate the initial data (fills 'salt', 'rootKey', etc.)
        initialData = defaultSecretData(memoryStore);

    });

    it("should start with no password set", async () => {
        expect(hasPassword(initialData)).toBe(false);
        expect(initialData.testValue).toBe(null);
    });

    it("should set a new password", async () => {
        const password = "MyStrongPassword";

        const updated = await setNewPassword(memoryStore, initialData, password, false);
        // Confirm password is now set
        expect(hasPassword(updated)).toBe(true);
        expect(updated.testValue).toBeTruthy();

        // Confirm it's stored in the mock store
        const storedTestValue = memoryStore.getItem("itsm.testValue");
        expect(storedTestValue).toBe(updated.testValue);
    });

    it("should validate a correct password", async () => {
        const password = "CorrectPass";

        // 1) Set the password
        const updated = await setNewPassword(memoryStore, initialData, password, false);
        expect(memoryStore.getItem("itsm.testValue")).toEqual(updated.testValue);

        // 2) Validate using the same password
        const result = await validatePassword(memoryStore, updated, password);
        // If there's a value, valueOrThrow returns it; if there's an error, it throws
        const validated = valueOrThrow(result);

        // Expect we got a real SecretData object back
        expect(validated.cryptoKeyString).toBeTruthy();
    });

    it("should fail validation for a wrong password", async () => {
        const correctPass = "CorrectPass";
        const updated = await setNewPassword(memoryStore, initialData, correctPass, false);

        const wrongPass = "WrongPass";
        const result = await validatePassword(memoryStore, updated, wrongPass);

        expect(result).toEqual({"errors": ["Invalid password"]})
    });

    it("should throw if password is already set and force=false", async () => {
        // First set a password
        const pass = "InitialPass";
        const first = await setNewPassword(memoryStore, initialData, pass, false);
        expect(hasPassword(first)).toBe(true);

        // Attempt to set it again with force=false => should throw
        await expect(() => setNewPassword(memoryStore, first, "AnotherPass", false))
            .rejects
            .toThrow("Password already set");
    });

    it("should allow re-setting password if force=true", async () => {
        // 1) Set the password
        const firstPass = "OriginalPass";
        const first = await setNewPassword(memoryStore, initialData, firstPass, false);
        expect(first.testValue).toBeTruthy();

        // 2) Force re-set
        const secondPass = "NewPass";
        const second = await setNewPassword(memoryStore, first, secondPass, true);

        // The new testValue is likely different
        expect(second.testValue).toBeTruthy();
        expect(second.testValue).not.toBe(first.testValue);
    });
});
