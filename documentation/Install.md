# Installation of source-miner

## prerequisites 

**node.js** must be installed on your system. check it:   

    node -v
    npm -v  

### windows, wsl, linux, macos

All installations are done the same way as any classical node's application.   

## install sources from github

Choose you installation folder and clone the repository from github in your way. Here SSH:    


    ~$ git@github.com:pirelaurent/source-miner.git


## install node dependencies

Install required packages listed in `package.json`:   

    npm install

Some users encountered issues with their company's repository manager.   

If ***some trouble***, reset to the default registry :`npm config set registry https://registry.npmjs.org/` then retry.   

## Test installation 

Running *search.mjs* without parameters must give an advice:   

    ~/source-miner$ node search.mjs
    *** must be run as :  node search.mjs probeFileName  '/regex/option/'   

Search with the probe sample that describe parts of this project: `node search.mjs probe.yaml`   
*Without regex on command line, it uses internal probe regex:* *'/file/i'*.   

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

### Test some other regex with command line    

To directely test regex, put one after the probe name in command line :  ` node search.mjs probe.yaml '/search/i' `     

## what's next 

Set  some *probe.yaml* to match your personal project files.    
Use *search* to analyze your source code with command line.    
Create ready to run other app for specific purposes with programming suggests.          
     
--- 

  [probe reference guide](probe.md)   
  [programming aspects](programming.md)     
  [master regex](regexHelp.md)     

