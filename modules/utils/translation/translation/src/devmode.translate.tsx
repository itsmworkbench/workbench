import React from "react";
import {useLanguage} from "@itsmworkbench/language";
import {useAttributeValueComponents} from "@itsmworkbench/renderers";
import {useTranslationUsedAndNotFound} from "./translation";

export function DevModeTranslate() {
    const ops = useTranslationUsedAndNotFound();
    const [language] = useLanguage();
    const {DataLayout, Text, H1, Json} = useAttributeValueComponents();
    const rootId = 'dev-mode-translate';
    if (ops) {
        const {used, notFound, errors} = ops[0];
        return <DataLayout rootId='devModeTranslate' layout={[2, 1, 1, 1]}>
            <Text rootId={rootId} attribute='devMode.language' value={language}/>
            <Json rootId={rootId} attribute='devMode.translation.used' value={[...used].sort()}/>
            <Json rootId={rootId} attribute='devMode.translation.notFound' value={[...notFound].sort()}/>
            <Json rootId={rootId} attribute='devMode.translation.errors' value={[...errors].sort()}/>
        </DataLayout>;
    }
    return <p>The TranslationUsedAndNotFoundProvider is not used</p>;
}