import {pathToLens} from "./lens.serialisation";

export type LensPathPart = string | number | ComposedPathPart;
export type ComposedPathPart = Record<string, LensPath>;


export type LensPath = LensPathPart[];
export type OpticsGetter<Main, Child> = (main: Main) => Child | undefined;
export type OpticsSetter<Main, Child> = (main: Main, child: Child) => Main;

export type LensAndPath<Main, Child> = {
    get: OpticsGetter<Main, Child>;
    set: OpticsSetter<Main, Child>;
    path: LensPath;
};

// Create an identity lens for a given object
export function identityLens<T>(): LensAndPath<T, T> {
    return {
        get: (main: T) => main, // Simply return the main object
        set: (main: T, child: T) => child, // Replace the main object with the child
        path: [] // Start with an empty LensPath
    };
}

// Create a lens that focuses on a specific child property in a larger object
export function child<Main, T, K extends keyof T>(
    lens: LensAndPath<Main, T>,
    key: K
): LensAndPath<Main, T[K]> {
    return {
        get: (main: Main) => lens.get(main)?.[key], // Get the child property
        set: (main: Main, child: T[K]) => {
            const parent = lens.get(main) || ({} as T); // Default parent to an empty object if undefined
            const updatedParent = {...parent, [key]: child}; // Create a new object with the updated child
            return lens.set(main, updatedParent as T); // Set the updated parent in the main object
        },
        path: [...lens.path, key as string] // Append key to the path
    };
}

// A function that allows us to focus on an array element at a specific index
export function index<Main, T>(
    lens: LensAndPath<Main, T>,
    idx: number
): T extends Array<infer U> ? LensAndPath<Main, U> : never {
    return {
        //@ts-ignore the typechecker doesn't know that T extends Array<infer U> here
        get: (main: Main) => lens.get(main)?.[idx], // Get the array element. The any is needed to satisfy the type checker
        set: (main: Main, child: any) => {
            const parent = lens.get(main) || []; // Default parent to an empty array if undefined
            const updatedParent = [...(parent as Array<any>)]; // Clone the array
            updatedParent[idx] = child; // Update the specific index
            return lens.set(main, updatedParent as T); // Set the updated array in the main object
        },
        path: [...lens.path, idx] // Append index to the path
    } as T extends Array<infer U> ? LensAndPath<Main, U> : never;
}

export function objectCompose<Main, T, Children extends Record<string, LensAndPath<T, any>>>(
    main: LensAndPath<Main, T>,
    children: Children
): LensAndPath<Main, { [K in keyof Children]: Children[K] extends LensAndPath<T, infer U> ? U : never }> {
    const structure: ComposedPathPart = {};
    for (const key in children) {
        structure[key] = children[key].path;
    }
    const path: LensPath = [...main.path, structure];
    return {
        get: (mainObj: Main) => {
            const parentValue = main.get(mainObj);
            if (parentValue === undefined) return undefined;
            const result = {} as { [K in keyof Children]: Children[K] extends LensAndPath<T, infer U> ? U : never };
            for (const key in children) {
                result[key] = children[key].get(parentValue);
            }
            return result;
        },
        set: (mainObj: Main, childValue: { [K in keyof Children]: Children[K] extends LensAndPath<T, infer U> ? U : never }) => {
            const parentValue = main.get(mainObj) || ({} as T);
            let updatedParent = {...parentValue};
            for (const key in children) {
                if (key in childValue) {
                    updatedParent = children[key].set(updatedParent, childValue[key]);
                }
            }
            return main.set(mainObj, updatedParent);
        },
        path
    };
}

export class LensBuilder<Main, Child> implements LensAndPath<Main, Child> {
    private _lens: LensAndPath<Main, Child>;

    constructor(lens: LensAndPath<Main, Child>) {
        this._lens = lens;
    }

    // Delegate `get` to the embedded `_lens`
    get(main: Main): Child | undefined { return this._lens.get(main); }

    // Delegate `set` to the embedded `_lens`
    set(main: Main, child: Child): Main { return this._lens.set(main, child); }

    map(fn: (child: Child | undefined) => Child) {
        return (main: Main) => this._lens.set(main, fn(this._lens.get(main)))
    }

    // Delegate `path` to the embedded `_lens`
    get path(): LensPath { return this._lens.path; }

