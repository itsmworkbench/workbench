import {DisplayTicketSource, TicketSource} from '@itsmworkbench/ticketsource'
import React from 'react';

const DisplayCreateTicket:DisplayTicketSource<any> = ({onCreated, config}) => {
    return <div>
        <h1>Create Ticket</h1>
        <span>This is where we create the ticket</span>
    </div>
};
export const CreateTicketSource: TicketSource<any> ={
    description: 'We enter all the details about the ticket manually',
    config: {},
    Display: DisplayCreateTicket
}