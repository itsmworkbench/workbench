import { useVariables } from "../hooks/useVariables";
import React from "react";

export function DisplayVariables () {
  const attributes = useVariables ()
  return <div>
    <h1>Attributes</h1>
    <pre>{JSON.stringify ( attributes ||{}, null, 2 )}</pre>
  </div>
}