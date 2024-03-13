import { LensState } from "@focuson/state";
import React, { ReactNode } from "react";
import { Box, CssBaseline } from "@mui/material";
import { MainAppBar, MainAppBarProps } from "./main.app.bar";
import { MainBox, MainBoxProps } from "./main.box";
import { LeftDrawer } from "./left.drawer";
import { SliderBar } from "./slider.drawer";

export interface DrawerLayoutProps {
  height?: string;
  leftDrawerWidth?: string;
  rightDrawerWidth?: string;
}
export function calcDrawerOpen<S> ( state: LensState<S, MainAppMainState, any> ) {
  const json = state.optJson ()
  const leftDrawerOpen = json?.leftDrawerOpen !== false;
  const rightDrawerOpen = json?.rightDrawerOpen === true;
  return { leftDrawerOpen, rightDrawerOpen };
}
export function calcDrawer<S> ( state: LensState<S, MainAppMainState, any>, layout: DrawerLayoutProps | undefined ) {
  const { leftDrawerOpen, rightDrawerOpen } = calcDrawerOpen ( state );

  const targetLeftDrawerWidth = layout?.leftDrawerWidth || '240px';
  const leftDrawerWidth = leftDrawerOpen ? targetLeftDrawerWidth : '100px';
  const targetRightDrawerWidth = layout?.rightDrawerWidth || '400px';
  const rightDrawerWidth = rightDrawerOpen ? targetRightDrawerWidth : '100px';
  const width = `calc('100vw' - ${leftDrawerWidth} - ${rightDrawerWidth} - 20px`
  return { leftDrawerOpen, leftDrawerWidth, rightDrawerOpen, rightDrawerWidth, width };
}


export interface MainAppProps<S> extends MainAppBarProps<S> {
  Nav: ReactNode;
  Details: ReactNode;
  children: ReactNode;
}
export interface MainAppMainState {
  leftDrawerOpen?: boolean;
  rightDrawerOpen?: boolean;
}

export function MainAppLayout<S> ( props: MainAppProps<S> ) {
  const { state, title, Nav, Details, children, layout } = props;
  const { leftDrawerOpen, leftDrawerWidth, rightDrawerOpen, rightDrawerWidth, width } = calcDrawer ( state, layout );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline/>
      <MainAppBar {...props}/>
      <LeftDrawer Nav={Nav} drawerWidth={leftDrawerWidth} open={leftDrawerOpen}/>
      <MainBox {...props} width={width}/>
      <SliderBar anchor='right' drawerWidth={rightDrawerWidth} drawerOpen={rightDrawerOpen} children={Details}/>
    </Box>
  );
}

