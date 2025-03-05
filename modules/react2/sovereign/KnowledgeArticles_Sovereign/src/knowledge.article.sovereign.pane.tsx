import {makeSovereignStatePlugin} from "@itsmworkbench/sovereign";
import React, {useEffect, useState} from "react";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useSystems} from "@itsmworkbench/system";
import {useUrlStore} from "@itsmworkbench/reacturlstore";
import {findKaDetails, KADetails,} from "@itsmworkbench/knowledgearticle";
import {ErrorsOr, isErrors} from "@itsmworkbench/errors";
import {DisplayKads} from "@itsmworkbench/react_knowledgearticle";


export type KnowledgeArticlesProps = {
    org: string
    system: string

}


export function KnowledgeArticles({org, system}: KnowledgeArticlesProps) {
    const urlStore = useUrlStore()
    const {Table} = useCommonComponents()
    const [details, setDetails] = useState<ErrorsOr<KADetails[]> | undefined>(undefined)
    const selectedRowOps = useState(-1)
    const kaOps = useState<KADetails | undefined>()
    const [ka, setKa] = kaOps
    useEffect(() => {
        setKa(undefined)
        findKaDetails({urlStore, org, system}).then(d => setDetails(d))
    }, [org, system])
    if (isErrors(details)) return <div>{details.errors.join('\n')}</div>
    return <div>
        <p>table of knowledge articles {system}</p>
        <Table titles={['Name', 'Description']} keys={['name', 'descriptionOrError']} data={details ? details.value : []} selectedRowOps={selectedRowOps} onRowSelect={(row, index) => {
            setKa(row)
        }}/>
         <DisplayKads selectedKadOps={kaOps}/>
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
        <KnowledgeArticles org={org} system={system}/>
    </div>

}

export const KnowledgeArticleSovereignPagePlugin = makeSovereignStatePlugin(KnowledgeArticlesSovereignPage)

