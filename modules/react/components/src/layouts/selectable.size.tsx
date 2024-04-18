import React, { ComponentType, ReactElement, useState } from 'react';
import IconButton from "@mui/material/IconButton";
import ViewCompactIcon from '@mui/icons-material/ViewCompact'; // Icon for "micro"
import ViewModuleIcon from '@mui/icons-material/ViewModule'; // Icon for "mini"
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt'; // Icon for "full"
import BugReportIcon from '@mui/icons-material/BugReport';
export type PROPSAndIcons<Props> = Props & {
  icons: ReactElement;
}

export interface WithSelectableSizeProps<PROPS> {
  MicroComponent: ComponentType<PROPSAndIcons<PROPS>>;
  MiniComponent?: ComponentType<PROPSAndIcons<PROPS>>;
  FullComponent?: ComponentType<PROPSAndIcons<PROPS>>;
  DebugComponent?: ComponentType<PROPSAndIcons<PROPS>>;
  data: PROPS;
}

type SizeOption = 'micro' | 'mini' | 'full' | 'debug'

// The HOC definition using generics for props
export function SelectableSize<PROPS> ( {
                                          MicroComponent,
                                          MiniComponent,
                                          FullComponent,
                                          DebugComponent,
                                          data,
                                        }: WithSelectableSizeProps<PROPS> ): React.ReactElement {
  const [ size, setSize ] = useState<SizeOption> ( 'micro' );
  function handleClick (newSize: SizeOption) {
    if (newSize === size) return () => setSize ( 'micro' );
    return () => setSize ( newSize  );
  }
  const icons = (
    <>
      {/*<IconButton onClick={handleClick ('micro')} color="primary" aria-label="micro size">*/}
      {/*  <ViewCompactIcon/>*/}
      {/*</IconButton>*/}
      {MiniComponent && <IconButton onClick={handleClick('mini')} color="primary" aria-label="mini size">
          <ViewModuleIcon/>
      </IconButton>}
      {FullComponent && <IconButton onClick={handleClick('full')} color="primary" aria-label="full size">
          <ViewQuiltIcon/>
      </IconButton>}
      {DebugComponent && <IconButton onClick={handleClick('debug')} color="primary" aria-label="debug size">
          <BugReportIcon/></IconButton>}
    </>
  );
  function renderedComponent () {
    if ( size === 'mini' && MiniComponent !== undefined ) return <MiniComponent {...data} icons={icons}/>;
    if ( size === 'full' && FullComponent !== undefined ) return <FullComponent {...data} icons={icons}/>;
    if ( size === 'debug' && DebugComponent !== undefined ) return <DebugComponent {...data} icons={icons}/>;
    return <MicroComponent {...data} icons={icons}/>;
  }

  let result = renderedComponent ();
  // console.log ( 'size', size, 'result', result )
  return result
}
