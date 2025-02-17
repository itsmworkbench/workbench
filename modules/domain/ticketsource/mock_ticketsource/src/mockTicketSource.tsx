import {DisplayTicketSource, TicketSource} from '@itsmworkbench/ticketsource'
import React from 'react';
import {ellipsesInMiddle, NameAnd} from "@itsmworkbench/utils";
import {Ticket} from "@itsmworkbench/tickets";
import {useCommonComponents} from "@itsmworkbench/common_components";

const DisplayMockTicketSource: DisplayTicketSource<MockServiceConfig> = ({config, systemName, onCreated}) => {
    const {Table} = useCommonComponents()
    const titles = ['id', 'summary']
    const keys = ['id', 'summary']
    const rawData = config[systemName] || {}
    const tableData = Object.keys(rawData).map(k => ({id: k, summary: ellipsesInMiddle(rawData[k].summary, 50)}))
    const onRowSelect = (tableData: any) => onCreated?.(rawData[tableData.id])
    return <Table titles={titles} keys={keys} data={tableData} noWrap={['id']} onRowSelect={onRowSelect}/>
};

export type MockServiceConfig = NameAnd<NameAnd<Ticket>>

export function MockTicketSource(name: string, config: NameAnd<NameAnd<Ticket>>): TicketSource<MockServiceConfig> {
    return {
        description: `A link to the company's ${name}`,
        config,
        Display: DisplayMockTicketSource
    }
}