import React, { useState } from "react";
import { LensProps } from "@focuson/state";
import { Editor, useMonaco } from "@monaco-editor/react";
import { useYaml } from "@itsmworkbench/components";
import { hasErrors } from "@laoban/utils";
import { yamlWriterToStringWithErrorsEmbedded } from "@itsmworkbench/yaml";

export interface YamlEditorProps {
  yaml: any
  Suggest: ( setYaml: ( yaml: string ) => void ) => React.ReactNode
  Save: ( yaml: string | string[] | undefined ) => React.ReactNode | undefined
  height?: string
}

export function YamlEditor<S> ( { yaml, Save, height, Suggest }: YamlEditorProps ) {
  const yamlCapability = useYaml ()
  const [ yamlContent, setYamlContent ] = useState <string|undefined>( yamlWriterToStringWithErrorsEmbedded ( yamlCapability.writer ) ( yaml || {} ) );
  const yamlString = hasErrors ( yamlContent ) ? 'Errors\n' + yamlContent.join ( '\n' ) : yamlContent
  const monaco = useMonaco (); // needed to initialise
  return (<>
      <Editor
        height={height || '300px'}
        language="yaml"
        value={yamlString}
        options={{
          minimap: { enabled: false },
        }}
        onChange={e => setYamlContent ( e )}
      />
      {Suggest ( setYamlContent )}
      {Save ( yamlContent )}
    </>
  )
    ;
}