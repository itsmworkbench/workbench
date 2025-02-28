import {FieldDefn, ObjectDefn, OptionsFieldDefn} from "@itsmworkbench/object_defn";
import {DataLayout} from "@itsmworkbench/renderers";
import {GetterSetter} from "@itsmworkbench/react_utils";
import React from "react";
import {findView, useViewComponents, ViewObjectFromDefn} from "@itsmworkbench/viewobject";
import {useEditComponents} from "./simpleEditComponents";


export type EditObjectProps<Main> = {
    rootId: string
    mainOps: GetterSetter<Main>
    objectDefn: ObjectDefn<Main>
    showLabel?: boolean
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
    const {rootId, mainOps, objectDefn, showLabel} = props;

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

    return (
        <DataLayout rootId={rootId} layout={objectDefn.layout}>
            {Object.entries(objectDefn.fields).map(([name, fieldDefn]) => findEdit(name, fieldDefn))}
        </DataLayout>
    )
}

