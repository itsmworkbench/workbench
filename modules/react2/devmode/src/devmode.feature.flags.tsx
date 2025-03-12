import React, {useMemo} from "react";
import {devModeStyles} from "./dev.mode.styles";
import {FeatureFlags, isOptionsFeatureFlag, useFeatureFlagsState} from "@itsmworkbench/react_utils";
import {lensBuilder} from "@itsmworkbench/optics";
import {FieldDefn, ObjectDefn} from "@itsmworkbench/object_defn";
import {EditObjectFromDefn} from "@itsmworkbench/editobject";

export function featureFlagsToObjectDefn(ffs: FeatureFlags): ObjectDefn<FeatureFlags> {
    const keys = Object.keys(ffs);
    const layout = Array(keys.length).fill(1)
    const lb = lensBuilder<FeatureFlags>()
    const fieldsDefns: [string, FieldDefn<FeatureFlags, any>][] = keys.map<[string, FieldDefn<FeatureFlags, any>]>(key =>
        [key, isOptionsFeatureFlag(ffs[key]) ?
            ({
                fieldType: 'options',
                editable: true,
                options: ffs[key].options,
                lens: lb.focusOn(key).focusOn('value')
            }) : ({
                fieldType: 'boolean',
                editable: true,
                value: ffs[key].value,
                lens: lb.focusOn(key).focusOn('value')
            })]
    );
    const fields = Object.fromEntries(fieldsDefns);
    return {layout, fields};
}

export function DevModeFeatureFlags() {
    const featureFlagOps = useFeatureFlagsState();
    const {containerStyle} = devModeStyles;
    const defns = useMemo(() => featureFlagsToObjectDefn(featureFlagOps[0]), [featureFlagOps[0]]);
    return <EditObjectFromDefn showLabel='camelToWords' rootId='devmode.feature.flags' mainOps={featureFlagOps} objectDefn={defns}/>
}

