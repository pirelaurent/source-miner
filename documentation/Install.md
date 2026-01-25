# Installation of source-miner

## prerequisites 

**node.js** must be installed on your system. check it:

``` shell
node -v
npm -v  
``` 
### windows, wsl, linux, macos

All installations are done the same way as a classical nodes application

## install sources from github

Choose you installation folder: Installing at your home is a good place.   

Clone the repository from github in your way. Here SSH:  

``` shell
~$ git@github.com:pirelaurent/source-miner.git
``` 

## install node dependencies

Install required packages listed in `package.json`:

```bash
npm install
```

Some users encountered issues with their company's repository manager.

If ***some trouble***, reset to the default registry, then retry. 

    npm config set registry https://registry.npmjs.org/


## test installation 

running *search.mjs* without parameters must give an advice on how to run  


    ~/source-miner$ node search.mjs
    *** must be run as :  node search.mjs probeFileName  '/regex/option/'


Run search with the descriptor that match the project itself: *autoProbe.yaml* 

    node search.mjs ./probes/autoProbe.yaml 

Without regex on the command line, this will use default regex in probe : *'/where is Charlie/g'*

### Results (at redaction time) 


    ------------------------------- probe parameters -------------------------------
    : roots: [./] x [explore,probes]
    : regex: '/where is Charlie/gm'  -per line  -comment skipped"
    : extensions:[.js,.ts,.mjs,.yaml]
    --------------------------------------------------------------------------------
    --------------           start exploration of :/explore           --------------
    --------------           start exploration of :/probes           ---------------
    -------           end of exploration of group [explore,probes]           -------
    :     matching files: 17 / 17 from 3 / 3 directories
    :     matching lines: 2 / 2 331 for 2 match: '/where is Charlie/gm'
    :     parsed lines: 1 351 empty: 420  comments: 560 (ignored)
    --------------------------- Time elapsed :  0s 26ms  ---------------------------


### Tests other regex on the command line  

    node search.mjs ./probes/autoProbe '/file/i'
    
or in verbose detailed regex

    node search.mjs ./probes/autoProbe '{"pattern":"file","flags":"i"}'


Your installation is working.   

### performance with/without comments'filter

A scan on a very large project gives the following timing:

#### full text : *ignoreComments: off*  

    :     matching files: 12748 / 12750 from 2072 / 2148 directories
    :     found 133443 match
    -------------------------- Time elapsed :  0s 855ms  ---------------------------


#### costly : removing comments from search : *ignoreComments: on*

    :     matching files: 12748 / 12750 from 2072 / 2148 directories
    :     found 133443 match
    :     parsed lines: 1 471 296 matching: 133443 / 2366950 empty: 362 665  comments: 532 989 (ignored)
    -------------------------- Time elapsed :  5s 145ms  ---------------------------


## what' next 

Adapt a *probe.yaml* to match your project files.
Use *search* to quickly query your source code with differents regex. 
Have a look at [mastering regex](./regexHelp.md)  
Uses and study ***searchInJava.mjs*** in *samples* that combines several search. 



