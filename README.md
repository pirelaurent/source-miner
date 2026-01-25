# source-miner

Extensible scanner to extract information from modular codebases

## digging into large source projects

This tool scans multiple independent root directories in a single run, with fine-grained filtering at both directory and file levels, enabling cross-repository or cross-module searches that are not constrained to a single project hierarchy like an IDE.

The search and collect relies on standard regular expressions applied to a set of source files.

### Probe 

A probe is a YAML file that defines and drives a scan.
Below is a simple `probe.yaml` file to scan the source-miner project itself:
You can run it using internal regex.   

    node search.mjs probe.yaml 

Or give any regex on command line.  

    node search.mjs probe.yaml '/^command/i' 

#### probe.yaml

```yaml
commonOrigin: './'

rootsToExplore: 
  - 'explore'
  - 'probes'
  - 'samples'
 
keepExtension:
  includes: 
    - '.mjs'
    - '.yaml'

ignoreComments: on
    
regex: 
  pattern: '/file/'
  flags: i

rank_key: on
rank_key_path: off
rank_key_path_line: off
```
#### global report  

      ---           end of exploration of group [explore,probes,samples]           ---
      :     matching files: 12 / 17 from 4 / 4 directories
      :     found 164 match: '/file/gim
      :     parsed lines: 1 277 matching: 133 / 2292 empty: 436  comments: 579 (ignored)

#### rank_key:
      ------------------------ Global : total number of key   ------------------------
      Nb	key
      87	File
      60	file
      20	FILE
      ---------------------------------- END OF RUN ----------------------------------

## source miner is fast 
  - optimized for fast regex.
  - configurable to parallelize roots scan. 

####  perf test on a large project : 12750 sources scanned in 0s 773ms

      pirla@Mac source-miner % node search.mjs ./samples/searchLarge.yaml '/import'/
      ------------------------------- probe parameters -------------------------------
      : roots: [~//dev/bigData/myProject/backend/] x [modules,controllers,mobile]
      : regex: '/import/gm' 
      : skip dir if: includes:[test,generated]  notIncludes:[]
      : extensions:[.java]
      --------------------------------------------------------------------------------
                end of exploration of group [modules,controllers,mobile]
      :     matching files: 11587 / 12750 from 2072 / 2148 directories
      :     found 124443 match: '/import/gm'
      -------------------------- Time elapsed :  0s 773ms  ---------------------------
      ---------------------------------- END OF RUN ----------------------------------

> All detailed results 
> - can be displayed on the fly 
> - are available in a collection at the end of run.  
---   
# source-miner 
  [install](./documentation/Install.md)    
  [probe parameters](./documentation/probe.md)
  [programming aspects](./documentation/programming.md)
  [master regex](./documentation/regexHelp.md)  
