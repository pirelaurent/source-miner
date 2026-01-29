# Programming aspects  

## **Explorateur.mjs** 

The main class responsible for performing the search and collecting results.   

####  `.mjs` choice

**ESM (ECMAScript Modules)** is the standard JavaScript module system defined by the ECMAScript specification and used by modern runtimes (browsers and Node.js).   

Using the `.mjs` extension:   
- makes the module type explicit per file,
- avoids relying on `"type": "module"` in `package.json`,
- enables native `import` / `export` syntax to structure the codebase clearly.   
     

### Externalized implementations

Explorateur delegates some methods to external functions like the following (mind ***call(this***,...)).   

    import { processDirectory as processDirectoryImpl } from "./processDirectory.mjs";
    async processDirectory(directoryPath) { return processDirectoryImpl.call(this, directoryPath) }   

This preserves:   
- access to instance state
- polymorphism
- subclass overrides

⚠️ Subclasses overriding these methods must preserve the return contract.   

---

## Running an instance of Explorateur

### `search.mjs` CLI application


• from the command line: load a probe and an optional regex to overwrite the probe's one.   
• instantiate an Explorateur.   
• run it.   


    let probe = getProbeFromCommandLine();
    let explore = new Explorateur(probe);
    await explore.run();

To load a probe programmatically, outside command line:   

    let probe = readFromFile("myProbe.yaml")
    

### Changing probe parameters by code

