import {ErrorType, ThrowError} from "@itsmworkbench/errors";
import React from "react";


export const throwError: ThrowError = (type: ErrorType, msg) => {
    throw new Error(`${type}: ${msg}`)
}

//Note that we can't use makeContextFor here because we are used in that method
export const ThrowErrorContext = React.createContext<ThrowError>(throwError)
export const useThrowError = () => React.useContext(ThrowErrorContext)

export type ThrowErrorProviderProps = {
    logError: ThrowError
    children: React.ReactNode
}

export function ThrowErrorProvider({logError, children}: ThrowErrorProviderProps) {
    return <ThrowErrorContext.Provider value={logError}>{children}</ThrowErrorContext.Provider>
}
