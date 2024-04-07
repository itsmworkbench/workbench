import { mockLoadParams, mockLoadServiceList, mockLoadTaskList, paramDi, paramsO, serviceDi, serviceListDi, serviceListO, serviceO, taskDi, taskListDi, taskListO } from "./dependent.data.fixture";
import { defaultHash } from "./dep.data";

describe ( 'Dependent Data dsl', () => {
  it ( 'should create a zero dependencies correctly', async () => {
    expect ( paramDi ).toEqual ( {
      name: 'params',
      hashFn: defaultHash,
      dependsOn: {
        root: true,
        load: mockLoadParams
      },
      optional: paramsO
    } )
  } )

  it ( 'should create a one dependency correctly', async () => {
    expect ( taskListDi ).toEqual ( {
      name: 'taskList',
      hashFn: defaultHash,
      dependsOn: {
        dependentOn: paramDi,
        load: mockLoadTaskList
      },
      optional: taskListO
    } )
  } )
  it ( 'should create a two dependencies correctly', async () => {
    expect ( serviceListDi ).toEqual ( {
      name: 'serviceList',
      hashFn: defaultHash,
      dependsOn: {
        dependentOn1: paramDi,
        dependentOn2: taskDi,
        load: mockLoadServiceList
      },
      optional: serviceListO
    } )
  } )
  it ( 'should create a three dependencies correctly', async () => {
    expect ( serviceDi ).toEqual ( {
      name: 'service',
      hashFn: defaultHash,
      dependsOn: {
        dependentOn1: paramDi,
        dependentOn2: taskDi,
        dependentOn3: serviceListDi
      },
      optional: serviceO
    } )
  } )
} )


