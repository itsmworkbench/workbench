import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import React from "react";

export interface StatusIndicatorProps {
  value: boolean | undefined

}
export const StatusIndicator = ({ value }: StatusIndicatorProps) => {
  switch (value) {
    case true:
      return <CheckIcon style={{ color: 'green' }}/>;
    case false:
      return <CloseIcon style={{ color: 'red' }}/>;
    default:
      return <HourglassEmptyIcon style={{ color: 'gray' }}/>;
  }
};