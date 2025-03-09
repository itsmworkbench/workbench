import React from "react";
import {DisplayLoadingErrors, LoadingDisplay} from "./loadingOr";
import {hasErrors} from "@laoban/utils";

export const simpleLoadingDisplay: LoadingDisplay = (): React.ReactElement => <span>Loading...</span>;
export const defaultError: DisplayLoadingErrors = ({error}): React.ReactElement =>
    <span>Error: {hasErrors(error) ? error.join(',') : error}</span>;

export const justErrors: DisplayLoadingErrors = ({error}): React.ReactElement =>
    <span>{hasErrors(error) ? error.join(',') : error}</span>;