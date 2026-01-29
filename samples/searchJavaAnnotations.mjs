/*
 This sample search and trace annotations in a java source project using javascript

 run with same probe than searchInJava : 
    node searchJavaAnnotations.mjs searchInJava.yaml

*/

import Explorateur from "../explore/explorateur.mjs";
import { log, warn, error } from "../explore/util/logger.mjs";
import { logElapsedTimeSince } from "../explore/util/variousUtil.mjs";
import { DictArray } from "../explore/util/dictArray.mjs";
import { getDefaultProbe } from "../explore/probeUtil.mjs";

 

// create a specific explorer inheriting from Explorateur
class PlusExplorateur extends Explorateur {
  PlusExplorateur(probe) {
    super.Explorateur(probe);
  }
}


/*
  regex to find annotation with capture of values 
*/
// Match: @RequestMapping, @GetMapping, @PutMapping, @PostMapping, @PatchMapping, @DeleteMapping
// Case-insensitive, tolerates spaces after @, global scan.


let startTime = new Date();
/* 
 sample to create a probe from scratch 
 Any missing entry will take a default value (set by internal code) 
 As a documentation sample : modelProbe.yaml is set with all default
 */

let probe = getDefaultProbe();
// perimeter 
probe.commonOrigin = '~//dev/bigData/mySandBox/';
probe.skipDirIfName.includes = ['test','generated','s5000f'];

// non capturing group (?: after the @. : will return the match @RequestMapping  
const MAPPING_ANNOTATION_RE =
  '/@\\s*(?:requestmapping|getmapping|putmapping|postmapping|patchmapping|deletemapping)\\b/i';

// for info : capturing group ( after the @ : will return the content of group :  RequestMapping (no @) 
// final results list of keys are the same as previous
const MAPPING_ANNOTATION_CAP_RE =
  '/@\\s*(requestmapping|getmapping|putmapping|postmapping|patchmapping|deletemapping)\\b/i';

console.log( '\n--------------- 1st tour to count matching keys -----------') 
probe.regex = MAPPING_ANNOTATION_RE;
// no automatic display 
probe.displayProbe = "off";
// standard output of key:occurences
probe.rank_key = 'on';
await new PlusExplorateur(probe).run();

/*
  selection with capture group 
  capture two groups : keyword and args 
  ex: RequestMapping | (value="/is_background_job_running_by_job_name", method=RequestMethod.POST)
*/

const MAPPING_WITH_ARGS_RE =
  '/@\\s*(requestmapping|getmapping|putmapping|postmapping|patchmapping|deletemapping)\\b\\s*(\\([^)]*\\))?/i';


console.log( '\n--------------- Another tour to show extraction of matching keys  with args -----------') 
probe.regex = MAPPING_WITH_ARGS_RE;
probe.rank_key = 'off';


let results = await new PlusExplorateur(probe).run();

let allAnnotations = results.key_array_of_path;
// dispatch in dict by individual a, b, c.  from search a|b|c
let splitResults=allAnnotations.splitByPrimaryKey(probe.separator);
let howMany = 5;
for (const primary of Object.keys(splitResults)) {
 console.log(`\n-------------- list of first ${howMany}. ${primary}  with parameters ---------------`);
  let justOne = splitResults[primary];
  for (const one of Object.keys(justOne).slice(0,howMany)){
    console.log(one)
  }
}

console.log('\n ----  searchJavaAnnotation ends after  ' + logElapsedTimeSince(startTime))