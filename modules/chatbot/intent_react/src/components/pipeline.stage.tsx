import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

export interface PipelineStageProps {
  icon: SvgIconComponent;
  selected: boolean;
  title: string;
  data: string;
  stageClicked: () => void
}

export const PipelineStage: React.FC<PipelineStageProps> = ( { icon: Icon, selected, title, data, stageClicked } ) => {
  console.log('in pipeline stage', selected, title, data);
  return (
    <Tooltip title={data}>
      <IconButton onClick={stageClicked} style={{ backgroundColor: selected ? 'lightblue' : 'initial' }}>
        <Icon/>
      </IconButton>
    </Tooltip>
  );
};
