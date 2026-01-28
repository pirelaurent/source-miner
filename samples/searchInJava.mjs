/*
 the goal of this sample is to demonstrate how to chain searches 

 it runs with the associated probe : 
 node searchInjava.mjs searchInJava 

*/

import Explorateur from "../explore/explorateur.mjs";
import { getProbeFromCommandLine } from "../explore/commandLine.mjs";
import { log, warn, error } from "../explore/util/logger.mjs";
import { logElapsedTimeSince } from "../explore/util/variousUtil.mjs";
import { DictArray } from "../explore/util/dictArray.mjs";

// create a specific explorer inheriting from Explorateur
class PlusExplorateur extends Explorateur {
  PlusExplorateur(probe) {
    super.Explorateur(probe);
  }

  // override displayProbe to leave output cleaner 
  displayProbe() {
    // do nothing 
  }

  // override end of root path exploration if something to do more with results 
  endOfARootPathExploration(root, collect) {
    // let the standard running to see counts 
    super.endOfARootPathExploration(root, collect);
    // do more with collected results here 
    //...
  }
} // ------------- end of class PlusExplorateur 


/*
  as a regex result with group is of type:  result|resultGroup
  Filter on prefix result (new, import, package, etc.)
  Reject entry if resultGroup is in a rejects list
  Return filtered dico 
  */

function filterCompositeKeys(dico, prefix, rejects = [], sepa = '|') {
  const out = new DictArray();

  for (const [k, arr] of Object.entries(dico)) {
    const [key, value = ''] = k.split(sepa, 2);

    if (!key?.startsWith(prefix)) continue;
    if (rejects.some(r => value.startsWith(r))) continue;

    out[k] = arr;
  }
  return out;
}

/*
  utility : 
    sort results by occurences 
    output the top ten 
*/
function showTopOccurences(dico, howMany = 10) {
  const byOccurences = dico.sortedByOccurrencesDesc();
  byOccurences.slice(0, howMany).forEach(x => console.log(x))
}





/*
  Main work : 
    - set common parameters
    - 3 run of searches with top 10 ouput 

    All results are kept in different collections , ready to be analyzed or merged 
*/

let startTime = new Date();

// prepare an instance of Explorateur with a probe from command line: node searchInjava.mjs searchInJava.yaml 
let probe = getProbeFromCommandLine();

probe.separator = '|'; 

// search instanciations ( new x )
// regex for js \ are escaped

probe.regex = {
  pattern: '\\b(new)\\s+([A-Za-z_]\\w*(?:\\.[A-Za-z_]\\w*)*)(?:\\s*<[^>]+>)?\\s*(?:\\(|\\[)',
  flags: 'g'
};
// cli equivalent : not escaping
// node search someYaml '/\bnew\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)(?:\s*<[^>]+>)?\s*(?:\(|\[)/gm'

let rejectNew=['String','Integer','Double']

console.log(`--> search for "new someClass" excluding ${rejectNew}`)
let collectNew = await new PlusExplorateur(probe).run();
// composite result key: |new|inGroup   value
//  value:  array of n [filePath, lineNumber, lineText] 
let newResults = collectNew.key_array_of_path;
let newDA = filterCompositeKeys(newResults,'new',rejectNew,probe.separator);
showTopOccurences(newDA,10);

//---------------------------- package or import in a run 
probe.regex = {
  pattern: '^\\s*(package|import)\\s+(?:static\\s+)?([A-Za-z_]\\w*(?:\\.[A-Za-z_]\\w*)*(?:\\.\\*)?)\\s*;',
  flags: 'gm'
}
const rejectImports = ['java.', 'jakarta.','org.'];
console.log(`--> search for "import someClass" excluding ${rejectImports}`)
let collectPackages = await new PlusExplorateur(probe).run();

// as results are a mix of import xxx or package yyy we split in two distincts collections:

let dictResults = collectPackages.key_array_of_path; 

const importsDA = filterCompositeKeys(dictResults,'import',rejectImports,probe.separator);
console.log(`---------------------- top of imports --------------------`);
showTopOccurences(importsDA,10);


const packagesDA = dictResults.filterKeysByPrefix("package" + probe.separator);
console.log(`---------------------- top of package declarations --------------------`);
showTopOccurences(packagesDA,10);

//---------------------------- class, interface, enum , record 

probe.regex = {
  pattern: '^\\s*(?:@\\w+(?:\\([^)]*\\))?\\s*)*(?:public|protected|private|abstract|final|static|sealed|non-sealed|strictfp|\\s)*\\s*(class|interface|enum|record)\\s+([A-Za-z_]\\w*)',
  flags: 'gm'
};

// one common search then 4 split

let collectDeclaration = await new PlusExplorateur(probe).run();

let dictDeclaration = collectDeclaration.key_array_of_path;
const classesDA = dictDeclaration.filterKeysByPrefix("class" + probe.separator);
console.log(`---------------------- top of class --------------------`);
showTopOccurences(classesDA,10);

const interfacesDA = dictDeclaration.filterKeysByPrefix("interface" + probe.separator);
console.log(`---------------------- top of interface --------------------`);
showTopOccurences(interfacesDA,10);

const enumDA = dictDeclaration.filterKeysByPrefix("enum" + probe.separator);
console.log(`---------------------- top of enum --------------------`);
showTopOccurences(enumDA,10);

const recordDA = dictDeclaration.filterKeysByPrefix("record" + probe.separator);
console.log(`---------------------- top of record --------------------`);
showTopOccurences(recordDA,10);


/*
  can work with results like 
  - finding import not solved by package in same perimeter of scan
  - analyse dependencies between packages through files and import 
  - ...
*/


console.log('\n  searchInJava ends after  ' + logElapsedTimeSince(startTime))