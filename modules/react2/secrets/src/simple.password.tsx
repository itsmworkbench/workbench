import React, {useState} from "react";
import {valueOrThrow} from "@itsmworkbench/errors";
import {Password, useSecretData} from "./password";
import {hasEnteredPassword, hasPassword, setNewPassword, validatePassword} from "@itsmworkbench/authentication";

export const SimplePassword: Password = () => {
    const [secretData, setSecretData] = useSecretData();
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        try {
            if (!hasPassword(secretData)) {
                // no password yet => set it
                const updated = await setNewPassword(
                    localStorage,
                    secretData,
                    password,
                    false // force
                );
                setSecretData(updated);
            } else {
                // password is set => attempt to validate
                const result = await validatePassword(localStorage, secretData, password);
                const validated = valueOrThrow(result);
                setSecretData(validated);
            }

            setPassword("");
        } catch (err: any) {
            setErrorMsg(err.message || "Something went wrong");
        }
    };

    if (hasEnteredPassword(secretData)) {
        return (
            <div style={{display: "flex", alignItems: "center"}}>
        <span style={{color: "green", marginRight: 8}}>
          ✓ Password OK
        </span>
            </div>
        );
    }

    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <form onSubmit={handleSubmit} style={{marginRight: 8}}>
                {/* Hidden (or visually hidden) username field for autofill */}
                <label style={{display: "none"}}>
                    Username:
                    <input
                        type="text"
                        name="fakeUsername"
                        autoComplete="username"
                    />
                </label>

                <label>
                    Password:{" "}
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        // Tells browsers this is the current password (vs. new password)
                        autoComplete="current-password"
                    />
                </label>
                <button type="submit" style={{marginLeft: 8}}>
                    Submit
                </button>
            </form>

            {errorMsg && <span style={{color: "red"}}>{errorMsg}</span>}
        </div>
    );
};
