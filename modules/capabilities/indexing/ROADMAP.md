
# Current smelly areas

* A little tied to elastic search - but not too bad
   * Mostly in the data lake format.
   * And in the push
* A bit of a mess in how we do the indexing. The TC approach was too complex in idea and to use. 
* How we do 'all indexing'
* A load of the code for doing things is in the commands themselves
* The interaction of error handling and retry logic

# Goals
* Usage by people
  * Can do things as a library from other applications
  * Can do things as command line
  * Can be hooked into webhooks and things
  * A keep running mode maybe for those things that can't be webhooks.
* Handling things we index
  * It would be nice to have a plugin story. We are nearly there but the dependency injection isn't quite there
  * We want to handle the pipeline story better. That should have been built into the indexer.yaml instead of a separate file
  * Better / more consistant validation
  * Better understanding of what has failed to index
* Observability
  * Nicer logs and some control over these
  * Nicer metrics
* When it goes wrong
* Better data lake support
  * At the moment we just make the files.
  * Capping the size of the files..
  * Grouping by date to support better data management
  * Easier format (one line per item not two).

# Immediate goals
* Merge pipelines.yaml and indexer.yaml
* Add to it a new place for keeping track of search engines
  * i.e. give a name to elastic search dev, elastic search prod and same for pine cone
  * At this stage we still have separate bits of push code for elastic search and pinecone
  * Maybe wait for the  'rule of three' before we clean those up
* Validation of indexer.yaml
  * And make sure that's tied into the all-indexer story
* Better handling of errors during indexing

# Medium
* Logs/metrics

# Longer term
* data lake file management