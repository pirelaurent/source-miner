# Programming aspects

## **Explorateur.mjs** 

This is the main class responsible for performing the search and collecting results.

####  `.mjs` choice

**ESM (ECMAScript Modules)** is the standard JavaScript module system defined by the ECMAScript specification and used by modern runtimes (browsers and Node.js).

Using the `.mjs` extension:
- makes the module type explicit per file,
- avoids relying on `"type": "module"` in `package.json`,
- enables native `import` / `export` syntax to structure the codebase clearly.   
     

### Externalized implementations

Explorateur delegates some methods to external functions
(e.g. in `processDirectory.mjs`) using `.call(this)`.

    import { processDirectory as processDirectoryImpl } from "./processDirectory.mjs";
    async processDirectory(directoryPath) {  return processDirectoryImpl.call(this, directoryPath) }   

This preserves:
- access to instance state
- polymorphism
- subclass overrides

⚠️ Subclasses overriding these methods must preserve the return contract.

---

## Running an instance of Explorateur

### `search.mjs` CLI application


• from the command line: load a probe and replace the regex if any
• instantiate an Explorateur
• run it


    let probe = getProbeFromCommandLine();
    let explore = new Explorateur(probe);
    await explore.run();

To load a probe programmatically, outside of the command line:

    let probe = readFromFile("myProbe.yaml")
    

### Changing probe parameters by code

To understand probe configuration, see [Quick reference guide](../README.md#quick-reference-guide)

Any YAML entry can be set programmatically, provided the structure is respected:

Examples: 

    // restrict search to Java files only
    probe.keepExtension.includes = [".java"];

    // search everywhere except in comments
    probe.ignoreComments = "on";

    // case-insensitive search (other flags gm are implicit)
    probe.regex = "/file/i";

    // trace selected lines on the fly  
    probe.traceMatchingLines = "on"

If you want to replace the probe in an existing instance:

    explore.setProbe(anotherProbe);

---


## Designing your classes

A way to adapt behavior to your needs is to inherit from `Explorateur` and add or overwrite methods.

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

Sample : trace and skip a special directories before standard skip 

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
      return super.skipDirectory(currentPath)
    }


### Overriding event methods

Example: Detect out of norms files, candidates to be refactored

    endOfProcessingFileEvent(collect) {
      const nb = collect.count_all_lines;
      if (nb > 3000) {
        console.log(
          `*** WARNING: Large file (${nb} lines): ${collect.displayPath}`
        );
      }
    }

Example: Detect overcrowed directories candidate to be split

    endOfProcessingDirEvent(collect) {
      const nb = collect.count_all_visited_files;
      if (!collect.has_sub_dir && nb > 300) {
        console.log(`FAT DIR: ${nb} files in ${collect.displayPath}`);
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

•	 Each scanned file produces its own new `Collect`
•	 Each directory merges the collects of its children, files and subDirs
•	 Results propagate upward through the recursion
•	 At the end of a root traversal, the method `endOfARootPathExploration` is called and can be hooked

      export function endOfARootPathExploration(root, collect) {
      // default summary output code is here
      }

### Multiple roots

When several `rootsToExplore` are defined:

•	 They are processed by `run()`,
•	 Each root produces its own collect,
•	 All collects are merged into a final one by the run function,
•	 A final `endOfARootPathExploration` is called with the final merged result.

### final result 
This final collect is returned by `run()` to be processed outside if useful:

    const finalCollect = await new Explorateur(probe).run();

---


## Collect keeps details of all matches

Each `Collect` contains a dictionary of matches:

    // DictArray: key → array of values
    this.key_array_of_path = new DictArray();

### key:value
#### Key structure

The key comes from from the regex result:

- direct match:
  - `"File"`
- grouped regex:
  - group values joined with | ( `probe.separator` parameter)
  - e.g. `"new|someclassCatched"`

#### Value structure

Every match is stored as:

    [ fullPath, lineNumber, lineText ]

Value structure : array of matches 

    key: [
      [fullPath, lineNumber, lineText],[fullPath, lineNumber, lineText],...
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

### Example to look at : *samples/searchInJava.mjs*

This code runs three successive regex searches on a Java project to match:
- `new` 
- `import|package` in one round 
- `class|Interface|enum|record` in one round

Results are collected in three lists :

    new|classInstantiatedName

    import|importedPackageName
    package|packageName

    class|classNameDeclaration
    Interface|interfaceNameDeclaration
    enum|enumName
    record|recordName

#### ranking and output top 10

  The rank is the number of match per key (array size of [ [ fullPath, lineNumber, lineText ],... ]
  The sample code sort by rank and output the top 10 

### Sample output for *import*

    ---------------------- top 10 imports ----------------------
    [ 'import|java.util.List', 5624 ]
    [ 'import|java.util.ArrayList', 2653 ]
    [ 'import|jakarta.xml.bind.annotation.XmlType', 1853 ]
    [ 'import|jakarta.xml.bind.annotation.XmlAccessType', 1601 ]
    [ 'import|jakarta.xml.bind.annotation.XmlAccessorType', 1601 ]
    [ 'import|org.springframework.beans.factory.annotation.Autowired', 1447 ]
    [ 'import|java.io.Serializable', 1351 ]
    [ 'import|java.sql.Timestamp', 1233 ]
    [ 'import|java.sql.Date', 1186 ]
    [ 'import|jakarta.xml.bind.annotation.XmlAttribute', 999 ]


### do more 

On this basis, you can  
- cross import and package lists to check internal/external references 
- create graph of dependencies linking files through import and package references 
- store your results in file or in db 
- Even prepare refactoring by search and replace 

No mystery, just js code. 

---

## Async model

Some methods are asynchronous, but a deliberate design choice was made:

> Directory traversal is intentionally **sequential and deterministic**.  
> Files and subdirectories are processed one at a time to keep ordering, reporting, and resource usage predictable.   

---  

  [Installation](Install.md)  
  [probe parameters](probe.md)      
  [master regex](regexHelp.md) 