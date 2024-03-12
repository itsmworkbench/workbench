export interface WelcomeProps {
  count: number | undefined
}

export function Welcome ( { count }: WelcomeProps ) {
  return <div>

    <p>Welcome to the ITSM Workbench</p>

    <p>To the left is a menu</p>

    {(count === undefined || count === 0) && <p>You need to select 'New Ticket' to work with a ticket</p>}
    {(count || 0) > 0 && <p>You can select a ticket that you have already started to work on, or click 'New Ticket' to work with a new one</p>}

    <p>When you type into the chat below, it connects you to an AI or a person that can help you with the ticket</p>

  </div>
}