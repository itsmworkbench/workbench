import {LensAndPath} from "@itsmworkbench/optics";
import {NameAnd} from "@itsmworkbench/utils";

export type FieldType = 'string'
export type FieldDefn<Main, T> = {
    lens: LensAndPath<Main, T>
    fieldType?: FieldType //default is string
}
export type ObjectDefn<Main> = NameAnd<FieldDefn<Main, any>>
