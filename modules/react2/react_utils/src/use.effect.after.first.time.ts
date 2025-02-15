import { useEffect, useState, EffectCallback, DependencyList } from "react";
import { useThrowError } from "./react.report.error";

export function useEffectAfterFirstTime(
    block: EffectCallback,
    dependencies: DependencyList = []
) {
    const [hasRun, setHasRun] = useState(false);
    const throwError = useThrowError();

    useEffect(() => {
        if (!hasRun) {
            if (dependencies.length === 0) {
                throwError('s/w', 'useEffectAfterFirstTime must have dependencies');
                return;
            }
            setHasRun(true);  // Mark as run after the first render
            return;
        }
        return block();  // Return the cleanup function if block provides one
    }, dependencies);
}
