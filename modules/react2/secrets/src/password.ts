import {makeContextForState} from "@itsmworkbench/react_utils";
import {SecretData, SecretDataWithoutPasswordChecked} from "./secret.data";

export type PasswordProps = {}
export type Password = (props: PasswordProps) => React.ReactNode

export const plainTextForTest = 'plain text'

export const {use: useSecretData, Provider: SecretDataProvider} = makeContextForState<SecretDataWithoutPasswordChecked, 'secretData'>('secretData')
