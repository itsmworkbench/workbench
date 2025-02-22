import {makeContextForState} from "@itsmworkbench/react_utils";
import {SecretDataWithoutPasswordChecked} from "@itsmworkbench/authentication";



export type PasswordProps = {}
export type Password = (props: PasswordProps) => React.ReactNode



export const {use: useSecretData, Provider: SecretDataProvider} = makeContextForState<SecretDataWithoutPasswordChecked, 'secretData'>('secretData')
