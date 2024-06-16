import { Message } from "../domain/message";
import Markdown from "react-markdown";
import React from "react";

export const MarkdownMessage = ( { message }: { message: Message } ) => {
  const msg = message?.content || 'No content';
  try {
    console.log ( msg )
    return <Markdown>{msg}</Markdown>;
  } catch ( e: any ) {
    console.error ( 'Error rendering markdown', message, e );
    return <pre>{e}
      {JSON.stringify ( msg, null, 2 )}</pre>
  }
};
