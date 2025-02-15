import React, {useState} from "react";

import {makeWindowUrlData, WindowUrlContext, WindowUrlData} from "./path.name.provider";
import {Setter} from "../react_utils";

type WindowProviderForTestsProps = {
    children: React.ReactNode
    initialUrl: string
    changed?: (url: string) => void
}

export function WindowUrlProviderForTests({children, initialUrl, changed}: WindowProviderForTestsProps) {
    const windUrlData = makeWindowUrlData(initialUrl)
    const [getter, setter] = useState<WindowUrlData>(windUrlData)
    const setterWithCallback: Setter<WindowUrlData> = (value) => {
        const urlData = typeof value === 'function' ? value(getter) : value
        setter(urlData)
        changed?.(urlData.url.toString())
    }

    return <WindowUrlContext.Provider value={[getter, setterWithCallback]}>{children}</WindowUrlContext.Provider>
}