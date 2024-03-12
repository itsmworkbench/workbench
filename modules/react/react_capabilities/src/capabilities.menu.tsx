import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { DisplayCapabilitiesListProps } from "./display.capabilities.list";


export function DisplayCapabilitiesMenu<S> ( { state }: DisplayCapabilitiesListProps<S> ) {
  const [ anchorEl, setAnchorEl ] = useState<null | HTMLElement> ( null );
  const open = Boolean ( anchorEl );
  const capabilities = state.state1 ().optJson () || [];
  const selectedTab = state.state2 ().optJson ();

  const handleClick = ( event: React.MouseEvent<HTMLButtonElement> ) => {
    setAnchorEl ( event.currentTarget );
  };

  const handleClose = () => {
    setAnchorEl ( null );
  };

  const handleMenuItemClick = ( c: string ) => {
    state.state2 ().setJson ( c, 'Clicked in DisplayCapabilitiesList' );
    handleClose ();
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <AddIcon/>
      </IconButton>
      <Menu
        id="capabilities-menu"
        anchorEl={anchorEl}
        open={open}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'capabilities-button',
        }}
      >
        {capabilities.length === 0 && <MenuItem selected={selectedTab === `newTicket`} onClick={() => handleMenuItemClick ( 'newTicket' )}>New Ticket </MenuItem>}
        {capabilities.map ( ( c ) => (
          <MenuItem
            key={c}
            selected={selectedTab === `${c}Workbench`}
            onClick={() => handleMenuItemClick ( `${c}Workbench` )}
          >
            {c}
          </MenuItem>
        ) )}
      </Menu>
    </>
  );
}
