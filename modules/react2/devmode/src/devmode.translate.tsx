import React from "react";
import {useLanguage} from "@itsmworkbench/language";
import {useTranslationUsedAndNotFound} from "@itsmworkbench/translation";
import {useAttributeValueComponents} from "@itsmworkbench/renderers";

export function DevModeTranslate() {
    const ops = useTranslationUsedAndNotFound();
    const [language] = useLanguage();
    const {DataLayout, Text, H1, Json} = useAttributeValueComponents();
    const rootId = 'dev-mode-translate';
    if (ops) {
        const {used, notFound, errors} = ops[0];
        return <DataLayout rootId='devModeTranslate' layout={[2, 1, 1,1]}>
            <Text rootId={rootId} attribute='devmode.language' value={language}/>
            <Text rootId={rootId} attribute='devmode.localStorage' value={localStorage.getItem('i18nextLng')||'<None>'}/>
            <Json rootId={rootId} attribute='devmode.translation.used' value={[...used].sort()}/>
            <Json rootId={rootId} attribute='devmode.translation.notFound' value={[...notFound].sort()}/>
            <Json rootId={rootId} attribute='devmode.translation.errors' value={[...errors].sort()}/>
        </DataLayout>;
    }
    return <p>The TranslationUsedAndNotFoundProvider is not used</p>;
}