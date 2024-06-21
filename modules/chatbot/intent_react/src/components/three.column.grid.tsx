import { Grid } from "@mui/material";
import React from "react";

export type ThreeColumnGridProps = {
  children: React.ReactElement[]
}
export function ThreeColumnGrid ( { children }: ThreeColumnGridProps ) {
  return <Grid container spacing={2} justifyContent="left">{children.map (
    ( child, i ) =>
      <Grid item key={i} xs={12} sm={6} md={4}>{child}</Grid> )}</Grid>;
}