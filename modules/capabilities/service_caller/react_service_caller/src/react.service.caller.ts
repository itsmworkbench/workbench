import {makeContextFor} from "@itsmworkbench/react_utils";
import {ServiceCaller} from "@itsmworkbench/service_caller";

export const {use: useServiceCaller, Provider: ServiceCallerProvider} = makeContextFor<ServiceCaller, 'serviceCaller'>('serviceCaller')