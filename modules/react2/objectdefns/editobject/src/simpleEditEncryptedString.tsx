import {useAttributeValueOrientation} from "@itsmworkbench/renderers";
import {useTranslation} from "@itsmworkbench/translation";
import {camelCaseToWords} from "@itsmworkbench/utils";
import {makeGetterSetterFrom} from "@itsmworkbench/react_utils";
import React, {useEffect, useState} from "react";
import {useSecretData} from "@itsmworkbench/secrets";
import {hasEnteredPassword} from "@itsmworkbench/authentication";
import {secretDataToEncypt, secretDataToDecrypt} from "@itsmworkbench/authentication";
import {EditComponentProps} from "./simpleEditComponents";
import {useCommonComponents} from "@itsmworkbench/common_components";

export function SimpleEditEncryptedString<Main>(props: EditComponentProps<Main, string>) {
    const {showLabel, fieldName, fieldDefn, rootId, mainOps, prefix, clipboard} = props;
    const {editable, fieldType, lens} = fieldDefn;
    const orientation = useAttributeValueOrientation();
    const translation = useTranslation();
    const text = prefix ? translation(`${prefix}.${fieldName}`) : camelCaseToWords(fieldName);
    const {ClipboardButton} = useCommonComponents()
    if (!editable) {
        throw new Error(`Field ${fieldType} is not editable`);
    }

    // The encrypted value is stored via the lens.
    const [encryptedValue, setEncryptedValue] = makeGetterSetterFrom(mainOps, lens);
    // Local state for the decrypted (plain) value.
    const [decryptedValue, setDecryptedValue] = useState('processing...');
    const [secretData] = useSecretData();
    const ok = hasEnteredPassword(secretData);

    // Create encryption and decryption functions using the helper functions.
    const encryptFunction = secretDataToEncypt(
        secretData,
        translation('edit.encrypted.cannotEncryptWithoutPassword')
    );
    const decryptFunction = secretDataToDecrypt(
        secretData,
        translation('edit.encrypted.cannotDecryptWithoutPassword')
    );

    useEffect(() => {
        if (ok && encryptedValue) {
            // Decrypt the encrypted value to display plain text.
            decryptFunction(encryptedValue)
                .then((plainText) => setDecryptedValue(plainText))
                .catch((error) => {
                    console.error("Decryption error:", error);
                    setDecryptedValue(translation('edit.encrypted.decryptionError'));
                });
        } else {
            setDecryptedValue(translation('edit.encrypted.cannotDecryptWithoutPassword'));
        }
    }, [encryptedValue, secretData, ok, decryptFunction, translation]);

    // When the user finishes editing, re-encrypt the plain text.
    async function handleBlur() {
        if (ok) {
            try {
                const newEncrypted = await encryptFunction(decryptedValue);
                setEncryptedValue(newEncrypted);
            } catch (error) {
                console.error("Encryption error:", error);
            }
        }
    }

    return (
        <div className={`simple-edit-string-container ${orientation}`}>
            {showLabel && (
                <label htmlFor={rootId} className="simple-edit-string-label">
                    {text}
                </label>
            )}
            <input
                data-testid={rootId}
                id={rootId}
                type="text"
                disabled={!ok}
                value={decryptedValue || ''}
                onChange={(e) => setDecryptedValue(e.target.value)}
                onBlur={handleBlur}
                aria-label={!showLabel ? text : undefined}
                className="simple-edit-string-input"
            />
            {/* Optionally display the encrypted value (debugging purposes) */}
            <span style={{flexGrow: 1}} className="encrypted-value-display">{encryptedValue}</span>
            {clipboard && <ClipboardButton text={decryptedValue}/>}
        </div>
    );
}
