import Slide from '@mui/material/Slide';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import React from 'react';

interface SliderBarProps {
  children: React.ReactNode;
  drawerWidth: string;
  drawerOpen: boolean;
  anchor: 'left' | 'right'; // Add an anchor prop to determine the side
}

export function SliderBar ( { children, drawerWidth, drawerOpen, anchor }: SliderBarProps ) {
  // Determine the direction of the slide based on the anchor
  const slideDirection = anchor === 'left' ? 'right' : 'left';

  return (
    <Drawer
      variant="persistent"
      anchor={anchor}
      open={drawerOpen}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      {children}
    </Drawer>
  );
}
