import {GetterSetter} from "@itsmworkbench/react_utils";
import {Ticket} from "@itsmworkbench/tickets";

export type TicketSourceProps<Config> = {
    config: Config
    ops: GetterSetter<Ticket>
}
export type DisplayTicketSource<Config> = (props: TicketSourceProps<Config>) => React.ReactNode

export type TicketSource<Config> = {
    name: string
    description: string
    config: Config
    Display: DisplayTicketSource<Config>
}