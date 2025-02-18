import {makeSovereignStatePlugin} from "@itsmworkbench/sovereign";
import React, {useEffect, useState} from "react";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useSystems} from "@itsmworkbench/system";
import {findKaDetails, KADetails, useUrlStore} from "@itsmworkbench/reacturlstore";
import {ErrorsOr, isErrors} from "@itsmworkbench/errors";


export type KnowledgeArticlesProps = {
    org: string
    system: string

}


export function KnowledgeArticles({org, system}: KnowledgeArticlesProps) {
    const urlStore = useUrlStore()
    const {Table} = useCommonComponents()
    const [details, setDetails] = useState<ErrorsOr<KADetails[]> | undefined>(undefined)
    const [index, setIndex] = useState(0)
    const [ka, setKa] = useState<KADetails | undefined>()
    useEffect(() => {
        setKa(undefined)
        findKaDetails(urlStore, org, system).then(d => setDetails(d))
    }, [org, system])
    if (isErrors(details)) return <div>{details.errors.join('\n')}</div>
    return <div>
        <p>table of knowledge articles {system}</p>
        <Table titles={['Name', 'Description']} keys={['name', 'descriptionOrError']} data={details?details.value:[]} onRowSelect={(row, index) => {
            setIndex(index)
            setKa(row)
        }}/>
        <pre>{JSON.stringify(ka, null, 2)}</pre>
    </div>
}

export function KnowledgeArticlesSovereignPage() {
    const {NavPanelLayout, NavPanel} = useCommonComponents()
    const systems = useSystems()
    const systemOps = useState(Object.keys(systems)[0])
    const [system] = systemOps
    let org = 'me';
    return <div>
        <NavPanelLayout>{Object.entries(systems).map(([name, system]) =>
            <NavPanel key={name} size='small' name={name} description={system.description} ops={systemOps}/>)}</NavPanelLayout>
        <KnowledgeArticles org={org} system={system} />
    </div>

}

export const KnowledgeArticleSovereignPagePlugin = makeSovereignStatePlugin(KnowledgeArticlesSovereignPage)

