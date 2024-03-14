export function escapeRegExp ( string: string ) {
  return string.replace ( /[.*+?^${}()|[\]\\]/g, '\\$&' ); // $& means the whole matched string
}

export function reverseTemplate ( inputString: string, variables: Record<string, string> ): string {
  let template = inputString;

  for ( const varName in variables ) {
    const varValue = variables[ varName ];
    const escapedVarValue = escapeRegExp ( varValue );
    const regex = new RegExp ( escapedVarValue, 'g' );
    template = template.replace ( regex, `\${${varName}}` );
  }
  return template;
}

export function findUsedVariables(inputString: string, variables: Record<string, string>): string[] {
  const usedVariables: string[] = [];

  for (const varName in variables) {
    const varValue = variables[varName];
    // Escape potential regex special characters in the variable value
    const escapedVarValue = escapeRegExp(varValue);
    // Create a regex to find the variable value in the input string
    const regex = new RegExp(escapedVarValue);

    // If the variable value is found in the input string, add the variable name to the usedVariables array
    if (regex.test(inputString)) {
      usedVariables.push(varName);
    }
  }

  return usedVariables;
}