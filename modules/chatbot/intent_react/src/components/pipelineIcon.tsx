import React, { CSSProperties } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

export interface PipelineStageProps {
  icon: SvgIconComponent;
  selected: boolean;
  title: string;
  data: string;
  stageClicked: () => void
}
const squareStyle = ( selected: boolean ): CSSProperties => ({
  width: '50px', // Adjust width as needed
  height: '50px', // Same value as width to make it square
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: selected ? 'lightblue' : 'initial'
});
export const PipelineIcon: React.FC<PipelineStageProps> = ( { icon: Icon, selected, title, data, stageClicked } ) => {
  return <Tooltip title={`${title}: ${data}`}>
    <IconButton onClick={stageClicked} style={squareStyle ( selected )}>
      <Icon/>
    </IconButton>
  </Tooltip>
};
