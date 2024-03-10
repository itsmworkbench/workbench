import React, { ComponentType, ReactElement, useState } from 'react';
import IconButton from "@mui/material/IconButton";
import ViewCompactIcon from '@mui/icons-material/ViewCompact'; // Icon for "micro"
import ViewModuleIcon from '@mui/icons-material/ViewModule'; // Icon for "mini"
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt'; // Icon for "full"

export type PROPSAndIcons<Props> = Props & {
  icons: ReactElement;
}

export interface WithSelectableSizeProps<PROPS> {
  MicroComponent: ComponentType<PROPSAndIcons<PROPS>>;
  MiniComponent?: ComponentType<PROPSAndIcons<PROPS>>;
  FullComponent: ComponentType<PROPSAndIcons<PROPS>>;
  data: PROPS;
}

type SizeOption = 'micro' | 'mini' | 'full';

// The HOC definition using generics for props
export function SelectableSize<PROPS> ( {
                                              MicroComponent,
                                              MiniComponent,
                                              FullComponent,
                                              data,
                                            }: WithSelectableSizeProps<PROPS> ): React.ReactElement {
  const [ size, setSize ] = useState<SizeOption> ( 'micro' );
  const icons = (
    <>
      <IconButton onClick={() => setSize ( 'micro' )} color="primary" aria-label="micro size">
        <ViewCompactIcon/>
      </IconButton>
      {MiniComponent&&<IconButton onClick={() => setSize ( 'mini' )} color="primary" aria-label="mini size">
        <ViewModuleIcon/>
      </IconButton>}
      <IconButton onClick={() => setSize ( 'full' )} color="primary" aria-label="full size">
        <ViewQuiltIcon/>
      </IconButton>
    </>
  );
  function renderedComponent () {
    if ( size === 'mini' ) return <MiniComponent {...data} icons={icons}/>;
    if ( size === 'full' ) return <FullComponent {...data} icons={icons}/>;
    return <MicroComponent {...data} icons={icons}/>;
  }

  return renderedComponent ()
}
