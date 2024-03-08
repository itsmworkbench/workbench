# Challenging to get right in a world with asynchronicity

Issues: when executing the events, other people might be messing with the data at the same time

This is a gui system after all. We don't want to stop the user in their tracks (probably). So things like
selection state and viewing are fine and they are editing the underlying object in a store

So what happens if we have

* the state store as a container.
* Only a queue listener can update it
    * Transformations on the queue (with guards)
    * This gives a lot of protection. Single threaded updates and very fast... Transformations are fast and not async
    * We can check the transformations for applicability before we apply them

Am I not just inventing refs? Because if so I should probably do them properly

* So with our epochal view of time...
    * On the queue we put
        * abort fn... i.e. abort if this becomes true
        * retry yes/no. For example selection state we probably don't want to retry... but usually we do
        * lens to the bit of the state we are interested
        * current value of the bit of the state we are interested in
        * fn that will transform the state
    * Then when we process the queue
        * We check the abort fn
        * We get the current value of the bit of the state we are interested in and compare it to the value in the queue
        * If they are the same we apply the transformation
        * If not we put this back on the queue with a retry flag

Hmmm

Queue Item<Main,Child> needs

* count: number // A countdown, when get to zero abort with error
* sequenceNumber: number // OK when we change significantly what we are doing, we change this. For example start looking
  at another ticket
* lens<Main,Child>
* startValue: Child
* fn: (Child) => Promise<Child>  here is the scary bit.

Pr



So what if we did everything by transforms with guards?

polling generates multiple transformations with guards that we through into the event store?

The guard ca