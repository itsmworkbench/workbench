import { PipelineStage } from "./pipeline.stage";
import { Box, Checkbox, Paper, Typography } from '@mui/material';
import React, { useState } from "react";
import { NameAnd } from "@laoban/utils";
import { doTwoThings } from "../utils";
import { AgentStageAnd, AgentStages, IconAndTitle } from "../domain/domain";


export interface PipelineIconProps {
  iconsAndTitle: NameAnd<IconAndTitle>;
  data: AgentStageAnd<string>;
  selected: AgentStages | undefined
  stageClicked: ( stage: AgentStages ) => void
}
function PipelineIcons ( { iconsAndTitle, data, selected, stageClicked }: PipelineIconProps ) {
  function isSelected ( key: AgentStages ) {
    console.log ( 'isSelected', selected, key, selected === key )
    return selected === key;
  }
  return <Box display="flex" gap={2}>
    {Object.keys ( iconsAndTitle ).map ( ( key ) => {
      const stage: AgentStages = key as AgentStages
      return (
        <PipelineStage
          key={key}
          selected={isSelected ( stage )}
          icon={iconsAndTitle[ stage ].icon}
          title={iconsAndTitle[ stage ].title}
          data={data[ stage ] || 'No data'}
          stageClicked={() => stageClicked ( stage )}
        />
      );
    } )}
  </Box>;
}

export interface PipelineProps {
  iconsAndTitle: AgentStageAnd<IconAndTitle>;
  data: AgentStageAnd<string>;
  title: string;
  checkbox?: boolean
  checkboxChanged?: ( b: boolean ) => void
}

export type TitleAndCheckboxProps = {
  title: string
  value?: boolean
  valueChanged?: ( value: boolean ) => void
}
export function TitleAndCheckbox ( { title, value, valueChanged }: TitleAndCheckboxProps ) {
  const showCheckbox = value !== undefined
  return <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
    <Typography variant="h6" component="div" gutterBottom>
      {title}
    </Typography>
    {showCheckbox && (
      <Checkbox
        checked={value}
        onChange={( e ) => valueChanged?. ( e.target.checked )}
        inputProps={{ 'aria-label': 'controlled' }}
      />
    )}
  </Box>
}

export const Pipeline = ( { data, iconsAndTitle, title, checkbox, checkboxChanged }: PipelineProps ) => {
  const [ selected, setSelected ] = useState<AgentStages | undefined> ( undefined );
  const [ text, setText ] = useState<string> ( '' );
  const stageClicked = doTwoThings<AgentStages> ( setSelected, key => setText ( data[ key ] ) );
  return (
    <Paper elevation={3} style={{ padding: '16px', borderRadius: '8px', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', width: '350px' }}>
      <TitleAndCheckbox title={title} value={checkbox} valueChanged={checkboxChanged}/>
      <PipelineIcons iconsAndTitle={iconsAndTitle} data={data} selected={selected} stageClicked={stageClicked}/>
      <Box marginTop={2} width="100%" height="6rem" overflow="auto" padding="8px" border="1px solid #ccc" borderRadius="4px">
        <Typography variant="body1">{text}</Typography>
      </Box>
    </Paper>
  );
};