import {DevModeComponent} from "@itsmworkbench/devmode";
import React from "react";
import {useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";
import {ellipsesInMiddle} from "@itsmworkbench/utils";
import {useSecretData} from "./password";
import {encryptString, hasEnteredPassword, hasPassword} from "@itsmworkbench/authentication";


export const DevmodeSecretData: DevModeComponent = () => {
    const [sd, setSd] = useSecretData();
    const [encrypted, setEncrypted] = React.useState('')
    const {DataLayout, Text, Json} = useAttributeValueComponents()
    const [secretData] = useSecretData()
    const rootId = 'devmode-secret-data';
    const fromLocalStorage = {
        salt: localStorage.getItem('itsm.salt') || '',
        testValue: localStorage.getItem('itsm.testValue') || '',
        rootKey: localStorage.getItem('itsm.rootKey') || ''
    }
    const safer = {...sd, cryptoKeyString: ellipsesInMiddle((sd as any).cryptoKeyString, 7)}
    return <DataLayout rootId={rootId} layout={[2, 2, 1, 1, 2]}>
        <button onClick={() => {
            const {salt, testValue, rootKey} = sd
            setSd({salt, testValue, rootKey})
        }}>Forget have entered password
        </button>
        <button onClick={() => {
            localStorage.setItem('itsm.testValue', '')
            const {salt, rootKey} = sd
            setSd({salt, rootKey})

        }}>Reset stored password
        </button>
        <Text rootId={rootId} attribute='devMode.hasPassword' value={hasPassword(sd).toString()}/>
        <Text rootId={rootId} attribute='devMode.hasEnteredPassword' value={hasEnteredPassword(sd).toString()}/>
        <Json rootId={rootId} attribute='devMode.secretData' value={safer}/>
        <Json rootId={rootId} attribute='devMode.secretDataInLocalStorage' value={fromLocalStorage}/>
        {hasPassword(secretData) && <><input type={'text'} defaultValue='' onChange={e => {
            encryptString(secretData.cryptoKeyString)(e.target.value || '').then(setEncrypted).catch(e=>setEncrypted(e.message))
        }}/>
            <Text rootId={rootId} attribute='devMode.encryptedValue' value={encrypted}/>
        </>}
    </DataLayout>
}