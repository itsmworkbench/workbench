import {  RawIndexConfig } from "@itsmworkbench/indexconfig";
import { configDefaults } from "@itsmworkbench/indexing";

export const indexConfigExample: RawIndexConfig = {
  defaults: configDefaults,
  index: {
    github: {
      query: { throttle: { max: 1000 } },
      scan: {
        organisations: [  'run-book' ],
        users: [ 'phil-rice-HCL' ],
        indexPeople: true,
        //note extensions of md will be defaulted in, as will the url of api.github.com
      }
    },
  }
}