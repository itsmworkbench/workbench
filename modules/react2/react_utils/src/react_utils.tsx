import React, {Context, Dispatch, ReactElement, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState} from "react";
import {LensAndPath, lensBuilder, LensBuilder} from "@itsmworkbench/optics";
import {makeGetterSetter} from "./make.getter.setter";
import {uppercaseFirstLetter} from "@itsmworkbench/utils";
import {useThrowError} from "./react.report.error";

export type Setter<T> = Dispatch<SetStateAction<T>>
export type GetterSetter<T> = [T, Setter<T>]


export type ContextResults<Data, FIELD extends string> = {
    use: () => Data
    Provider: (props: { children: ReactNode } & Record<FIELD, Data>) => ReactElement
    context: Context<Data | undefined>
}

export function makeContextFor<Data, FIELD extends string>(
    field: FIELD,
    defaultValue?: Data
): ContextResults<Data, FIELD> {
    // Create the context dynamically
    const context = React.createContext<Data | undefined>(defaultValue);


    function useField(): Data {
        const contextValue = useContext(context);
        const reportError = useThrowError();
        if (contextValue === undefined) {
            const upperedName = uppercaseFirstLetter(field);
            return reportError('s/w', `use${upperedName} must be used within a ${upperedName}Provider`);
        }
        return contextValue!;
    }

    type ProviderProps = { children: ReactNode } & Record<FIELD, Data>;

    // Provider component dynamically named like `${field}Provider`
    function FIELDProvider(props: ProviderProps) {
        return <context.Provider value={props[field]}>{props.children}</context.Provider>;
    }

    // Return context, hook, and provider with dynamic names
    return {use: useField, Provider: FIELDProvider, context};
}

export type ContextResultsForWriteThroughCache<Data, FIELD extends string> = {
    use: () => GetterSetter<Data | undefined>
    Provider: (props: { children: ReactNode } & Record<FIELD, Data>) => ReactNode
    context: Context<GetterSetter<Data> | undefined>
}

export type LoadFn<Data> = () => Promise<Data>
export type SaveFn<Data> = (data: Data) => Promise<void>

export function makeContextForCacheWriteThrough<Data, FIELD extends string>(field: FIELD, load: LoadFn<Data>, save: SaveFn<Data>): ContextResultsForWriteThroughCache<Data, FIELD> {

    const Context = React.createContext<GetterSetter<Data | undefined> | undefined>(undefined);

    function useField(): GetterSetter<Data> {
        const ops = useContext(Context);
        const throwError = useThrowError()
        if (ops === undefined) return throwError('s/w', `use${uppercaseFirstLetter(field)} must be used within a ${uppercaseFirstLetter(field)}Provider`);
        return ops
    }

    function FieldProvider({children}: { children: React.ReactNode }) {
        const [value, setValue] = useState<Data | undefined>(undefined);

        // Load initial value once on mount
        useEffect(() => {
            load()
                .then(setValue)
                .catch(console.error);
        }, []);

        const realSetValue: Setter<Data> = async (newValue: SetStateAction<Data>) => {
            setValue((prev) => {
                const resolvedValue =
                    typeof newValue === "function" ? (newValue as (prev: Data | undefined) => Data)(prev) : newValue;
                save(resolvedValue).catch(console.error);
                return resolvedValue;
            });
        };
        const ops: GetterSetter<Data | undefined> = useMemo(() => [value, realSetValue], [value]);

        return <Context.Provider value={ops}>{children}</Context.Provider>;
    }

    return {use: useField, Provider: FieldProvider, context: Context};
}


export type ContextResultsForState<Data, FIELD extends string> = {
    use: () => GetterSetter<Data>
    Provider: (props: { children: ReactNode } & Record<FIELD, Data>) => ReactNode
    context: Context<GetterSetter<Data> | undefined>
}

export function makeContextForState<Data, FIELD extends string>(field: FIELD): ContextResultsForState<Data, FIELD> {
    const Context = React.createContext<GetterSetter<Data> | undefined>(undefined);


    function useField() {
        const contextValue = useContext(Context);
        const reportError = useThrowError();
        if (contextValue === undefined) {
            const fieldWithCap = uppercaseFirstLetter(field);
            reportError('s/w', `use${fieldWithCap} must be used within a ${fieldWithCap}Provider`);
        }
        return contextValue!
    }


    type ProviderProps = { children: ReactNode } & Record<FIELD, Data>;

    function FieldProvider(props: ProviderProps) {
        const getterSetter = useState<Data>(props[field]);
        return <Context.Provider value={getterSetter}>{props.children}</Context.Provider>;
    }

    return {use: useField, Provider: FieldProvider, context: Context};
}

export function makeUseStateChild<Data, Child>(
    parent: () => GetterSetter<Data>,
    lens: (id: LensBuilder<Data, Data>) => LensAndPath<Data, Child>,
    debugName?: boolean
): () => GetterSetter<Child> {

    return () => {
        const [value, setValue] = parent(); // This is `useField()` behind the scenes
        return useMemo(() => {
            if (debugName) console.log(debugName, 'makeUseStateChild', value, setValue, lens)
            return makeGetterSetter(value, setValue, lens(lensBuilder()));
        }, [value, setValue, lens]); // lens might be stable or not, depends on usage
    };
}



