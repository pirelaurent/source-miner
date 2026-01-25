/*------------------------------------------------------
              OUTPUT
  ------------------------------------------------------*/

/*
   show a new run parameters 
  */
import { log, warn, error } from "./util/logger.mjs";

import { logElapsedTimeSince, numOut, alignTitle } from "./util/variousUtil.mjs";

/*
 resume probe in output 
*/

export function showMainScanParameters() {
  console.log(
    "exploration of :[" +
    this.rootsToExplore +
    "] from " +
    this.commonOrigin +
    " for files with extensions " +
    this.extensionsToRetain
  );
}

/*
  Called only when  exploration of a rootPath is ended 
  */
export function endOfARootPathExploration(root, collect) {
  // il peut y avoir plusieurs scan de différentes racines.
  // elle finissent individuellement ici

  // set numout to have thousands separators 
  //  const rfiles = numOut(collect.count_matching_files);

  const rfiles = (collect.count_matching_files);
  const afiles = (collect.count_all_visited_files);
  const rDirs = (collect.count_retained_dir)
  const aDirs = (collect.count_all_dir);
  const mLines = (collect.count_retained_lines);
  const aLines = (collect.count_all_lines);
  const rMatches = (collect.count_retained_match);

  // last call is global with an array
  if (typeof root != "string") {
    console.log(':'+alignTitle(`end of exploration of group [${root}]`, 79, 5));
  } else {
    console.log(':'+alignTitle(`end of exploration of  [${this.shortPath(root)}]`,79, 5));
  }
  console.log(
    `:     matching files: ${rfiles} / ${afiles} from ${rDirs} / ${aDirs} directories`
  );
  const jump = (this.regex.source.length > 60) ? "\n: " : "";

  console.log(`:     found ${rMatches} regex:  ${jump} '${this.regex}'`)
  let effectiveLines = collect.count_all_lines - collect.count_empty_lines;

  // only in case ignoreComments are empty lines and comment lines calculated.
  
    let skip = "";
    if (this.ignoreComments) {
      effectiveLines = effectiveLines - collect.count_comment_lines;
      skip = "(ignored)";
    } else {
      skip = "(not filtered)"
    }

    console.log(
      `:     parsed lines: ${effectiveLines.toLocaleString
        ('fr-FR')} matching: ${mLines} / ${aLines} empty: ${collect.count_empty_lines.toLocaleString(
          "fr-FR"
        )}  comments: ${collect.count_comment_lines.toLocaleString('fr-FR')
      } ${skip}  `
    );
  

  console.log(alignTitle(`Time elapsed : ${logElapsedTimeSince(this.startTime)}`));

  /*
   more list results 
  */

  outArrays(root, collect, this);

  /*
   maxFilesToCheck is a help for internal debugging to see quickly partial results to verify a regex
   To avoid misunderstanding, the following specific message is added
  */
  if (this.maxFilesToCheck < Number.MAX_SAFE_INTEGER) {
    console.log(
      "********* Warning : was a partial run on ",
      this.maxFilesToCheck,
      " max files ******" + " see explore.maxFilesToCheck ***"
    );
  }

  // if multiple roots, the global end endOfARootPathExploration is called later

  if ((this.rootsToExplore.length > 1) && (typeof root != "string")) {
    console.log(alignTitle("END OF RUN"));
  } else console.log(alignTitle());
}


/*
  log dictionary 2
  */
export function outArrays(rootPath, collect, explore) {

  // Only last round  have an array of roots, otherwise a string
  const lastRound = typeof rootPath != "string";

  let filteredDict = collect.key_array_of_path;

  if (filteredDict.totalEntries() === 0) {
    console.log(": No matching data to display");
    return;
  }

  let sepa = explore.separator;
  let precision = lastRound ? 'Global :' : '';
  /*
    detailed output with key,path,line
  */
  if (explore.probeRun.rank_key_path_line === "on") {
    console.log('\n' + alignTitle(precision + " key by path and source line"));
    console.log(`Nb ${sepa}key${sepa}path${sepa}no${sepa}line`);
    // in case of multiple identical entries for key,path,line we rank them and show only the last one
    let waitingLine = null


    for (let key in filteredDict) {
      let rank = 1;
      let prevPath = null;
      let prevLine = null;

      filteredDict[key].forEach((elts) => {
        const [path, lineNumber, sourceText] = elts;

        // si doublon exact avec l'entrée précédente → rank++
        if (path === prevPath && lineNumber === prevLine) {
          rank++;
        } else {
          if (waitingLine !== null) {
            console.log(rank + waitingLine);
            rank = 1;
          }
          waitingLine = sepa + key + sepa + path + sepa + lineNumber + sepa + sourceText;
        }
        // mémorisation pour l'itération suivante
        prevPath = path;
        prevLine = lineNumber;
      });
      // for the last one 
      if (waitingLine !== null) {
        console.log(rank + waitingLine);
      }
    }
  }

  if (explore.probeRun.rank_key_path === "on") {

    console.log('\n' + alignTitle(precision + " number of key by path "));
    console.log("Nb" + sepa + "key" + sepa + "path");
    //Liste 1 : Map<key, Map<path, count>>
    const byKeyAndPath = {};
    // prepare data
    for (const key in filteredDict) {
      for (const [path] of filteredDict[key]) { // path is in mode displayPath when collected   
        byKeyAndPath[key] ??= {};
        byKeyAndPath[key][path] = (byKeyAndPath[key][path] ?? 0) + 1;
      }
    }
    // output data
    for (const key in byKeyAndPath) {
      for (const path in byKeyAndPath[key]) {
        console.log(
          byKeyAndPath[key][path] + sepa +
          key + sepa +
          path
        );
      }
    }
  }


  if (explore.probeRun.rank_key === "on") {
    console.log('\n' + alignTitle(precision + " total number of key  "));
    console.log("Nb" + sepa + "key");
    const byKeyTotal = {};
    // build counts
    for (const key in filteredDict) {
      byKeyTotal[key] = filteredDict[key].length;
    }

    // sort by count desc (rank), then by key
    const ranked = Object.entries(byKeyTotal)
      .sort(([k1, n1], [k2, n2]) => (n2 - n1) || k1.localeCompare(k2));

    // output
    for (const [key, count] of ranked) {
      console.log(count + sepa + key);
    }
  }

}
