import {LensAndPath} from "@itsmworkbench/optics";
import {GetterSetter, Setter} from "./react_utils";

export function makeGetterSetterFrom<Main, T>(mainOps: GetterSetter<Main>, lens: LensAndPath<Main, T>): GetterSetter<T> {
    return makeGetterSetter(mainOps[0], mainOps[1], lens);
}

export function makeGetterSetter<Main, T>(t: Main, setter: Setter<Main>, lens: LensAndPath<Main, T>): GetterSetter<T> {
    return [lens.get(t) as T, (v) => {
        if (typeof v === 'function') {
            setter(main => lens.set(main, (v as (t: T) => T)(lens.get(main) as T)));
        } else {
            setter(lens.set(t, v));
        }
    }]
}