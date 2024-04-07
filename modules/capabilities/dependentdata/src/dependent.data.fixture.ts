import { NameAnd } from "@laoban/utils";
import { Lenses } from "@focuson/lens";
import { depData } from "./dep.data";

export type DepDataFortest = {
  params?: NameAnd<string>
  taskList?: string[]
  task?: string
  serviceList?: string[]
  service?: string
}
export const id = Lenses.identity<DepDataFortest> ( "I" )
export const paramsO = id.focusQuery ( 'params' )
export const taskListO = id.focusQuery ( 'taskList' )
export const taskO = id.focusQuery ( 'task' )
export const serviceListO = id.focusQuery ( 'serviceList' )
export const serviceO = id.focusQuery ( 'service' )

export const mockLoadParams = async (): Promise<NameAnd<string>> =>
  ({ geo: 'uk', product: 'aml', ch: 'web' })
export const mockLoadTaskList = async ( params: NameAnd<string> ): Promise<string[]> =>
  [ 'Task:' + Object.keys ( params ), 'Task:' + Object.values ( params ) ]
export const mockLoadServiceList = async ( params: NameAnd<string>, task: string ): Promise<string[]> =>
  [ 'Service:' + task + Object.keys ( params ), 'Service:' + task + Object.values ( params ) ]

export const paramDi = depData ( 'params', paramsO, { load: mockLoadParams } )
export const taskListDi = depData ( 'taskList', taskListO, paramDi, { load: mockLoadTaskList } )
export const taskDi = depData ( 'task', taskO, taskListDi, {} )
export const serviceListDi = depData ( 'serviceList', serviceListO, paramDi, taskDi, { load: mockLoadServiceList } )
export const serviceDi = depData ( 'service', serviceO, paramDi, taskDi, serviceListDi, {} )

export const allDi = [
  paramDi, taskListDi, taskDi, serviceListDi, serviceDi
]

