import {SimpleDataLayout, useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";
import {useSecretData} from "@itsmworkbench/secrets";
import React, {useEffect, useState} from "react";
import {decryptString, hasEnteredPassword, hasPassword} from "@itsmworkbench/authentication";
import {ViewComponentProps, ViewComponents} from "./view.object";
import {LensAndPath} from "@itsmworkbench/optics";

export function SimpleStringView<Main>({rootId, main, fieldDefn, showLabel}: ViewComponentProps<Main, string>) {
    const {Text} = useRenderers();
    const {Text: TextAndLabel} = useAttributeValueComponents();
    const {lens} = fieldDefn;
    const value = lens.get(main);
    const attribute = `${rootId}.${lens.path}`
    return showLabel ?
        <TextAndLabel rootId={rootId} attribute={attribute} value={value}/> :
        <Text rootId={rootId} attribute={attribute} value={value}/>
}

export function SimpleEncryptedView<Main>({rootId, main, fieldDefn, showLabel}: ViewComponentProps<Main, string>) {
    const {Text} = useRenderers();
    const {Text: TextAndLabel} = useAttributeValueComponents();
    const [SecretData] = useSecretData()
    const [show, setShow] = useState(false)
    const lens: LensAndPath<Main, string> = fieldDefn.lens;
    const rawValue = lens.get(main);
    const [value, setValue] = useState('')
    useEffect(() => {
        if (show) {
            if (hasEnteredPassword(SecretData)) {
                decryptString(SecretData.cryptoKeyString)(rawValue).then(setValue)
            } else setValue('')
        } else setValue(rawValue)
    }, [rawValue, SecretData, show])
    const attribute = `${rootId}.${lens.path.join('.')}`
    return <div style={{display: 'flex', justifyContent: 'startpace-between', alignItems: 'center'}}>
        {showLabel ?
            <TextAndLabel rootId={rootId} attribute={attribute} value={value}/> :
            <Text rootId={rootId} attribute={attribute} value={value}/>}&nbsp;
        <button onClick={() => setShow(!show)}>{show ? '🚫' : '👁️‍🗨️'}</button>
    </div>
}

export const SimpleViewComponents: ViewComponents = {
    DataLayout: SimpleDataLayout,
    StringView: SimpleStringView,
    EncryptedView: SimpleEncryptedView,
}