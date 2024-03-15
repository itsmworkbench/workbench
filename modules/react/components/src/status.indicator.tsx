import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import React from "react";
import { BaseAction } from "@itsmworkbench/actions";

export interface StatusIndicatorProps {
  action?: BaseAction
  value: boolean | undefined

}
export const StatusIndicator = ({ value,action }: StatusIndicatorProps) => {
  switch (value) {
    case true:
      return <CheckIcon style={{ color: 'green' }}/>;
    case false:
      return <CloseIcon style={{ color: 'red' }}/>;
    default:
      return action?.optional ? <span/> : <HourglassEmptyIcon style={{ color: 'gray' }}/>;
  }
};