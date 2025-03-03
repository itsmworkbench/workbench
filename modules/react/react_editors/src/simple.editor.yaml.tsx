import React, {useEffect, useState} from "react";
import {Editor, useMonaco} from "@monaco-editor/react";
import {useYaml} from "@itsmworkbench/components";
import {ErrorsAnd, hasErrors} from "@laoban/utils";
import {yamlWriterToStringWithErrorsEmbedded} from "@itsmworkbench/yaml";
import {GetterSetter} from "@itsmworkbench/react_utils";
import {ErrorsOr} from "@itsmworkbench/errors";

export interface SimpleYamlEditorProps {
    initial: string
    height?: string
    onChange?: (json: any) => void
    onError?: (errors: string[]) => void
}

export function SimpleYamlEditor({initial, height, onError, onChange}: SimpleYamlEditorProps) {
    const yamlCapability = useYaml()
    const [yaml, setYaml] = useState(initial)
    const monaco = useMonaco(); // needed to initialise
    const registerChange = (e: string) => {
        setYaml(e)
        const result: ErrorsAnd<any> = yamlCapability.parser(e)
        if (hasErrors(result)) return onError?.(result)
        else {
            onError?.([])
            onChange?.(result)
        }
    };
    useEffect(() => registerChange(initial), []);
    return <Editor
        height={height || '200px'}
        language="yaml"
        value={yaml}
        options={{minimap: {enabled: false},}}
        onChange={registerChange}
    />
}