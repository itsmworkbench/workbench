import {CreateTicketSource} from "@itsmworkbench/create_ticketsource";
import {MockServiceConfig, MockTicketSource} from "@itsmworkbench/mock_ticketsource";


export function AllTicketSources(data: MockServiceConfig) {
    return {
        serviceNow: MockTicketSource('Service Now', data),
        manualTicket: CreateTicketSource,
        // azureDevOps: MockTicketSource('Azure DevOps', data),
    }
}