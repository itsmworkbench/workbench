import {LensAndPath, lensBuilder} from "@itsmworkbench/optics";
import {NameAnd} from "@itsmworkbench/utils";
import {LabelDisplay} from "@itsmworkbench/renderers";

export const objectDefnDebugName = 'objectDefn'
export type FieldType = 'string' | 'encrypted' | 'options' | 'boolean' | 'status'
export type FieldTypeAnd<T> = Record<FieldType, T>
export type FieldTypeFn<T> = (fieldType: FieldType) => T

export type SimpleFieldDefn<Main, T> = {
    lens: LensAndPath<Main, T>
    fieldType?: FieldType //default is string
    editable?: boolean//default is true
    labelDisplay?: LabelDisplay

}
export type OptionsFieldDefn<Main, T> = SimpleFieldDefn<Main, T> & {
    fieldType: 'options'
    options: T[]
}
export type FieldDefn<Main, T> = SimpleFieldDefn<Main, T> | OptionsFieldDefn<Main, T>

export type ObjectDefn<Main> = {
    fields: NameAnd<FieldDefn<Main, any>>
    layout: number[]
}
