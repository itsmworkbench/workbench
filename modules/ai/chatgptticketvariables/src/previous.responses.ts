export const previousResponses = [
        {
            role: 'user',
            content: `Ticket PA123
============
P4
Customer: a.customer@example.com

Issue:
 * I created a project (P-6666)
 * It is in the EPX acceptance by mistake.

Action requested:
* Please delete this.

Thanks`},
        {
            role: 'assistant',
            content: ` 
{"ticketId": "PA123",
"projectId": "P-6666",
"System: "EPX",
"Environment": "acceptance"}`
        },
        {
            role: 'user',
            content: `Ticket price44
==============
P4
Customer: a.customer@example.com

Issue:
* In the EPX the discombobulator (item code 1234-44) has an incorrect price.
* The price is currently 55.55.
* The price should be 44.44.

Please update the price of the discombobulator`
        },
        {
            role: 'assistant',
            content: `
{"ticketId": "price44",
"Customer": "a.customer@example.com",
"itemId": "1234-44",
"itemName": "discombobulator"}`
        },
        {
            role: 'user',
            content: `Ticket SR5542
=============
Ticket colour
P4
Customer: bob.grey@thecompany.co.

Issue:
* In the DSS production environment, the colour of the button is wrong. It should be blue and is red.
* The button is button id but-blue-123.

Action requested:
* Please change the colour of the button.

Thanks`
        },
        {
            role: 'assistant',
            content: `{"itemId": "but-blue-123",
"itemName: "button",
"newColour": "blue",
"oldColour": "red",
"system": "DSS",
"environment": "production"}`
        }];
