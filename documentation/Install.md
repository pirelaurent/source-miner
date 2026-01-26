# Installation of source-miner

## prerequisites 

**node.js** must be installed on your system. check it:

    node -v
    npm -v  

### windows, wsl, linux, macos

All installations are done the same way as a classical nodes application

## install sources from github

Choose you installation folder: Installing at your home is a good place.   

Clone the repository from github in your way. Here SSH:  


    ~$ git@github.com:pirelaurent/source-miner.git


## install node dependencies

Install required packages listed in `package.json`:

    npm install

Some users encountered issues with their company's repository manager.

If ***some trouble***, reset to the default registry, then retry. 

    npm config set registry https://registry.npmjs.org/


## Test installation 

Running *search.mjs* without parameters must give an advice:  

    ~/source-miner$ node search.mjs
    *** must be run as :  node search.mjs probeFileName  '/regex/option/'   

Search with the probe that describe this project itself: `node search.mjs probe.yaml`   
*Without regex on command line, it uses internal probe regex:* *'/where is Charlie/'*.  

### you can test your regex with command line    

To set your own regex, put it after the probe name :  ` node search.mjs probe.yaml '/file/i' `   

#### Results  

        pirla@Mac source-miner % node search.mjs probe.yaml /file/i
        ------------------------------- probe parameters -------------------------------
        : roots: [./] x [explore,test,samples,probes]
        : regex: '/file/gim'  (comments ignored)
        : extensions:[.mjs,.yaml]
        --------------------------------------------------------------------------------
        run sequential
        :-----      end of exploration of group [explore,test,samples,probes]      -----
        :     matching files: 16 / 20 from 5 / 5 directories
        :     found 246 regex:   '/file/gim'
        :     parsed lines: 2 095 matching: 200 / 2616 empty: 521  comments: 0 (not filtered)
        --------------------------- Time elapsed :  0s 13ms  ---------------------------

Your installation is working.   

## what's next 

Set a *probe.yaml* to match your project files.    
Use *search* to analyze your source code with regex.            
     
--- 

  [probe reference guide](probe.md)   
  [programming aspects](programming.md)     
  [master regex](regexHelp.md)     

