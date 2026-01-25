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

        pirla@Mac source-miner % node search.mjs ./probes/autoprobe.yaml '/file/i'
        ------------------------------- probe parameters -------------------------------
        : roots: [./] x [explore,test,samples,probes]
        : regex: '/file/gim'  (comments ignored)
        : extensions:[.mjs,.yaml]
        --------------------------------------------------------------------------------
        run sequential
        :-----      end of exploration of group [explore,test,samples,probes]      -----
        :     matching files: 17 / 21 from 5 / 5 directories
        :     found 253 regex:   '/file/gim'
        :     parsed lines: 2 670 matching: 206 / 2670 empty: 0  comments: 0 (not filtered)
        --------------------------- Time elapsed :  0s 13ms  ---------------------------


### you can test your regex with command line 

    node search.mjs ./probes/autoProbe '/Charlie/'

Your installation is working.   

### ignoreComments

By default ***off*** (don't ignore comments), when ***on***, comments are removed from source codes before the search.

#### Performance difference : 5 times 

 *ignoreComments: off*  on a large project : 
    --------------------------------------------------------------------------------
    :     matching files: 12748 / 12750 from 2072 / 2148 directories
    :     found 133443 match
    -------------------------- Time elapsed :  0s 855ms  ---------------------------


####  *ignoreComments: on* 
    --------------------------------------------------------------------------------
    :     matching files: 12748 / 12750 from 2072 / 2148 directories
    :     found 133222 match
    :     parsed lines: 1 471 296 matching: 133222 / 2366950 empty: 362 665  comments: 532 989 (ignored)
    -------------------------- Time elapsed :  5s 145ms  ---------------------------

## what's next 

Set a *probe.yaml* to match your project files.    
Use *search* to quickly query your source code with differents regex.            
    

--- 

  [probe parameters](probe.md)   
  [programming aspects](programming.md)     
  [master regex](regexHelp.md)     

