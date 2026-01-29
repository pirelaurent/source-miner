# Probe reference guide 

##  Defaults values 

Defaults values are set by internal code and are reflected into *modelProbe.yaml* as a reference baseline.    
In your probes, you can give only what's important for your scan: if some parameters are missing, defaults applies.      
Below are the default's explanation.     

### Starting directories 

    commonOrigin: './'
    rootsToExplore: [ ]
    fullPathFromOs: off 
   
- *commonOrigin*: './'
    - Defines the base directory for the scan.
    - Any relative entry in following parameter *rootsToExplore* is resolved from this path/
    - Paths starting with ~, ~/, or ~/somePath are resolved to the user home directory (HOMEDIR) on macOS, Linux, and Windows.
    - For independent modules or projects, set *commonOrigin* to their highest common level, and list each module’s relative path in *rootsToExplore*.   
-	*rootsToExplore*: []
    - if empty: scans all subdirectories under commonOrigin.
    - Non-empty: scans only the listed directories, each expressed as a path relative to commonOrigin. 

Relative or exact path names in output:      

- *fullPathFromOs*: off
    - Paths are displayed relative to *commonOrigin*.  
    - When set to on, paths are displayed as full absolute paths from the OS root (useful for opening files directly in an editor from any location).

#### Sample   

    commonOrigin: '~/github/projects/'
    rootsToExplore: ['/sales/backend','sales/frontend/V2','research/aero/test']

### Filters 


    skipDirIfName:
      includes: [ ]
      notIncludes:  [ ] 

    skipFileIfName:
      includes: [ ]
      notIncludes: [ ]


Behavior and rationale:   
- Filters allow regex or simple names
-	Filters are applied to the full path, not only to the last path segment.
-	An empty *notIncludes* list disables the corresponding exclusion rule entirely.
  -	to parse exclusively a few files , set their names in *notIncludes* to reject all others

Why full paths are used in filters (especially for files):   
- File names alone are not sufficient: 
    The same file name may legitimately exist in multiple directories.
    Using the full path avoids ambiguities and allows precise filtering.
- As a consequence, patterns in *includes / notIncludes* may also match directory names appearing in the path.
    Filters should therefore be written carefully to avoid unintended matches.

#### sample   

    skipDirIfName:
      includes: ['sales.*/perf','/V2/generated','jaxb' ]
    skipFileIfName:
      includes: ['test' ]


### file extension 

    keepExtension:
      includes: ['.java','.mjs','.yaml']  # json notation

Or a more convenient yaml syntax allows to quickly change config using comments:   

    keepExtension:
      includes: 
        #- '.java'
        - '.mjs'
        #- '.yaml'


#### Some trace options to debug filters on dir and files 

    traceSelectedDir: off  
    traceRejectedDir: off
    traceSelectedFile: off
    traceRejectedFile: off
 
### regex

One can set a default Regex in the probe :   
Two notations are accepted:    

    regex:
      pattern: '/where is Charlie/'
      flags: 'gm'.  
    # on a unique line :
    regex: '/where is Charlie/gm'


-	flags
	- g (global): finds all matches (not just the first one).
	- i (ignoreCase): case-insensitive matching.
	- m (multiline): can find a regex crossing lines

#### Source-miner choice : **gm** flags will be automatically enforced by *source-miner*.   

### Search perimeter   

By default the search goes full text.     

    search:
      code: on     # search in code 
      comments: on # search in comment



- with one option **off**, source is parsed in order to split code and comments. 
  - comments are :     
    - comment lines, according to the file extension    
    - inline comment parts from lines   
    - if a line has comment *comment_lines* counter is increased.
  - code is : 
    - the remaining when comments are removed 
       
These options are useful to analyse and avoid noise in code search results.     

#### languages'profiles 

Source-miner has profiles to exclude comments on demand for the following extensions:    

    ['c','h','cpp','hpp','rust','go','java','kt','js','mjs','ts','cs','sql','yaml','yml','sh','bash','zsh','md']
 

>Filtering comments is approximately 5× more expensive than a plain search but rather fast.   
>Notice that with a plain search, comment lines count is not available.   

### Output on the fly

    traceMatchingLines: off
    showLinesBefore: 0
    showLinesAfter : 0