To understand probe configuration, see [probe reference guide](../README.md#probe-reference-guide)   

Any missing entry takes default values as shown by *modelProbe.yaml*.   
Any YAML entry can be set programmatically, provided the yaml structure is respected:    

Examples:   

    // restrict search to Java files only
    probe.keepExtension.includes = [".java"];

    // search only in code, not in comments
    search.code = "on".  
    search.comments = "off"

    // case-insensitive search ( flags gm are implicit if not set)
    probe.regex = "/file/i";

    // trace selected lines on the fly  
    probe.traceMatchingLines = "on"

---


## Designing your classes

A way to adapt behavior to your needs is to create you class, inherit from `Explorateur` and add or overwrite methods.   

    class PlusExplorateur extends Explorateur {
      constructor(probe) {
        super(probe);
      }
    }

---

## Useful methods

There are two categories of methods in `Explorateur`:   

- **Core methods**: contain the traversal and analysis logic
- **Event methods**: empty hooks meant to be overridden

See the source: `explore/explorateur.mjs`   

---
### Overriding core methods 

Any method can be overridden replacing or reusing parent method via `super`.   

Sample : trace and skip a special directory, overwritting *skipDirectory* method:    

    /*
    Contract
    - Input: absolute or relative directory path
    - Returns: `boolean`
      - `true` → directory is skipped
      - `false` → directory is explored
    */ 
    skipDirectory(currentPath){
      if(currentPath.includes('jaxb')) {
        console.log(currentPath)
        return true
      }
      # let standard code running for others
      return super.skipDirectory(currentPath)
    }


### Overriding event methods

An event method has no code inside main explorateur, just an empty implementation you can replace.   

Example 1: Detect out of norms files, candidates to be refactored:   

    endOfProcessingFileEvent(collect) {
      const nb = collect.count_all_lines;
      const max = 3000;
      if (nb > max) {
        console.log(
          `⚠️  WARNING: File size out of bound ${max} (${nb} lines): ${collect.displayPath}`
        );
      }
    }

Example 2: Detect overcrowed final directories candidates to reorganization:   

    endOfProcessingDirEvent(collect) {
      const nb = collect.count_all_visited_files;
      const max = 300;
      if (!collect.has_sub_dir && nb > max) {
        console.log(`FAT DIR : ${nb} files >${max} in ${collect.displayPath}`);
      }
    }

---

# Results

## Collecting data

A `Collect` instance is created:   
- for each file,
- for each directory,
- for each root,
- and for the final result.

See source code ***collector.mjs*** for detailed content.   

### Recursion tree and collect(s) consolidation

-	Each scanned file produces its own new `Collect`.   
-	Each directory merges the collects of its children, files and subDirs.   
-	Results propagate through the recursion.   
-	At the end of a root traversal, the method `endOfARootPathExploration` is called and can be hooked.   

      export function endOfARootPathExploration(root, collect) {
      // default summary output code is here
      }

### Multiple roots

When several `rootsToExplore` are defined:   

•	 They are processed by a loop in `run()` method,   
•	 Each root produces its own collect,   
•	 All collects are merged into a final one by the run function,   
•	 A final `endOfARootPathExploration` is called with the final merged result.   

### final result 
This final collect is returned by `run()` for processing outside if useful:   

    const finalCollect = await new Explorateur(probe).run();

---


## Collect keeps details of all matches

Each `Collect` contains a dictionary of matches:   

    // DictArray: key → array of values
    this.key_array_of_path = new DictArray();

### key:value
#### Key structure

The key comes from from the regex result:   

- simple regex:
  - `"File"`
- regex with groups:
  - group values joined with | ( `probe.separator` parameter)
  - e.g. `"new|someclassCatched"`

#### Value structure

Every elementary match is stored as:   `[ file's fullPath, line n°, line ]`

Value structure : array of elementary matches :   

    key: [
      [fullPath, n°, line],
      [fullPath, n°, line],
      ...
    ]

If a same key is found several times on the same line, each match will have its entry.   

---

## Reports

### standard 

See standard reports in chapter Probe :   

    rank_key_path_line: on
    rank_key_path: on
    rank_key: on

---   

## Develop new search and new reports 

### Sample to look at : *samples/searchInJava.mjs*

This code runs three successive regex with catch groups on a Java project to search:   
- `new` 
- `import|package` in one round 
- `class|Interface|enum|record` in one round

Results are collected in three lists :   

    new|classInstantiatedName:  [[path,No,line][path,No,line] etc.]

    import|importedPackageName: [[],[]]
    package|packageName: [[],[]]

    class|classNameDeclaration: [[],[]]
    Interface|interfaceNameDeclaration: [[],[]]
    enum|enumName: [[],[]]
    record|recordName: [[],[]]

#### ranking and output top 10

  The rank is the number of match per key ( array size of [[...][...]...] ).   
  The sample code :   
    - dispatch by distinct first part of match    
    - sort by rank    
    - output the top 10 occurences 

### Sample output for *import*

    ---------------------- top of imports --------------------
    [ 'import|com.pep-inno.cercle_ia.common.constant.ciaPropertiesConstant', 773 ]
    [ 'import|com.pep-inno.cercle_ia.common.Constant', 685 ]
    [ 'import|com.pep-inno.gap.od.pc.MainEquipmentData', 631 ]
    [ 'import|com.pep-inno.util.log.LogManager', 572 ]
    [ 'import|com.pep-inno.cercle_ia.domain.dao.GenDebilAO', 538 ]
    [ 'import|com.pep-inno.cercle_ia.data.UserContextData', 521 ]
    [ 'import|com.pep-inno.cercle_ia.UserContext', 463 ]
    [ 'import|com.pep-inno.util.cia.DateUtil', 456 ]
    [ 'import|com.pep-inno.cercle_ia.config.ciaProperties', 401 ]
    [ 'import|com.pep-inno.util.cia.CollectionUtil', 378 ]


### do more 

On this basis, you can   
- cross import and package lists to check internal/external references 
- create graph of dependencies linking files through import and package references 
- store your results in file or in db 
- Even prepare refactoring by search and replace 


### Example to look at : *samples/searchJavaAnnotations.mjs*

This sample doesn't use any *probe.yaml*.   
It set by code all options that are not default and can run directly by `node searchJavaAnnotations.mjs`.    

#### first round  

It searches in one round all annotions like @xxxmapping :   

    const MAPPING_ANNOTATION_RE =
      '/@\\s*(?:requestmapping|getmapping|putmapping|postmapping|patchmapping|deletemapping)\\b/i';

The simple standard output option `probe.rank_key = 'on';` will give the follwing output:   

      ------------------------ Global : total number of key   ------------------------
      Nb|key
      1761|@RequestMapping
      1296|@PostMapping
      982|@GetMapping
      61|@PatchMapping
      16|@DeleteMapping
      10|@PutMapping
      --------------------------------------------------------------------------------
#### second round   

It searches the same keys but capture the parameters of the annotations :    

    // capture two groups : keyword and args 
    // |RequestMapping|(value="/is_background_job_running_by_job_name", method=RequestMethod.POST)
    const MAPPING_WITH_ARGS_RE =
      '/@\\s*(requestmapping|getmapping|putmapping|postmapping|patchmapping|deletemapping)\\b\\s*(\\([^)]*\\))?/i'; 

 The results are catched after the run then dispatched in their own collection   

    let results = await new PlusExplorateur(probe).run();
    let allAnnotations = results.key_array_of_path;
    // dispatch in dict by individual a, b, c.  from search a|b|c
    let splitResults=allAnnotations.splitByPrimaryKey(probe.separator);

As a demonstration code, it list the first lines of each collection like the one below:   

      -------------- list of first 5. GetMapping  with parameters ---------------
      GetMapping|(path="/custom")
      GetMapping|(path="/login_zone")
      GetMapping|("/catalogs")
      GetMapping|("/generic/{key}")
      GetMapping|("/generic/{pkey}/{key}")


### No mystery, just js code. 

---

## A few tips 

#### Async run 

Some methods are asynchronous, but a deliberate design choice was made:   

> Directory traversal is intentionally **sequential and deterministic** by default.  (*probe.executionMode = "sequential"*)   
> Files and subdirectories are processed one at a time to keep ordering, reporting, and resource usage predictable.   

But for experiment, you can try *probe.executionMode = "parallel"* , parallel runs per roots.      

#### log(..) function in place of console.log(..)

For debug use log(..) that add the source and line where this log occurs : *[source code:line number] text of log*   

    log(`rejected new ${rejectNew}`) // in source 
    # output on console : 
    [searchInJava.mjs:94] rejected new [ 'String', 'Integer', 'Double' ]

---  

  [Installation](Install.md)   
  [probe reference guide](probe.md)      
  [master regex](regexHelp.md)   
  