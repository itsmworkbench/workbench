# Epochal model of time
https://www.infoq.com/presentations/Are-We-There-Yet-Rich-Hickey/

This means that we can only mutate using functions. 

# The store can only be mutated by queue items 

These hold the functions that mutate the state. However they typically don't mutate the whole state, just the part
that the optics are focused on.

## SyncQueueItem

These are the simplest and most common. The function can be applied now, and the result used now. A
good example would be 'setValue' or 'increment value'. Sometimes the input is ignored.

The only time a `SyncQueueItem` can't be applied is if the 'purpose' of the store has changed. In the context
of the ITSM workbench this would occur of a ticket is loaded. Any user events after that would be ignored because they
would be for the old ticket. This type of thing is fairly common in a full page app and typically awkward to handle when 
things are processed in a time that isn't 'now'. But also typically we ignore it... Now we don't need to, but it's 
really a sideeffect of handling it for the async processing


## AsyncQueueItem

`AsyncQueueItem` is a queue item is focused on a part of the state.  

When that promise resolves... well the world may have changed. The place it is on may have changed. The 'main purpose' of
the store may have changed... For example we may be 'getting data about a ticket', but the ticket id may have changed. So
now we populate the gui with the old data. This would manifest as a rarely occuring glitch that would be difficult to track down

We have two protections:
* The sequence number. When we do a major change we increment the sequence number. If this is changed the result is ignored
* The focused on section. If that has changed we have options
  * We can retry (there is a count)
  * retrying executes the function again. So if there was (say) an id there, we would get the new one

Was this the right approach? It's modeled on Java Atomic Refs and Clojure refs. 

# Error handling

When errors occur errors are passed to a callback. 

# Why do we care about this queue stuff...

Because this state mutation with async is hard. Adding a queue decouples what is going to happen from when it's going to 
happen. We can make sure that we control precisely when the mutations happen... and reduce the effort of reasoning about
them
