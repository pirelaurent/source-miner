/*
 the goal of this sample is to demonstrate how to chain search 

 it runs with the associated probe : 

 node searchInjava.mjs searchInJava 

*/

import Explorateur from "../explore/explorateur.mjs";
import { getProbeFromCommandLine } from "../explore/commandLine.mjs";
import { log, warn, error } from "../explore/util/logger.mjs";
import { logElapsedTimeSince } from "../explore/util/variousUtil.mjs";

// create a specific explorer inheriting from Explorateur
class PlusExplorateur extends Explorateur {
  PlusExplorateur(probe) {
    super.Explorateur(probe);
  }

  // override displayProbe to leave output cleaner 
  displayProbe() {
    // do nothing 
  }

  // override end of root path exploration to output some stats
  endOfARootPathExploration(root, collect) {
    // leave the standard output 
    super.endOfARootPathExploration(root, collect);
    // do something with results 
  }
} // ------------- end of class PlusExplorateur 

// sort then output 
function showTop(dict, howMany = 10) {
  const byOccurences = dict.sortedByOccurrencesDesc();
  byOccurences.slice(0, howMany).forEach(x => console.log(x))
}

/*
  run three successive composite search 
*/

let startTime = new Date();

// prepare an instance of Explorateur with a read probe (includes regex)from command line
let probe = getProbeFromCommandLine();

const sepa = '|'
probe.separator = sepa; // as we use it later, be sure of choice 



// below in js , \ are escaped . gm flag indicates a search in raw file, not line per line 
probe.regex = {
  pattern: '\\b(new)\\s+([A-Za-z_]\\w*(?:\\.[A-Za-z_]\\w*)*)(?:\\s*<[^>]+>)?\\s*(?:\\(|\\[)',
  flags: 'g'
};
// cli equivalent : '/ pattern not escaped /flags ' :
// //node search someYaml '/\bnew\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)(?:\s*<[^>]+>)?\s*(?:\(|\[)/gm'
console.log('******* search for "new someClass" ********')
let collectNew = await new PlusExplorateur(probe).run();
showTop(collectNew.key_array_of_path, 10)




//---------------------------- package and import : one search then a split 
probe.regex = {
  pattern: '^\\s*(package|import)\\s+(?:static\\s+)?([A-Za-z_]\\w*(?:\\.[A-Za-z_]\\w*)*(?:\\.\\*)?)\\s*;',
  flags: 'gm'
}
let collectPackages = await new PlusExplorateur(probe).run();

let dictResults = collectPackages.key_array_of_path;
const importsDA = dictResults.filterKeysByPrefix("import" + sepa);
const packagesDA = dictResults.filterKeysByPrefix("package" + sepa);
console.log(`---------------------- top of imports --------------------`);
showTop(importsDA, 10)
console.log(`---------------------- top of package declarations --------------------`);
showTop(packagesDA, 10)

//---------------------------- class, interface, enum 

probe.regex = {
  pattern: '^\\s*(?:@\\w+(?:\\([^)]*\\))?\\s*)*(?:public|protected|private|abstract|final|static|sealed|non-sealed|strictfp|\\s)*\\s*(class|interface|enum|record)\\s+([A-Za-z_]\\w*)',
  flags: 'gm'
};

// one search then split

let collectDeclaration = await new PlusExplorateur(probe).run();

let dictDeclaration = collectDeclaration.key_array_of_path;
const classesDA = dictDeclaration.filterKeysByPrefix("class" + sepa);
const interfacessDA = dictDeclaration.filterKeysByPrefix("interface" + sepa);
const enumDA = dictDeclaration.filterKeysByPrefix("enum" + sepa);
const recordDA = dictDeclaration.filterKeysByPrefix("record" + sepa);
console.log(`---------------------- top of class --------------------`);
showTop(classesDA, 10)
console.log(`---------------------- top of interface --------------------`);
showTop(interfacessDA, 10)
console.log(`---------------------- top of enum --------------------`);
showTop(enumDA, 10)
console.log(`---------------------- top of record --------------------`);
showTop(recordDA, 10)

console.log('\n  searchInJava ends after  '+ logElapsedTimeSince(startTime))