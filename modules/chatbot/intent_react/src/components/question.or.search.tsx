import React from 'react';
import { FormControl, FormControlLabel, FormLabel, Paper, Radio, RadioGroup } from '@mui/material';
import { QuestionSearch } from "../domain/domain";
import { LensProps } from "@focuson/state";


export interface QuestionOrSearchProps<S> extends LensProps<S, QuestionSearch, any> {
}

export function QuestionOrSearch<S> ( { state }: QuestionOrSearchProps<S> ) {
  const select = ( question: QuestionSearch ) => () => state.setJson ( question, 'QuestionOrSearch' );
  return <Paper elevation={3} style={{ borderRadius: '8px', display: 'flex', flexDirection: 'column', width: '300px' }}>
    <FormControl component="fieldset">
      <FormLabel component="legend">Input Type</FormLabel>
      <RadioGroup
        aria-label="input type"
        name="inputType"
        value={state.optJson ()}
      >
        <FormControlLabel value="Question" control={<Radio onChange={select ( 'Question' )}/>} label="Question"/>
        <FormControlLabel value="Search" control={<Radio onChange={select ( 'Search' )}/>} label="Search"/>
      </RadioGroup>
    </FormControl>
  </Paper>
}

