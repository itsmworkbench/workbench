//Fixed length record in the directory file
//We use the three offsets to allow us not to do a lock on read...
//We read the three offsets, and then pick the two that are the same
//The offset that is different (if it exists) is the one that is being written to right now
//the process of updateing this record includes a file lock at the record level (the index)
//This data can safely be cached 'for a while': the offsets are only every increased and that's just an optimisation anyway
//making it inactive just means 'don't bother reading from this queue file' again just a performance optimisation
//If the file length sh
//
export type DirectoryFileRecord = {
  active: boolean
  filename: string // note may remove this... we can just go off the index after all. This is nice though because we can change it...
  offset1: number
  offset2: number
  offset3: number
}
export type  DirectoryFileData = {
  version: 1
  records: DirectoryFileRecord[]
}

//Start and recovering are identical: just different for audit purposes
export type WorkflowInstanceEventType = 'start' | 'finish' | 'unfinished' | 'recovering' //...maybe some others
//binary file, fixed length fields.
export type WorkflowInstanceEventRepresentation = {
  type: number //actually a  WorkflowInstanceEventType
  workflowId: number
  workflowInstanceId: number
  workerId: number
  time: number
}

export type WorkflowInstanceEvent = {
  type: WorkflowInstanceEventType
  workflowId: string
  workflowInstanceId: string
  workerId: string
}
//only ever appended to (filelock on append). It can safely be cached. When an unknown id is encountered we can load from the end
export type WorkflowInstanceIdFile = {
  version: 1
  filenames: string[]
}
//only ever appended to (filelock on append). as above
export type WorkflowIdFile = {
  version: 1
  filenames: string[]
}
//only ever appended to (filelock on append). as above
export type WorkerIdFile = {
  version: 1
  ids: string[]
}

//The file is a fixed length record file
//writing to it needs a file lock either because the old one crashed or because we 'handed it back' to the queue
//It exists so that we can finish half completed workflows. Either bec
//When a worker wants to start a new task it appends the details to the file. When finished it appends to the file. Note it doesn't need any reads for this...
//The file is immutable apart from appends

//The recovery process is more complex. But the file only needs to be read once per recovery thread.
//Scan from the offset building up the state of instances. Once an instance is finished we can forget it
//When we get to the end of the file if we have detected any unfinished we do the following
//Claim a file lock based on the workflow instance id
//read to the end of the file where we are (i.e. has anyone appended data to the file since we started reading it)
//check it still needs fixing
//append a 'I am fixing this' record to the file
//hand back the file lock
//usual rules about stale file locks apply i.e. if the file lock is too old we can claim it and if the time is high before we do the actual write we don't write
export type WorkflowInstanceFile = {
  version: 1
  events: WorkflowInstanceEventRepresentation[]
}