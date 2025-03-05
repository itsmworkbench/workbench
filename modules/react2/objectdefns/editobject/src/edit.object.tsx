import {FieldDefn, ObjectDefn, OptionsFieldDefn} from "@itsmworkbench/object_defn";
import {DataLayout, useRenderers} from "@itsmworkbench/renderers";
import {GetterSetter} from "@itsmworkbench/react_utils";
import React from "react";
import {findView, useViewComponents, ViewObjectFromDefn} from "@itsmworkbench/viewobject";
import {useEditComponents} from "./simpleEditComponents";
import {useTranslation} from "@itsmworkbench/translation";
import {useTheme} from "@itsmworkbench/themes";


export type EditObjectProps<Main> = {
    rootId: string
    title?: string
    mainOps: GetterSetter<Main>
    objectDefn: ObjectDefn<Main>
    showLabel?: boolean
    clipboard?: boolean
    children?: React.ReactNode
}
export type EditOrViewObjectProps<Main> = EditObjectProps<Main> & {
    viewOnly?: boolean
}

export function EditOrViewObjectFromDefn<Main>(props: EditOrViewObjectProps<Main>) {
    if (props.viewOnly) return <ViewObjectFromDefn {...props} main={props.mainOps[0]}/>
    return <EditObjectFromDefn {...props}/>
}

export function EditObjectFromDefn<Main>(props: EditObjectProps<Main>) {
    const {DataLayout, ...Edits} = useEditComponents();
    const Views = useViewComponents()
    const {rootId, mainOps, objectDefn, children, title} = props;
    const theme = useTheme()
    const style = theme?.objectDefn?.notSelected || {}
    const {H3} = useRenderers()
    const translate = useTranslation()

    function findEdit(fieldName: string, fieldDefn: FieldDefn<Main, any>): React.ReactElement {
        const fieldType = fieldDefn.fieldType;
        const fieldProps = {...props, fieldName, fieldDefn,};
        if (fieldDefn.editable === false) return findView(Views, fieldType, {rootId, main: mainOps[0], fieldDefn, showLabel: true})
        if (fieldType === 'encrypted') return <Edits.EditEncryptedString {...fieldProps}/>;
        if (fieldType === 'string') return <Edits.EditString {...fieldProps}/>;
        if (fieldType === 'options') return <Edits.EditOptions {...fieldProps} options={(fieldDefn as OptionsFieldDefn<Main, any>).options}/>;
        if (fieldType === 'boolean') return <Edits.EditBoolean {...fieldProps}/>;
        if (fieldType === 'status') return <Edits.EditStatus {...fieldProps}/>;
        throw new Error(`Unknown field type ${fieldType}. Legal values are ${Object.keys(Edits).toString()}`)
    }

    console.log('EditObjectFromDefn', objectDefn, props.mainOps[0])
    return (
        <DataLayout rootId={rootId} layout={objectDefn.layout}>
            {title && <H3 rootId={rootId} attribute='viewobject.title' value={translate(title)}/>}
            {Object.entries(objectDefn.fields).map(([name, fieldDefn]) => {
                const result = findEdit(name, fieldDefn);
                return <span className='editObjectField' style={style} key={name}>{result}</span>;
            })}
            {children ? children : <></>}
        </DataLayout>
    )
}

