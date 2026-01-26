/*
 explore a file line per line 
 return true if file has at least on match 
*/
import path from "path";
import fs from "fs";
import { log } from "./util/logger.mjs";
import { Collect } from "./collector.mjs";
import { readLinesOneShot } from "./readers.mjs";
import { DictArray } from "./util/dictArray.mjs";
import { regIncludes, regNotIncludes } from "./util/setRegexp4js.mjs";
import { computeLineStarts, computeLineStartsAndEmptyCount, lineNumberFromIndex, lineTextFromLineNumber } from "./util/variousUtil.mjs"
import { isolateSearchedData,splitCodeAndComments } from "../explore/processComments.mjs";




/*
 Analyse a source as a whole to find pattern and more often pattern with groups 
 As a whole : to be freed of the lines cut: pattern can be on several lines 
 With groups : to isolate parts of the matching regex. 
*/
export async function processFile(filePath) {

  // read data in one shot 
  let data = fs.readFileSync(filePath, "utf8");
  // later : adapt if pdf

  // bag of parameters and results 
  let collect = new Collect("processFile");
  // add file level info 
  collect.regex = this.regex;
  collect.fullPath = filePath;
  collect.shortPath = this.shortPath(filePath);
  collect.displayPath = this.fullPathFromOs ? filePath : this.shortPath(filePath);
  collect.extension = path.extname(filePath).toLowerCase();
  collect.match = false;
  collect.count_all_lines = 0;
  collect.count_retained_lines = 0;
  collect.count_retained_match = 0;
  collect.key_array_of_path = new DictArray();  // key : [ [aMatch result][aMatch result]...]
  collect.array_of_matches = [];
  collect.array_of_matching_lines = [];
  collect.array_of_matching_code = [];
  collect.array_of_matching_comments = [];
  /*
   case exclude comment : 
   a first tour to separate and count comment and code lines
   then recreate a pur code data 
   */


  // if search everywhere, don't split . Otherwise, split and choose
  if (!this.searchInCode || !this.searchInComments) {
    const results = splitCodeAndComments(data,collect);
    data = isolateSearchedData (results,this.searchInCode,collect) // otherwise comments
  }



  const showLineIdx = new Set(); // lignes à afficher (match + contexte)
  const matchIdx = new Set(); // lignes qui matchent


  // note positions of line feed to separate by line in results 
  //let lineStarts = computeLineStarts(data);


  const { lineStarts, emptyLines } = computeLineStartsAndEmptyCount(data)
  collect.count_all_lines = lineStarts.length;
 // empty lines of data code or comments or both
  collect.count_empty_lines = emptyLines;


  //--------------- real processing of regex ----------------
  const before = this.showExtraLinesBeforeMatch;
  const after = this.showExtraLinesAfterMatch;
  // get all match in one round 
  const matches = Array.from(data.matchAll(collect.regex));
  if (matches.length > 0) {
    collect.match = true;
    // as can be several, loop
    for (const match of matches) {
      // full match in match[0]
      // if groups, they are in match[1],match[2],.. concatenation 'aa : bb' 
      const keyMatch = match.length > 1
        ? Array.from(match).slice(1).join(this.separator)
        : match[0];
      collect.count_retained_match++;             // position du match
      const lineNumber = lineNumberFromIndex(lineStarts, match.index);
      matchIdx.add(lineNumber);
      // if this line was not checked as retained do it 
      if (!showLineIdx.has(lineNumber)) {

        showLineIdx.add(lineNumber);
        collect.count_retained_lines++;
      }

      // keyMatch to be put in dictionary : key -> array of filePath:line
      collect.key_array_of_path.add(
        keyMatch,
        [collect.displayPath, lineNumber, lineTextFromLineNumber(data, lineStarts, lineNumber)]
      );

      // prepare output if asked 
      if (this.traceMatchingLines) {
        if (before > 0) {
          // contexte avant
          for (let j = Math.max(0, lineNumber - before); j < lineNumber; j++) {
            showLineIdx.add(j);
          }
        }
        if (after > 0) {
          // contexte après
          for (let j = lineNumber + 1; j <= Math.min(lineStarts.length - 1, lineNumber + after); j++) {
            showLineIdx.add(j);
          }
        }
      }
    }

    if (this.traceMatchingLines && collect.match) {
      // keep the file name 
      console.log(`\n--------------- File: ${collect.displayPath} --------------`);
      for (let i = 0; i < lineStarts.length; i++) {
        if (!showLineIdx.has(i)) continue;
        // match line 
        if (matchIdx.has(i)) {
          console.log(`*${i}:${lineTextFromLineNumber(data, lineStarts, i)}`);
        } else {
          // surrounding 
          console.log(`${i}:${lineTextFromLineNumber(data, lineStarts, i)}`);
        }
      }
    }
  }
  // optional recap if detailed output per line 
  if (this.traceMatchingLines && collect.match)
    console.log(`\n---${collect.displayPath}: total lines: ${collect.count_all_lines}, matching: ${collect.count_retained_lines}, matches: ${collect.count_retained_match}`);

  // generate event 
  this.endOfProcessingFileEvent(collect);

  // return result for this file
  return collect;
}

/*
  filter files on criteria : extension , name 
*/
export function skipFile(filePath) {

  let fileName = path.basename(filePath);
  /*
       allways reject os files like .git 
      */

  // avoid also file beginning by .
  if (fileName.startsWith(".")) {
    if (this.traceRejectedFile) {
      console.log("⚠️ File rejected '.': " + fileName);
    }
    return true;
  }
  /*
     skip if  extension not in the list 
    */
  let extension = path.extname(filePath);
  let aGoodOne = false;
  // option not set 
  if (!this.extensionsToRetain) {
    // no extension filter
    console.log(`\n ****** ERROR :  no extension filter on keepExtension for files to retain .\n program aborted *****\n`);
    process.exit(1)
  }

  // option empty : take all 
  if (this.extensionsToRetain.length == 0) {
    return false; // don't skip any file
  }
  // filter on extensions
  for (const ext of this.extensionsToRetain) {
    if (extension == ext) {
      aGoodOne = true;
      break;
    }
  }
  if (!aGoodOne) {
    if (this.traceRejectedFile) {
      console.log(`⚠️ File rejected (extension):  ${fileName}`);
    }
    return true; //skip
  }

  /*
     filter if filename includes substring
    */

  if (regIncludes(filePath, this.skipFileIfNameIncludesRx)) {
    if (this.traceRejectedFile) {
      console.log(`⚠️ File rejected (includes):  ${fileName}`);
    }
    return true;
  }

  /*
    negative test  : keep it if expected term not inside
    it is an or 
  */

  if (regNotIncludes(filePath, this.skipFileIfNameNotIncludesRx)) {
    if (this.traceRejectedFile) {
      console.log(`⚠️ File rejected (not includes):  ${fileName}`);
    }
    return true;
  }

  // end of test, keep this file
  return false;
}

