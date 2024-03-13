import React, { ReactNode } from "react";
import { Drawer, Toolbar } from "@mui/material";

export interface LeftDrawerProps {
  Nav: ReactNode;
  drawerWidth: string;
  open: boolean;
}
export function LeftDrawer ( { drawerWidth, open, Nav }: LeftDrawerProps ) {
  return (
    <Drawer
      variant="persistent"
      anchor='left'
      open={open}
      sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }, }}
    >
      <Toolbar/>
      {Nav}
    </Drawer>
  );
}
