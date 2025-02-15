import {RawTranslationFn, TranslationFn, TranslationProvider} from "@itsmworkbench/translation";
import {pathToValue} from "@itsmworkbench/record_utils";
import React, {ReactNode} from "react";
import {translationEn} from "./translation.en";

export function makeTranslationFn(translation: Record<string, any>): RawTranslationFn {
    return (key: string) => {
        return pathToValue(translation, key)
    }
}

type SimpleTranslationProps = { children: ReactNode, translation?: Record<string, any> }

export function SimpleTranslationProvider({children, translation = translationEn}: SimpleTranslationProps) {
    const translationFn = makeTranslationFn(translation);
    return <TranslationProvider translationFn={translationFn}>{children}</TranslationProvider>;
}