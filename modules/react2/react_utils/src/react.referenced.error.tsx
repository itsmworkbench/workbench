import {Errors} from "@itsmworkbench/errors";
import {makeContextFor} from "./react_utils";


//might go to the console, might go to a server... Importantly it returns a reference number that we can use to track down the error
//and this is likely to appear on the gui for the user
export type ErrorReporter = (error: Errors) => Promise<Errors>

export const {use: useErrorReporter, Provider: ErrorReporterProvider, context: ErrorReporterContext} = makeContextFor<ErrorReporter, 'errorReporter'>('errorReporter')

export const consoleErrorReporter: ErrorReporter = async (error: Errors) => {
    const reference = Math.random().toString(36).substring(2)
    const result = {...error, reference};
    console.error(result.errors.join('\n'), reference, 'extras', error.extras)
    return result
}
