import {GetterSetter, makeContextFor} from "@itsmworkbench/react_utils";
import {Ticket} from "@itsmworkbench/tickets";
import {NameAnd} from "@itsmworkbench/utils";

export type TicketSourceProps<Config> = {
    config: Config
    systemName: string
    onCreated: (ticket: Ticket) => void
}
export type DisplayTicketSource<Config> = (props: TicketSourceProps<Config>) => React.ReactNode

export type TicketSource<Config> = {
    description: string
    config: Config
    Display: DisplayTicketSource<Config>
}

export type TicketSources = NameAnd<TicketSource<any>>
export const {use: useTicketSources, Provider: TicketSourceProvider} = makeContextFor<TicketSources, 'ticketSource'>('ticketSource');