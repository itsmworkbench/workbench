import React, {ReactNode} from "react";
import {SimpleDisplayLogin} from "./simple.login";
import {makeContextFor} from "@itsmworkbench/react_utils";


export type DisplayLoginProps = {}
export type DisplayLogin = (props: DisplayLoginProps) => ReactNode
export type NotLoggedIn = (() => ReactNode) | undefined

export const {Provider: LoginComponentsProvider, use: useLoginComponents} = makeContextFor('loginComponents', {DisplayLogin: SimpleDisplayLogin, NotLoggedIn: undefined as NotLoggedIn})


