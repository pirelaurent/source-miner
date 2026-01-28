/*
   Process a directory after filtering.
   calling process file for each file 
   recursive if a directory is found filterLine, starting a new instance 

*/

import fs from "fs";
import path from "path";
import { log, warn, error } from "./util/logger.mjs";
import { Collect } from "./collector.mjs";
import { regIncludes, regNotIncludes } from "./util/setRegexp4js.mjs";

/*
  count and display to help user to wait :) 
*/

function globalCountAndReportFileProcessed(explore) {
  if (explore.totalFilesProcessed == null) {
    explore.totalFilesProcessed = 1;
  } else {
    explore.totalFilesProcessed++;
  }
  //  if stdout goes to a file , don't trace
  if (!process.stdout.isTTY) return;
  // is on screen 
  if (explore.totalFilesProcessed % 100 === 0) {
    process.stdout.clearLine(0);
    process.stdout.write(`: ${explore.totalFilesProcessed} `);
    process.stdout.cursorTo(0);
    //console.log(` ${explore.totalFilesProcessed} `)
  }
}

/*
  start recursively directory analysis 
*/

export async function processDirectory(directoryPath, depth = 0) {

  let depthHere = depth;
  let collect = new Collect("processDir");
  collect.displayPath = this.fullPathFromOs ? directoryPath : this.shortPath(directoryPath);
  //PLA log('collect created in'+directoryPath)
  collect.count_all_dir += 1;
  // don't filter a root dir, otherwise nothing start
  if (depthHere != 0) {
    if (this.skipDirectory(directoryPath)) {
      return collect;
    }
  }

  // security must be on the realPath  as same dir can be seen with textual diff
  let realPath;
  try {
    realPath = await fs.promises.realpath(directoryPath);
  } catch (e) {
    if (e?.code === "ENOENT") {
      console.error("*********************** Path not found:", directoryPath);
      return; // ou continue
    }
    throw e; // autre erreur (droits, etc.)
  }


  // security guard :  same file with different compatible access name can give several rounds

  this.visited ??= new Set();
  if (this.visited.has(realPath)) {
    // continue as the realPath one is he second
    return collect; // as is ( empty )
  }
  this.visited.add(realPath);

  //--------- Emit event and count -----------------------
  this.dirSelectedEvent(realPath);
  collect.count_retained_dir += 1;
  // relay event
  this.dirSelectedEvent(realPath);

  if (this.traceSelectedDir) log("Dir selected : " + this.shortPath(realPath));

  // all entries in this dir are collected (dir, files).

  let entries;
  try {
    entries = await fs.promises.readdir(realPath, {
      withFileTypes: true,
    });
  } catch (error) {
    if (error.code === "EPERM") {
      console.error("Permission denied:", realPath);
    } else {
      console.error("Error reading directory:", realPath, error);
    }
    return collect;
  }

  /*
     loop in a dir entries : can be a dir or a file 
    */

  for (const entry of entries) {
    // concatenation after current dir
    const fullPath = path.join(realPath, entry.name);
    //-----------------------------------------------------
    if (entry.isDirectory()) {
      collect.has_sub_dir = true;
      //start a new process for this subDir
      depthHere++;
      let collectUpper = await this.processDirectory(fullPath, depthHere);

      // once returned consolidate results for this level

      if (collectUpper.count_retained_lines == 0)
        this.dirSelectedWithoutValidFilesEvent(fullPath);
      collect.consolidate(collectUpper);

      // trap point 
      this.endOfProcessingDirEvent(collectUpper);

    } // -----------------------------  regular file
    else {
      /*
         Process a file (of current dir), except if dir rejected as not containing some strings
         Apply filter on file names
        */
 
      if (this.skipFile(fullPath)) continue;
      // a file is candidate 
      this.fileSelectedEvent(fullPath);
      collect.count_all_visited_files++;

      // for debug trace
      if (this.traceSelectedFile) {
        console.log("traceSelectedFile :" + this.shortPath(fullPath));
      }
      // just a wait indicator 
      else { globalCountAndReportFileProcessed(this, collect) }; // not exact if parallel but just an indication

 

      let collectFromFile = await this.processFile(fullPath);
      if (collectFromFile.match)
        collect.count_matching_files++;
      // merge
      collect.consolidate(collectFromFile);
    }
  } //for
  //  end for this dir

  return collect;
}


/*
### skipDirectory(path)

**Contract**
- Input: absolute or relative directory path
- Returns: `boolean`
  - `true` → directory is skipped
  - `false` → directory is explored

⚠️ Any override **must return a boolean**.

------------- filters on directories names ----------------
This default filter : 
- default: skip any directory starting with . ( like .git )
- parameters  : skipDirIfNameIncludes , skipDirIfNameNotIncludes

*/
export function skipDirectory(currentPath) {
  // exit as soon as possible
  // avoid hidden dir (like .git )
  let lastPart = currentPath.split("/").pop();
  if (lastPart.startsWith(".")) {
    if (this.traceRejectedDir) log("⚠️ Dir rejected '.': " + currentPath);
    return true;
  }

  // other strings in name to avoid

  if (regIncludes(currentPath, this.skipDirIfNameIncludesRx)) {
    if (this.traceRejectedDir)
      log("⚠️ Dir rejected include: " + this.shortPath(currentPath));
    return true;
  }

  if (regNotIncludes(currentPath, this.skipDirIfNameNotIncludesRx)) {
    if (this.traceRejectedDir) {
      log(`⚠️⚠️ Dir rejected (not includes): ${currentPath}`);
    }
    return true;
  }

  return false;
}
//------------- end filters on directories names ----------------