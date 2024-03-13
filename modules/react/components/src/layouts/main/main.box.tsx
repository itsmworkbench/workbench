import { LensProps } from "@focuson/state";
import React, { ReactNode } from "react";
import { Box } from "@mui/material";
import { MainAppMainState } from "./main.app.layout";

export interface MainBoxProps<S> extends LensProps<S, MainAppMainState, any> {
  children: ReactNode;
  width: string
}

export function MainBox<S> ( { state, children, width }: MainBoxProps<S> ) {
  return <Box
    component="main"
    sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 3, width, maxWidth:width}}>
    {children}
  </Box>

}