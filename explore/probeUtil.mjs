import fs from "fs";
import yaml from "js-yaml";
import { setRegexp4js } from "./util/setRegexp4js.mjs";
import { alignTitle, escapeRegex } from "./util/variousUtil.mjs"
import { log, warn, error } from "./util/logger.mjs";
import { compileIncludesRegex, regIncludes } from "./util/setRegexp4js.mjs";

/*
 facility to read probe from a file as yaml or json 
 Explorateur has a default probe that is overwriten by or completed by  
 Used by search.mjs 

*/
export function readProbeFromFile(someFilePath) {
  try {
    const content = fs.readFileSync(someFilePath, "utf8");
    const extension = someFilePath.split(".").pop();

    switch (extension) {
      case "json":
        return JSON.parse(content);

      case "yaml":
      case "yml":
        return yaml.load(content);

      default:
        throw new Error(`Unsupported file type: .${extension}`);
    }

  } catch (error) {
    // Message principal
    console.error(`❌ Error in file: ${someFilePath}`);
    console.error(error.message);

    // Détails YAML utiles (si présents)
    if (error.mark) {
      const { line, column, snippet } = error.mark;
      console.error(`→ line ${line + 1}, column ${column + 1}`);
      if (snippet) {
        console.error(snippet);
      }
    }

    process.exit(1);
  }
}

export function mergeDeep (target, source){
    // iterate over keys in source
    Object.keys(source).forEach(key => {
      const srcVal  = source[key];
      const tgtVal  = target[key];

      // if the source value is an array, replace the target with a clone of the array
      if (Array.isArray(srcVal)) {
        target[key] = srcVal.slice();
      }
      // if both source and target are plain objects, merge recursively
      else if (srcVal !== null && typeof srcVal === 'object' &&
               tgtVal !== null && typeof tgtVal === 'object' &&
               !Array.isArray(tgtVal)) {
        mergeDeep(tgtVal, srcVal);
      }
      // otherwise just assign
      else {
        target[key] = srcVal;
      }
    });
  }


/*
 create all default options in a new probe for programming 
*/


export function getDefaultProbe() {
  let probe = {};
  probe.commonOrigin = "./";
  probe.rootsToExplore = [];
  probe.skipDirIfName = {};
  probe.skipDirIfName.includes = [];
  probe.skipDirIfName.notIncludes = [];

  probe.skipFileIfName = {};
  probe.skipFileIfName.includes = []
  probe.skipFileIfName.notIncludes = []

  probe.keepExtension = {};
  probe.keepExtension.includes = ['.java', '.md', '.mjs', '.js', '.yaml'];

  probe.fullPathFromOs = "off";

  probe.traceSelectedDir = "off"
  probe.traceRejectedDir = "off"
  probe.traceSelectedFile = "off"
  probe.traceRejectedFile = "off"

  probe.regex = '/where is Charlie/';

  probe.search = {};
  probe.search.code = "on";
  probe.search.comments = "on";

  probe.traceMatchingLines = "off"
  probe.showLinesBefore = 0
  probe.showLinesAfter = 0


  probe.detailedReport = "off"

  probe.displayProbe = "on"

  probe.separator = '|'

  probe.rank_key_path_line = "off"
  probe.rank_key_path = "off"
  probe.rank_key = "on"


  probe.execution = {};
  probe.execution.mode = 'sequential';
  // mode= parallel 

  return probe;
}



