import {Ticket} from "@itsmworkbench/tickets";

export const hcl01347: Ticket = {
    id: "hcl01347",
    attributes: {
        id: "hcl01347",
        system: 'EPX',
        environment: 'production',
        issuer: 'phil.rice@validoc.org'
    },
    summary: 'Update price of discombobulator',
    description: `
Issue:
* In the epx the discombobulator (item code 1234-44) has an incorrect price.
* The prices is currently 55.55.
* The price should be 44.44.

Please update this price in the EPX production.`
}

export const hcl01348: Ticket = {
    id: "hcl01348",
    attributes: {
        id: "hcl01348",
        system: 'EPX',
        environment: 'acceptance',
        issuer: 'phil.rice@validoc.org'
    },
    summary: 'Change colour of button',
    description: `
* in the EPX acceptance environment the colour of the button is wrong. It should be blue and is red.
* The button has id but-blue-123

Action requested:
* Please change the colour of the button to blue    `
}

export const hcl01349: Ticket = {
    id: "hcl01349",
    attributes: {
        id: "hcl01349",
        system: 'Leo',
        environment: 'acceptance',
        issuer: 'phil.rice@validoc.org'
    },
    summary: 'Delete project P-6666',
    description: `
Issue:
  * I created a project (P-6666)
  * It is in the Leo acceptance environemnt by mistake.

Action requested:
 * Please delete this.`
}

export const mockTickets = {
    EPX: {
        hcl01347,
        hcl01348
    },
    Leo: {
        hcl01349
    }
}
