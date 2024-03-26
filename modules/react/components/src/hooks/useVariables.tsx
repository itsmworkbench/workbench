import { useEnrichedEvents } from "./useEnrichedEvents";
import { EnrichedEvent } from "@itsmworkbench/events";
import { Ticket } from "@itsmworkbench/tickets";
import { deepCombineTwoObjects } from "@laoban/utils";


export function useVariables (): any {
  const events: EnrichedEvent<any, any>[] = useEnrichedEvents ()
  // return events;
  const filtered = events.filter ( e => e?.context?.data?.attributes )
  // return filtered
  const found = filtered.length === 0 ? {} : filtered[ filtered.length - 1 ].context.data.attributes
  return found;
}

export function useAllVariables ( ticket: Ticket | undefined ): any {
  const vars = useVariables ()
  return deepCombineTwoObjects ( ticket?.attributes || {}, vars )
}