/*
 from keys in probe to class attributes ready to use
*/
export function flattenProbe() {
  // commonOrigin and list of subsequent roots

  this.commonOrigin =
    this.probeRun.commonOrigin;   //"~/";

  this.rootsToExplore = this.probeRun.rootsToExplore;

  //cannot start with empty array
  if (!this.rootsToExplore || this.rootsToExplore.length == 0) this.rootsToExplore = [""];

  this.extensionsToRetain = this.probeRun.keepExtension.includes;
  // normalize extension list in .xxx lowercase
  for (let i in this.extensionsToRetain) {
    this.extensionsToRetain[i] = this.extensionsToRetain[i].toLowerCase();
    if (!this.extensionsToRetain[i].startsWith("."))
      this.extensionsToRetain[i] = "." + this.extensionsToRetain[i];
  }

  // change all parameters string in regex list
  // directories
  this.skipDirIfNameIncludesRx =
    compileIncludesRegex(this.probeRun.skipDirIfName?.includes);

  this.skipDirIfNameNotIncludesRx =
    compileIncludesRegex(this.probeRun.skipDirIfName?.notIncludes);

  // then compile
  this.skipFileIfNameIncludesRx = compileIncludesRegex(this.probeRun.skipFileIfName.includes);
  this.skipFileIfNameNotIncludesRx =
    compileIncludesRegex(this.probeRun.skipFileIfName?.notIncludes);

  // optional trace to set on

  this.traceSelectedDir = this.probeRun.traceSelectedDir === "on";
  this.traceRejectedDir = this.probeRun.traceRejectedDir === "on";

  this.traceSelectedFile = this.probeRun.traceSelectedFile === "on"
  this.traceRejectedFile = this.probeRun.traceRejectedFile === "on";

  // filter comment

  // by default search everywhere 
  // previous ignoreComment is : this.searchInCode && !this.searchInComments


  this.searchInCode = this.probeRun.search.code === "on";
  this.searchInComments = this.probeRun.search.comments === "on";

  // case both to off 
  if (!this.searchInCode && !this.searchInComments) {
    console.log('❌  ERROR : Nothing to search: search.code and search.comments are off');
    console.log('. Program exit');
    process.exit(1);
  }

  // detailed report
  this.detailedReport = this.probeRun.detailedReport === "on";


  this.showExtraLinesBeforeMatch = this.probeRun.showLinesBefore;
  this.showExtraLinesAfterMatch = this.probeRun.showLinesAfter;

  // adjust regex and notice mode per line or multilines 

  this.regex = setRegexp4js(this.probeRun.regex);

  // output
  this.traceMatchingLines = this.probeRun.traceMatchingLines === "on";

  this.fullPathFromOs = this.probeRun.fullPathFromOs == "on";

  this.separator = this.probeRun.separator;
  // standard output options already set in default
  this.displayProbe = this.probeRun.displayProbe === "on";
}

/*
   display only interesting data of current probe
  */

export function displayProbeOnConsole() {
  let probe = this.probeRun;
  //@todo : tamponner pour pouvoir mettre la cartouche dans les yaml
  console.log(alignTitle("probe parameters"));
  console.log(`: roots: [${probe.commonOrigin}] x [${probe.rootsToExplore}]`);
  let filter = '-per line';
  let comment = '';
  if (this.searchInCode && this.searchInComments) filter = '(plain source)';
  if (this.searchInCode && !this.searchInComments) filter = '(code only)';
  if (!this.searchInCode && this.searchInComments) filter = '(comments only)';

  console.log(`: regex: '${this.regex}'  ${filter}  ${comment} `);

  if (
    probe.skipDirIfName.includes.length != 0 ||
    probe.skipDirIfName.notIncludes.length != 0
  )
    console.log(
      ": skip dir if: includes:[" +
      probe.skipDirIfName.includes +
      "]  notIncludes:[" +
      probe.skipDirIfName.notIncludes +
      "]"
    );
  if (probe.keepExtension)
    console.log(": extensions:[" + probe.keepExtension.includes + "]");
  if (
    probe.skipFileIfName.includes.length != 0 ||
    probe.skipFileIfName.notIncludes.length != 0
  )
    console.log(
      ": skip File if: includes:[" +
      probe.skipFileIfName.includes +
      "]    notIncludes: [" +
      probe.skipFileIfName.notIncludes +
      "]"
    );


  if (
    probe.showLinesBefore +
    probe.showLinesAfter != 0
  )
    console.log(
      ": showExtraLines : before:" +
      probe.showLinesBefore +
      " after:" +
      probe.showLinesAfter
    );
  console.log(alignTitle());
}
