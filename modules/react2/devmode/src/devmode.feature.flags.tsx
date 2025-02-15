import React from "react";
import {DevModeStyles, devModeStyles} from "./dev.mode.styles";
import {CommonFeatureFlag, FeatureFlags, GetterSetter, isBooleanFeatureFlag, isOptionsFeatureFlag, makeGetterSetter, OptionsFeatureFlag, useFeatureFlagsState} from "@itsmworkbench/react_utils";
import {lensBuilder} from "@itsmworkbench/optics";
import {useAttributeEditorComponents} from "@itsmworkbench/editors";

export function DevModeFeatureFlags() {
    const [featureFlags, setFeatureFlags] = useFeatureFlagsState();
    const {containerStyle} = devModeStyles;
    return (
        <div style={containerStyle}>
            {Object.keys(featureFlags).map((key) => {
                const ops = makeGetterSetter(featureFlags, setFeatureFlags, lensBuilder<FeatureFlags>().focusOn(key).focusOn("value"));
                return <OneFeatureFlag key={key} name={key} featureFlag={featureFlags[key]} styles={devModeStyles} ops={ops}/>;
            })}
        </div>
    );
}

export type OneFeatureFlagProps<T> = {
    ops: GetterSetter<T>
    name: string
    featureFlag: CommonFeatureFlag<T>
    styles: DevModeStyles
}

export function DisplayBooleanFeatureFlag({styles, ops, name, featureFlag}: OneFeatureFlagProps<boolean>) {
    const [value, setValue] = ops;
    const {
        checkboxContainerStyle,
        labelStyle,
        checkboxStyle,
    } = styles;
    return (
        <div style={checkboxContainerStyle}>
            <label style={labelStyle}>
                <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setValue(v => !v)}
                    style={checkboxStyle}
                />
                {value}: {featureFlag.description}
            </label>
        </div>);
}

export function DisplayOptionsFeatureFlag({styles, ops, name, featureFlag}: OneFeatureFlagProps<string>) {
    const {options, description} = featureFlag as OptionsFeatureFlag;
    const {Options} = useAttributeEditorComponents();
    return <Options rootId="devmode" ops={ops} options={options} attribute={description} translate={false} ariaLabel={description}/>;
}


export function OneFeatureFlag<T>(props: OneFeatureFlagProps<T>) {
    const {featureFlag, name} = props;
    if (isBooleanFeatureFlag(featureFlag)) {
        return <DisplayBooleanFeatureFlag {...(props as any)} />;
    } else if (isOptionsFeatureFlag(featureFlag)) {
        return <DisplayOptionsFeatureFlag {...(props as any)} />;
    } else throw new Error("Unknown feature flag type") ;//not worth feeding in throwError I think
}