    //Focus on a child property within the current lens focus
    focusOn<K extends keyof Child>(key: K): LensBuilder<Main, Child[K]> {
        return new LensBuilder(child(this._lens, key));
    }

    chain<Child2>(lens: LensAndPath<Child, Child2>): LensBuilder<Main, Child2> {
        return new LensBuilder({
            get: (main: Main) => {
                const child = this._lens.get(main);
                if (child === undefined) return undefined
                return lens.get(child);
            },
            set: (main: Main, child: Child2) => {
                const parent = this._lens.get(main) || ({} as Child);
                const updatedParent = lens.set(parent, child);
                return this._lens.set(main, updatedParent);
            },
            path: [...this._lens.path, ...lens.path]
        });
    }


    focusOnPath<T>(path: LensPath | string): LensBuilder<Main, T> {
        return this.chain(pathToLens(path))
    }

    // Focus on an array element within the current lens focus
    focusIndex(idx: number): Child extends Array<infer U> ? LensBuilder<Main, U> : never {
        return new LensBuilder(index(this._lens as any, idx)) as any;
    }

    /**
     * Composes child lenses into the current lens, creating a new lens focusing on a composed object.
     * @param children A record of child lenses focusing on properties of the current lens's target
     */
    focusCompose<Children extends Record<string, LensAndPath<Child, any>>>(
        children: Children
    ): LensBuilder<Main, { [K in keyof Children]: Children[K] extends LensAndPath<Child, infer U> ? U : never }> {
        const composedLens = objectCompose(this._lens, children);
        return new LensBuilder(composedLens);
    }

    focusOnPart<
        K extends keyof Child, // Key in the Child object (e.g., 'domain')
        SubKey extends keyof Child[K] // Key within the selected part (e.g., 'other')
    >(
        part: K, // The top-level part (e.g., 'domain')
        subPart: SubKey // The nested key within the part (e.g., 'other')
    ): LensBuilder<Main, { [P in keyof Child]: P extends K ? Child[K][SubKey] : Child[P] }> {
        const lastPath: ComposedPathPart = this._lens.path[this._lens.path.length - 1] as ComposedPathPart;
        if (!lastPath || typeof lastPath !== 'object') throw new Error('Invalid path for focusOnPart. Must focus on an objectComposed path.');
        const lastPathPart = lastPath[part as any];
        if (!lastPathPart || !Array.isArray(lastPathPart)) throw new Error(`Invalid part [${part.toString()}] for focusOnPart.`);
        const newLastPart: ComposedPathPart = {...lastPath, [subPart]: [...lastPathPart, subPart.toString()]};
        const path: LensPath = [...this._lens.path.slice(0, -1), newLastPart];
        const get = (main: Main) => {
            const parentValue = this._lens.get(main);
            const newValue = {...parentValue, [part]: parentValue?.[part]?.[subPart]};
            return newValue
        }
        const set = (main: Main, childValue: any) => {
            const parentValue = this._lens.get(main) || ({} as Child);
            const partValue = parentValue[part] || ({} as any);
            const newPartValue = {...partValue, [subPart]: childValue[part]};
            const updatedChildValue = {...childValue, [part]: newPartValue};
            return this._lens.set(main, updatedChildValue);
        }
        return new LensBuilder({get, set, path}) as any; // the typechecker is brutal here...
    }
    projectToGetter<NewChild>(purpose: string,mapper: (child: Child) => NewChild): LensBuilder<Main, NewChild> {
        const readOnlyLens: LensAndPath<Main, NewChild> = {
            get: (main: Main) => {
                const current = this._lens.get(main);
                return current === undefined ? undefined : mapper(current);
            },
            set: (_main: Main, _child: NewChild) => {
                throw new Error("This lens is read-only: setter is not available.");
            },
            path: [...this._lens.path,purpose]
        };
        return new LensBuilder(readOnlyLens);
    }


    // Return the built lens
    build() {
        return this._lens;
    }
}

// Helper function to start building a lens
export function lensBuilder<T, Child = T>(
    lens: LensAndPath<T, Child> = identityLens<T>() as unknown as LensAndPath<T, Child>
): LensBuilder<T, Child> {
    return new LensBuilder(lens);
}
