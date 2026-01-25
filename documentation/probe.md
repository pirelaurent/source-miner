# Probe - quick reference guide 

##  *modelProbe.yaml* 

This file in */probes* directory reflects all the default values for scan parameters.   
It provides a reference baseline for creating your custom project's probe.   
In your probes, if some parameters are missing, defaults are applied.     

### Starting directories 

```yaml
commonOrigin: './'
rootsToExplore: [ ]
fullPathFromOs: off 
```    
- *commonOrigin*: './'
    - Uses the current working directory as the base path. Any relative entry in *rootsToExplore* is resolved from there.
    - starting with `~` or `~/` or `~/somePath`: ~/ is replaced by HOMEDIR for mac, linux and windows.
    - for independant modules or projects, set *commonOrigin* at the higher common point of view and set their relative path in *rootsToExplore*.
-	*rootsToExplore*: []
    - no roots defined : the tool will scan all and only all dir(s) under *commonOrigin*.
    - Can hold distincts directories path to scan relative to *commonOrigin*. 
- *fullPathFromOs*: off
    - Paths are displayed relatively to *commonOriginOfRoot*.  
    - if set *on*  : display use the full path of file from origin. (Useful to start an editor from anywhere) 

#### sample   

    commonOrigin: '~/github/projects/'
    rootsToExplore: ['/sales/backend','sales/frontend/V2','research/aero/test']



### Filters 

```yaml 
skipDirIfName:
  includes: [ ]
  notIncludes:  [ ] 

skipFileIfName:
  includes: [ ]
  notIncludes: [ ]
``` 

Behavior and rationale
- Filters allow regex or simple names
-	Filters are applied to the full path, not only to the last path segment.
-	An empty *notIncludes* list disables the corresponding exclusion rule entirely.
  -	to parse exclusively a few files , set their names in *notIncludes* to reject all others

Why full paths are used in filters (especially for files)
- File names alone are not sufficient: 
    The same file name may legitimately exist in multiple directories.
    Using the full path avoids ambiguities and allows precise filtering.
- As a consequence, patterns in *includes / notIncludes* may also match directory names appearing in the path.
    Filters should therefore be written carefully to avoid unintended matches.

#### sample   
```yaml 
skipDirIfName:
  includes: ['sales.*/perf','/V2/generated','jaxb' ]
skipFileIfName:
  includes: ['test' ]
``` 

### file extension 

```yaml 
keepExtension:
  includes: ['.java','.js','.yaml']  # json notation
```
Or a more convenient yaml syntax allows to quickly change config using comments:
```yaml 
keepExtension:
  includes: 
    #- '.java'
    - '.js'
    #- '.yaml'
```

#### Some trace options to debug filters on dir and files 

```yaml 
# default for optional debug on the console flow 
traceSelectedDir: off  
traceRejectedDir: off
traceSelectedFile: off
traceRejectedFile: off
```  
### regex

One can set a default Regex in the probe :
Two notations are accepted: 
```yaml
regex:
  pattern: '/where is Charlie/'
  flags: 'gm'
```

```yaml 
regex: '/where is Charlie/gm'
```

-	flags
	- g (global): finds all matches (not just the first one).
	- i (ignoreCase): case-insensitive matching.
	- m (multiline): can find a regex crossing lines

 **gm flags** will be automatically enforced by *source-miner*

### Option to avoid matches in comments 

By default the search goes full text code and comments : 
``` yaml
ignoreComments: off
```
If ***ignoreComments: on***, a first pass separates *code* and *comments*.   
The search is then applied only to code.   

The app has profiles to exclude comments on demand for the following extensions:    
```yaml
['c','h','cpp','hpp','rust','go','java','kt','js','mjs','ts','cs','sql','yaml','yml','sh','bash','zsh','md']
```  
 Any line containing a comment (partial or full) will be counted in report value as a line with *comments: xx (ignored)*.

>Filtering comments is approximately 5× more expensive than a plain search.   
>With a plain search, empty lines and comment lines are not counted.   

### Output on the fly

```yaml
traceMatchingLines: off
showLinesBefore: 0
showLinesAfter : 0
``` 

- traceMatchingLines: 
  - *off* by default : no trace of matching lines along the scan
  - ***on***. Any match will trace the line on console
  - Surrounding lines *before* or/and *after* can also be traced to give more context. 
    - if any: matching lins have a star, surrounding have not 

Sample extract below with 1 line before and 1 line after (regex *'/file/i'*):    


    --------------- File: /explore/collector.mjs --------------
    15:
    *16:    this.count_all_visited_files = 0;
    *17:    this.count_matching_files = 0;
    18:
    ...


### Synthetic reports' levels

```yaml 
detailedReport: off
```
Similar reports are produced   
	•	after each individual rootToExplore when *detailedReports* is enabled;   
	•	after the complete scan in all cases.   

Sample of final report: 
  
    -------           end of exploration of group [explore,probes]           -------
    :     matching files: 17 / 17 from 3 / 3 directories
    :     matching lines: 153 / 2 331 for 191 match: '/file/gim'
    :     parsed lines: 1 351 empty: 420  comments: 560 (ignored)
    --------------------------- Time elapsed :  0s 26ms  ---------------------------


### Results 

#### Internal collect results

The internal raw results is a dictionary. (key : array of [array per match]).   
***match : [ [path | line Number | sourceLine], [path | line Number | sourceLine], ...]***.  
The number of occurences of a match is the size of its associated array.   

#### Output as tables 

To separate values, the separator is defined in probe and can be changed.     

    separator: '|' 

### Available standard reports 

Three levels of tables output can be set through probe:    

```yaml 
rank_key_path_line: on
rank_key_path: on
rank_key: on
```

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

--- 

## Persist results 

#### Simplest way 
> Route *console* to file :  *node  search.mjs someProbe.yaml '/someRegex/gm'*  ***>someFile.txt***

### get results by program   

Starting from the search.mjs program, you can adapt it and use the aggregated results for any further processing you need.   

    let probe = getProbeFromCommandLine();
    let explore = new Explorateur(probe);
    let globalCollect = await explore.run();

    // do something with globalCollect 


---   

#### Development over explorateur.mjs :

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

  


