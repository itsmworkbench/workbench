import {SimpleDataLayout, useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";
import {useSecretData} from "@itsmworkbench/secrets";
import React, {useEffect, useState} from "react";
import {decryptString, hasEnteredPassword} from "@itsmworkbench/authentication";
import {ViewComponentProps, ViewComponents} from "./view.object";
import {LensAndPath} from "@itsmworkbench/optics";

export function findAttribute(lens: LensAndPath<any, any>) {
    return lens.path.join('.')
}

export function SimpleStringView<Main>({main, fieldDefn, showLabel, ...rest}: ViewComponentProps<Main, string>) {
    const {Text} = useRenderers();
    const {Text: TextAndLabel} = useAttributeValueComponents();
    const {lens} = fieldDefn;
    const value = lens.get(main);
    const attribute = findAttribute(lens)
    return showLabel ?
        <TextAndLabel {...rest} attribute={attribute} value={value} labelDisplay={fieldDefn.labelDisplay}/> :
        <Text  {...rest} attribute={attribute} value={value}/>
}

export function SimpleEncryptedView<Main>({main, fieldDefn, showLabel, ...rest}: ViewComponentProps<Main, string>) {
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
    const attribute = findAttribute(lens)
    return <div style={{display: 'flex', justifyContent: 'startpace-between', alignItems: 'center'}}>
        {showLabel ?
            <TextAndLabel {...rest} attribute={attribute} value={value} labelDisplay={fieldDefn.labelDisplay}/> :
            <Text {...rest} attribute={attribute} value={value}/>}&nbsp;
        <button onClick={() => setShow(!show)}>{show ? '🚫' : '👁️‍🗨️'}</button>
    </div>
}

export function SimpleBooleanView<Main>({main, fieldDefn, showLabel, ...rest}: ViewComponentProps<Main, boolean>) {
    const {Text} = useRenderers();
    const {Text: TextAndLabel} = useAttributeValueComponents();
    const lens: LensAndPath<Main, boolean> = fieldDefn.lens;
    const value = lens.get(main);
    const attribute = findAttribute(lens)
    return showLabel ?
        <TextAndLabel {...rest} attribute={attribute} value={value?.toString()} labelDisplay={fieldDefn.labelDisplay}/> :
        <Text {...rest} attribute={attribute} value={value === undefined ? 'undefined' : value?.toString()}/>
}

export function SimpleStatusView<Main>({main, fieldDefn, showLabel, ...rest}: ViewComponentProps<Main, boolean>) {
    const {Status} = useRenderers();
    const {Status: StatusAndLabel} = useAttributeValueComponents();
    const lens: LensAndPath<Main, boolean> = fieldDefn.lens;
    const value = lens.get(main);
    const attribute = findAttribute(lens)

    return showLabel ?
        <StatusAndLabel {...rest} attribute={attribute} value={value} labelDisplay={fieldDefn.labelDisplay}/> :
        <Status {...rest} attribute={attribute} value={value}/>
}

export const SimpleViewComponents: ViewComponents = {
    DataLayout: SimpleDataLayout,
    StringView: SimpleStringView,
    EncryptedView: SimpleEncryptedView,
    OptionsView: SimpleStringView,
    BooleanView: SimpleBooleanView,
    StatusView: SimpleStatusView
}