import {FieldDefn, FieldType, FieldTypeAnd, ObjectDefn, objectDefnDebugName} from "@itsmworkbench/object_defn";
import {DataLayout, LabelDisplay, useRenderers} from "@itsmworkbench/renderers";
import {GetterSetter, makeContextFor, useDebug} from "@itsmworkbench/react_utils";
import React from "react";
import {SimpleViewComponents} from "./simpleViewComponents";
import {useTranslation} from "@itsmworkbench/translation";
import {useTheme} from "@itsmworkbench/themes";
import {useCommonComponents} from "@itsmworkbench/common_components";

export type ViewComponentProps<Main, T> = {
    rootId: string
    main: Main
    fieldDefn: FieldDefn<Main, T>
    showLabel?: LabelDisplay
    clipboard?: boolean
}
export type ViewComponent<T> = <Main, >(props: ViewComponentProps<Main, T>) => React.ReactElement

export type ViewComponents = {
    DataLayout: DataLayout
    StringView: ViewComponent<string>
    EncryptedView: ViewComponent<string>
    OptionsView: ViewComponent<string>
    BooleanView: ViewComponent<boolean>
    StatusView: ViewComponent<boolean>
}

export type ViewObjectProps<Main> = {
    rootId: string
    main: Main
    title?: string
    objectDefn: ObjectDefn<Main>
    showLabel?: LabelDisplay
    selectedOps?: GetterSetter<number> //same signature as useState
    onClick?: (fieldName: string, fieldDefn: FieldDefn<Main, unknown>, index: number) => void
    clipboard?: boolean

}

export function findView<Main>(Views: ViewComponents, fieldType: FieldType, props: ViewComponentProps<Main, any>) {
    if (fieldType === 'string'||fieldType===undefined) return <Views.StringView {...props}/>;
    if (fieldType === 'encrypted') return <Views.EncryptedView {...props}/>;
    if (fieldType === 'options') return <Views.OptionsView {...props}/>;
    if (fieldType === 'boolean') return <Views.BooleanView {...props}/>;
    if (fieldType === 'status') return <Views.StatusView {...props}/>;
    throw new Error(`Unknown field type ${fieldType}. Legal values are ${Object.keys(Views).toString()}`)
}

export function ViewObjectFromDefn<Main>({rootId, main, objectDefn, title, showLabel, selectedOps, onClick, clipboard}: ViewObjectProps<Main>) {
    const Views = useViewComponents();
    const DataLayout = Views.DataLayout;
    const {H3} = useRenderers()
    const translate = useTranslation()
    const debug = useDebug(objectDefnDebugName)
    const theme = useTheme()
    const selectedStyle = theme?.objectDefn?.selected || {}
    const notSelectedStyle = theme?.objectDefn?.notSelected || {}
    debug(rootId, title, objectDefn, main)
    return (
        <DataLayout rootId={rootId} layout={objectDefn.layout}>
            {title && <H3 rootId={rootId} attribute='viewobject.title' value={translate(title)}/>}
            {Object.entries(objectDefn.fields).map(([name, fieldDefn], index) => {
                const {fieldType} = fieldDefn;
                const selected = selectedOps?.[0] === index;
                const result = findView(Views, fieldType, {rootId, main, fieldDefn, showLabel, clipboard});
                debug('field', name, fieldDefn, result)
                const containerStyle = selected ? selectedStyle : notSelectedStyle;
                const click = () => {
                    onClick?.(name, fieldDefn, index);
                    selectedOps?.[1](index);
                }
                return <span className='viewObjectField' style={containerStyle} key={name} onClick={click}>{result}</span>
            })}
        </DataLayout>
    )
}

export const {use: useViewComponents, Provider: ViewComponentsProvider} = makeContextFor<ViewComponents, 'viewComponents'>('viewComponents', SimpleViewComponents);
