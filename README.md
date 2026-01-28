# source-miner

Extensible scanner to extract information from modular codebases

## Digging into large source projects

This tool scans multiple independent root directories in a single run, with fine-grained filtering at both directory and file levels, enabling cross-repository or cross-module searches that are not constrained to a single project hierarchy like an IDE.   

The search and collect relies on standard regular expressions applied to a set of source files.   

### Probe 

A probe is a YAML file that defines and drives a scan.   
Below is a simple `probe.yaml` file to scan the source-miner project itself:   
You can run it using internal regex.   

    node search.mjs probe.yaml 

Or give any regex on command line.  

    node search.mjs probe.yaml '/Charlie/' 

#### probe.yaml
It describe source-miner project itself : 


    commonOrigin: './'

    rootsToExplore: 
      - 'explore'
      - 'probes'
      - 'samples'
    
    keepExtension:
      includes: 
        - '.mjs'
        - '.yaml'

    regex:  
      pattern: '/file/'
      flags: i

    # output
    rank_key: on

#### synthetic report  

    --------------------------------------------------------------------------------   
    :     matching files: 14/17 from 4/4 directories
    :     found 227 regex:   '/file/gim'
    :     parsed lines: 1 971 matching: 184/2461 empty: 490  comments: 0 (not filtered)
    --------------------------- Time elapsed :  0s 15ms  ---------------------------

> All detailed results   
> - can be displayed on the fly   
> - are synthetised in tables at the end   
> - are available in a collection to the caller.    


## Source miner is fast 

  - optimized for fast regex.   
  - configurable to parallelize roots scan.    

###  Performance test: 

#####  11654 sources scanned `full text` in 0s 738ms from a real java project.  

    --------------------------------------------------------------------------------
        pirla@Mac samples % node search.mjs searchInJava /import/
    ------------------------------- probe parameters -------------------------------
    : roots: [~//dev/bigData/mySandBox/] x [backend]
    : regex: '/import/gm'  (plain source)
    : skip dir if: includes:[test,generated]  notIncludes:[]
    : extensions:[.java]
    --------------------------------------------------------------------------------
    :---------------      end of exploration of group [backend]      ---------------
    :     matching files: 11654/12818 from 2135/2213 directories
    :     found 125367 regex:   '/import/gm'
    :     parsed lines: 2 021 282 matching: 125133/2372980 empty: 351698  comments: 0 (not filtered)
    -------------------------- Time elapsed :  0s 657ms  ---------------------------
 
You can scan the source as is, or choose only pure code or only comments.   
Mind the overhead x5 to split code and comments:   

#####   11648 sources scanned `search.comments: off` in 5s 08ms

    :---------------      end of exploration of group [backend]      ---------------
    :     matching files: 11648/12818 from 2135/2213 directories
    :     found 124676 regex:   '/import/gm'
    :     parsed lines: 955 252 matching: 124461/2372980 empty: 883923  comments: 533 805 (ignored)
    --------------------------- Time elapsed :  5s 08ms  ---------------------------


---   
# source-miner 
  [install](./documentation/Install.md)     
  [probe reference guide](./documentation/probe.md)   
  [programming aspects](./documentation/programming.md)     
  [master regex](./documentation/regexHelp.md)     
