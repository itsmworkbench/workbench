import {DisplaySovereignPage, makeSovereignStatePlugin} from "@itsmworkbench/sovereign";
import React from "react";
import {useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";
import {TranslationFn, useTranslation} from "@itsmworkbench/translation";
import {toCamelCase} from "@itsmworkbench/utils";


export function Information(info: string): DisplaySovereignPage {
    return () => {
        const translate: TranslationFn = useTranslation()
        const text = translate(info)
        const {Markdown} = useRenderers()
        const {DataLayout} = useAttributeValueComponents()
        const rootId = toCamelCase(info)
        return <DataLayout rootId={rootId} layout={[]}>
            <Markdown rootId={rootId} attribute={'info'} value={text}/>
        </DataLayout>
    }
}


export function InformationSovereignPane(about: string) {
    return makeSovereignStatePlugin(Information(about))
}

