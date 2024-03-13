import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InfoIcon from "@mui/icons-material/Info";
import React from "react";
import { calcDrawerOpen, DrawerLayoutProps, MainAppMainState } from "./main.app.layout";
import { LensProps, LensState } from "@focuson/state";

export interface MainAppBarProps<S> extends LensProps<S, MainAppMainState, any> {
  title: string
  layout?: DrawerLayoutProps;
}
export function MainAppBar<S> ( { title, state, layout }: MainAppBarProps<S> ) {
  let leftState = state.focusOn ( 'leftDrawerOpen' );
  let rightState = state.focusOn ( 'rightDrawerOpen' );
  const { leftDrawerOpen, rightDrawerOpen } = calcDrawerOpen ( state );
  const click = ( state: LensState<S, boolean, any>, value: boolean ) => () => {state.setJson ( !value , '' ) }
  return <AppBar position="fixed" sx={{ zIndex: ( theme ) => theme.zIndex.drawer + 1 }}>
    <Toolbar>
      <IconButton
        color="inherit"
        aria-label="open nav drawer"
        edge="start"
        onClick={click ( leftState, leftDrawerOpen )}
        sx={{ mr: 2 }}
      >
        <MenuIcon/>
      </IconButton>
      <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
        {title}
      </Typography>
      <IconButton
        color="inherit"
        aria-label="open info drawer"
        onClick={click ( rightState, rightDrawerOpen )} // Adjust this onClick event
      >
        <InfoIcon/>
      </IconButton>
    </Toolbar>
  </AppBar>
}