- traceMatchingLines: 
  - *off* by default : no trace of matching lines along the scan
  - ***on*** : Any match will trace the line on console when a match occurs.  
  - Surrounding lines *before* or/and *after* can be traced to give more context. 
    - line number reflects the source organisation.   
    - to help reading: matching lines have a star, surrounding have not 

Sample extract below with 1 line before and 1 line after (regex *'/file/i'*):    

    --------------- File: /explore/collector.mjs --------------   
    15:
    *16:    this.count_all_visited_files = 0;
    *17:    this.count_matching_files = 0;
    18:
    ...

#### Output of current probe  

by default, main parameters of the current probe are displayed :    
    ------------------------------- probe parameters -------------------------------
    : roots: [./] x []
    : regex: '/comment/gim'  (code only)
    : extensions:[.java]
    : skip File if: includes:[]    notIncludes: [JavaCommentAllCases]
    --------------------------------------------------------------------------------

if you don't want it in your logs, change the parameter :    `displayProbe: "off"`.   

### End of scan reports 

#### synthetic counters 

final report :     
  
    -------           end of exploration of group [explore,probes]           -------
    :     matching files: 17 / 17 from 3 / 3 directories
    :     matching lines: 153 / 2 331 for 191 match: '/file/gim'
    :     parsed lines: 1 351 empty: 420  comments: 560 (ignored)
    --------------------------- Time elapsed :  0s 26ms  ---------------------------

 To have such a report ***at the end of each rootToExplore***, set    `detailedReport: "on"`.    
 
### Results 

#### Internal collected results

The internal raw results is a dictionary with an array of matched lines context  per match:   

    "matchKey|matchGroup" : [ [path | n°| line], [path | n°| line], ...]     

The rank of a unique match is the size of its associated array, ie the number of lines where it occurs.    

#### Output as tables 

To separate values, the separator `' | '` is defined in probe and can be changed.     

### Available standard reports 

Three levels of tables output can be set through probe:    


    rank_key_path_line: on
    rank_key_path: on
    rank_key: on


- rank : number of identical data matching :   
  - key : the matches detected by regex.  
    - path : the path of the file where match occurs    
      - line : text of the line where match is found.  
- the 3 options give 3 differents arrays.    

---  
## Samples of results 

#### detailed rank_key_path_line

    --------------------- Global : key by path and source line ---------------------
    Nb  | key | path | no | line
    1 | file | /explore/collector.mjs | 16 |     this.count_all_visited_files = 0;
    1 | file | /explore/collector.mjs | 17 |     this.count_matching_files = 0;
    2 | file | /explore/collector.mjs | 50 |     this.count_all_visited_files += other.count_all_visited_files;
    2 | file | /explore/collector.mjs | 51 |     this.count_matching_files += other.count_matching_files;
    ... etc

A rank of 2 indicates two matches in the same line. In raw data, there is two entries with the line.     

#### ran_key_path


    ----------------------- Global : number of key by path  ------------------------
    Nb | key | path
    6 | file | /explore/collector.mjs
    2 | file | /explore/commandLine.mjs
    3 | file | /explore/events.mjs
    4 | file | /explore/explorateur.mjs
    ... etc.


#### rank_key

    ------------------------ Global : total number of key   ------------------------
    Nb | key
    65 | file
    106 | File
    20 | FILE


## Specific reports 
    you can organize, filter, sort raw results to produce your own reports. see section *programming*.

--- 

## Persist results in files

#### Simplest way 
> Route *console* to file :  *node  search.mjs someProbe.yaml '/someRegex/'*  ***>someFile.txt***   

### get raw results in code   

Starting from the *search.mjs* program, you can adapt it and use the aggregated results for any further processing you need.   

    let probe = getProbeFromCommandLine();
    let explore = new Explorateur(probe);
    let globalCollect = await explore.run();

    // do something with globalCollect 

---    

### More:

#### Development using Explorateur class :

- Create new apps.      
	•	configure probe parameters programmatically.   
	•	run multiple explorations sequentially or in parallel.   
	•	store results in different formats: files, database.   
	•	build higher-level workflows on top of the core exploration engine.   
  •	overwrite any method of Explorateur in your own new Class.   


---  
## How to 

  [install](Install.md)    
  [programming aspects](programming.md)   
  [master regex](regexHelp.md)    

  


