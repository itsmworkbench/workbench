import { AsyncLocalStorage } from "async_hooks";
import { NameAnd } from "@laoban/utils";
import { derefence, parensVariableDefn } from "@laoban/variables";
import { simpleTemplate } from "@itsmworkbench/utils";
import { consoleLog, LogFn, LogLevel, LogLevelValue } from "@itsmworkbench/kleislis";

const loggingHookState = new AsyncLocalStorage<SafeLoggingHookState> ()

export function useLog (): LogFn {
  const state = loggingHookState.getStore ()
  return state === undefined ? consoleLog : state.log
}
export function runWithLoggingHookState<T> ( state: LoggingHookState, fn: () => T ): T {
  return loggingHookState.run ( cleanLoggingHookState ( state ), fn )
}
export function runWithSafeLoggingHookState<T> ( state: SafeLoggingHookState, fn: () => T ): T {
  return loggingHookState.run ( state, fn )
}

export interface LoggingHookState  {
  timeService?: () => number
  correlationId?: string
  commonLogMessage?: NameAnd<string>
  mainTemplate?: string  // defaults to {time} {level} [CorrelationId: {correlationId}] {message} or {time} {level} {message} if the correlation id isn't there
  params?: NameAnd<any>
  globalLogLevel?: LogLevel
  log?: LogFn// defaults to console.log if not present

}
export type SafeLoggingHookState = {
  [K in keyof Omit<LoggingHookState, 'writeMetrics'>]-?: LoggingHookState[K];
} & {
  writeMetrics?: LogFn
}


export function cleanLoggingHookState ( l: LoggingHookState ): SafeLoggingHookState {
  return {
    timeService: l.timeService || Date.now,
    correlationId: l.correlationId || '',
    commonLogMessage: l.commonLogMessage || {},
    globalLogLevel: l.globalLogLevel || 'INFO',
    mainTemplate: l.mainTemplate || (l.correlationId && l.correlationId !== '' ? '{time} {level} [CorrelationId: {correlationId}] {message}' : '{time} {level} {message}'),
    params: l.params || {},
    log: l.log || consoleLog
  }
}

export function useLogging ( messages?: NameAnd<string>, dictionary?: NameAnd<any> ): LogFn {
  const safeDictionary = dictionary || {}
  const state = loggingHookState.getStore ()
  if ( state === undefined ) return consoleLog
  const global = LogLevelValue[ state.globalLogLevel ]
  return ( level, rawMessage ) => {
    if ( LogLevelValue[ level ] < global ) return
    const { log, correlationId, params, mainTemplate, timeService, commonLogMessage, globalLogLevel } = state;
    const allMessages = { ...commonLogMessage, ...(messages || {}) }
    let messageTemplate = allMessages[ rawMessage ] ? allMessages[ rawMessage ] : rawMessage;
    const time = timeService ()
    const fullDictionary = { ...params, ...safeDictionary, correlationId, time, message: rawMessage, level, }
    const message = derefence ( 'useLogging', fullDictionary, messageTemplate, { variableDefn: parensVariableDefn, allowUndefined: true } )
    const fullMessage = simpleTemplate ( mainTemplate, { correlationId, time, message, level } )
    log ( level, fullMessage )
  }
}
