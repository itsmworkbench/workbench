import { escapeRegExp } from "./reverse.template";

export function findUsedVariables ( inputString: string, variables: Record<string, string> ): string[] {
  const usedVariables: string[] = [];

  for ( const varName in variables ) {
    const varValue = variables[ varName ];
    // Escape potential regex special characters in the variable value
    const escapedVarValue = escapeRegExp ( varValue );
    // Create a regex to find the variable value in the input string
    const regex = new RegExp ( escapedVarValue );

    // If the variable value is found in the input string, add the variable name to the usedVariables array
    if ( regex.test ( inputString ) ) {
      usedVariables.push ( varName );
    }
  }

  return usedVariables;
}

export function extractVariableNames ( template: string ): string[] {
  // Using a stricter regex that matches complete and correct braces around the names
  const pattern = /\{([^\{\}]+)\}/g; // Only matches well-formed brace pairs
  let match;
  const variableNames: string[] = [];

  while ( (match = pattern.exec ( template )) !== null ) {
    variableNames.push ( match[ 1 ].trim () );
  }

  return variableNames;
}

