import fs from "fs";
import yaml from "js-yaml";
import { setRegexp4js } from "./util/setRegexp4js.mjs";
import { alignTitle, escapeRegex } from "./util/variousUtil.mjs"
import { log, warn, error } from "./util/logger.mjs";
import { getSystemErrorMap } from "util";
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

/*
   set context from Js structure . replace entries. Can be partial
   as it uses this, need to be connected 
 */
export function setProbe(aProbe) {
  for (const key in aProbe) {
    this.probeRun[key] = aProbe[key];
  }
  this.flattenProbe();
}

/*
 from keys in probe to class attributes ready to use
*/
export function flattenProbe() {
  // commonOrigin and list of subsequent roots

  this.commonOrigin =
    this.probeRun.commonOrigin ?? "./";   //"~/";
  this.rootsToExplore = this.probeRun.rootsToExplore ?? [];
  //cannot start with empty array
  if (!this.rootsToExplore || this.rootsToExplore.length == 0) this.rootsToExplore = [""];



  // some default
  this.extensionsToRetain = this.probeRun.keepExtension?.includes ?? ['.java', '.js', '.mjs', '.yaml'];
  // normalize extension list in .xxx lowercase
  for (let i in this.extensionsToRetain) {
    this.extensionsToRetain[i] = this.extensionsToRetain[i].toLowerCase();
    if (!this.extensionsToRetain[i].startsWith("."))
      this.extensionsToRetain[i] = "." + this.extensionsToRetain[i];
  }

  // reject uninsteresting dir () dir starting with . are automatically rejected )

  // ensure the array exists in probeRun
  this.probeRun.skipDirIfName ??= {};
  this.probeRun.skipDirIfName.includes ??= [];
  this.probeRun.skipDirIfName.notIncludes ??= [];


  // change all parameters in regex list
  // directories
  this.skipDirIfNameIncludesRx =
    compileIncludesRegex(this.probeRun.skipDirIfName?.includes);

  this.skipDirIfNameNotIncludesRx =
    compileIncludesRegex(this.probeRun.skipDirIfName?.notIncludes);

  // files

  // ensure the array exists in probeRun
  this.probeRun.skipFileIfName ??= {};
  this.probeRun.skipFileIfName.includes ??= [];
  this.probeRun.skipFileIfName.notIncludes ??= [];
  // then compile
  this.skipFileIfNameIncludesRx = compileIncludesRegex(this.probeRun.skipFileIfName.includes);
  this.skipFileIfNameNotIncludesRx =
    compileIncludesRegex(this.probeRun.skipFileIfName?.notIncludes);

  // optional trace to set on

  this.traceSelectedDir = (this.probeRun.traceSelectedDir ?? "off") === "on";
  this.traceRejectedDir = (this.probeRun.traceRejectedDir ?? "off") === "on";

  this.traceSelectedFile = (this.probeRun.traceSelectedFile ?? "off") === "on";
  this.traceRejectedFile = (this.probeRun.traceRejectedFile ?? "off") === "on";

  // filter comment

  this.ignoreComments = (this.probeRun.ignoreComments ?? "off") === "on";

  // detailed report
  this.detailedReport = (this.probeRun.detailedReport ?? "off") === "on";

  this.showExtraLinesBeforeMatch =
    this.probeRun?.showLinesBefore ?? 0;

  this.showExtraLinesAfterMatch =
    this.probeRun?.showLinesAfter ?? 0;

  // adjust regex and notice mode per line or multilines 

  this.regex = setRegexp4js(this.probeRun.regex);

  // output
  this.traceMatchingLines =
    (this.probeRun.traceMatchingLines ?? "off") === "on";

  this.fullPathFromOs = (this.probeRun.fullPathFromOs?? "off") == "on";

  this.separator = (this.probeRun.separator ?? "\t");
  // standard outpu options 
  let v;
  v = this.probeRun.rank_key_path_line ?? "off";
  this.probeRun.rank_key_path_line =
    (v === true || v === "on") ? "on" : "off";

  v = this.probeRun.rank_key_path ?? "off";
  this.probeRun.rank_key_path =
    (v === true || v === "on") ? "on" : "off";

  v = this.probeRun.rank_key ?? "off";
  this.probeRun.rank_key =
    (v === true || v === "on") ? "on" : "off";

// internal option. 

const m = this.probeRun.execution?.mode ?? "sequential";
this.probeRun.execution ??= {};
this.probeRun.execution.mode = (m === "parallel" || m === "sequential") ? m : "sequential";

}

/*
   display only interesting data of current probe
  */

export function displayProbe() {
  let probe = this.probeRun;
  //@todo : tamponner pour pouvoir mettre la cartouche dans les yaml
  console.log(alignTitle("probe parameters"));
  console.log(`: roots: [${probe.commonOrigin}] x [${probe.rootsToExplore}]`);
  let filter = '-per line';
  let comment = '';
  if (!this.ignoreComments) { filter = "(comments ignored)" } else {
    comment = this.ignoreComments ? '-comment skipped"' : "";
  }

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
      " showExtraLines : before:" +
      probe.showLinesBefore +
      " after:" +
      probe.showLinesAfter
    );
  console.log(alignTitle());
}
