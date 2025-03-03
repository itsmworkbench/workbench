import React from "react";
import {DisplayLoadingErrors, LoadingDisplay} from "./loadingOr";
import {hasErrors} from "@laoban/utils";

export const simpleLoadingDisplay: LoadingDisplay = (): React.ReactElement => <div>Loading...</div>;
export const defaultError: DisplayLoadingErrors = ({error}): React.ReactElement =>
    <div>Error: {hasErrors(error) ? error.join(',') : error}</div>;