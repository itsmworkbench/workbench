import React from "react";
import { TextField } from "@mui/material";
import { TextFieldProps } from "@mui/material/TextField/TextField";
import { LensState } from "@focuson/state";

export type ErrorFn = ( s: string ) => string | undefined
export type FocusTextAreaProps<S> = TextFieldProps & {
  state: LensState<S, string, any>;
  errorFn?: ( s: string ) => string | undefined
}
export const mustBeEmpty = ( errorMessage: string ) :ErrorFn=> s => !s || s.trim ().length === 0 ? undefined : errorMessage;
export const mustNotBeEmpty = ( errorMessage: string ):ErrorFn => s => s && s.trim ().length > 0 ? undefined : errorMessage;
export const mustBeEmail = ( errorMessage: string ):ErrorFn => s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test ( s ) ? undefined : errorMessage;
export const mustBeIdentifier = ( errorMessage: string ):ErrorFn => s =>  /^[a-zA-Z_-][.a-zA-Z0-9_@-]*$/.test ( s ) ? undefined : errorMessage;
export const mustBeAlpha = ( errorMessage: string ):ErrorFn => s =>  /^[a-zA-Z0-9_]*$/.test ( s ) ? undefined : errorMessage;
export const urlFriendly = ( errorMessage: string ):ErrorFn => s => /^[a-zA-Z0-9\-_~]+$/.test ( s ) ? undefined : errorMessage;
export const mustBeNumeric = ( errorMessage: string ):ErrorFn=> s => !isNaN ( parseFloat ( s ) ) ? undefined : errorMessage;
export const minLength = ( min: number, errorMessage: string ):ErrorFn => s => s && s.length >= min ? undefined : errorMessage;
export const maxLength = ( max: number, errorMessage: string ):ErrorFn => s => s && s.length <= max ? undefined : errorMessage;

export function FocusedTextInput<S> ( props: FocusTextAreaProps<S> ) {
  const { state, errorFn, ...rest } = props
  const value = state.optJson () || ''
  const actualError = errorFn && value.length>0 ? errorFn ( value ) : undefined
  const isError = actualError !== undefined
  const helperText = isError ? actualError : rest.helperText
  // console.log('FocusedTextInput', `[${value}]`,value?.length, isError, helperText)
  return <TextField {...rest} value={value}
                    error={isError}
                    helperText={helperText}
                    onChange={e => state.setJson ( e?.target?.value, '' )}/>
}

export function FocusedTextArea<S> ( props: FocusTextAreaProps<S> ) {
  return <FocusedTextInput {...props} fullWidth variant='outlined' multiline rows={props.rows}/>
}