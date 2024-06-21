import React from 'react';
import { FormControl, FormControlLabel, FormLabel, Paper, Radio, RadioGroup } from '@mui/material';
import { QuestionSearch } from "../domain/domain";


export interface QuestionOrSearchProps {
  questionOrSearch: QuestionSearch
}

export function QuestionOrSearch ( { questionOrSearch }: QuestionOrSearchProps ) {
  return  <Paper elevation={3} style={{ borderRadius: '8px', display: 'flex', flexDirection: 'column',  width: '350px' }}>
    <FormControl component="fieldset">
      <FormLabel component="legend">Input Type</FormLabel>
      <RadioGroup
        aria-label="input type"
        name="inputType"
        value={questionOrSearch}
      >
        <FormControlLabel value="Question" control={<Radio/>} label="Question"/>
        <FormControlLabel value="Search" control={<Radio/>} label="Search"/>
      </RadioGroup>
    </FormControl>
  </Paper>
}

