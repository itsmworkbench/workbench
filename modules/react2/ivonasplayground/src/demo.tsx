import {SecretDataProvider, SimplePassword, useSecretData} from "@itsmworkbench/secrets";
import {decryptString, defaultSecretData, hasEnteredPassword} from "@itsmworkbench/authentication";
import {useEffect, useState} from "react";


export type MyDecryptComponentProps = {
    encryptedString: string
}

const encryptedMysql = 'jWbrYsksuxfyNZMc:S5BS+u68GMAmNamzAdpkNEnr6xOq8iZY0xOMqcJjPg=='

export function MyDecryptComponent({encryptedString}: MyDecryptComponentProps) {
    const [sad] = useSecretData()
    const [display, setDisplay] = useState('')
    useEffect(() => {
        if (hasEnteredPassword(sad))
            decryptString(sad.cryptoKeyString)(encryptedString).then(setDisplay)
        else
            setDisplay('Need a password')
    }, [encryptedString, sad]);
    return <>
        <SecretDataProvider secretData={defaultSecretData()}>
            <SimplePassword/>
            <div>{display}</div>
        </SecretDataProvider>
    </>
}