/* --------------------------------------------------------
              Classe EXPLORATEUR  (clean method-based version)
              Kind of holder of all methods to explore files and directories  
              can be inherited and methods overwritten

------------------------------------------------------------*/

import { log, warn, error } from "./util/logger.mjs";

import fs from "fs";
import path from "path";
import os from "os";

import { setProbe as setProbeImpl, flattenProbe as flattenProbeImpl, displayProbe as displayProbeImpl } from "./probeUtil.mjs";
import { Collect } from "./collector.mjs";

// specific readers
import {
  readPdf,
} from "./readers.mjs";

// directory & file processors
import {
  processDirectory as processDirectoryImpl,
  skipDirectory as skipDirectoryImpl,
} from "./processDirectory.mjs";





import {
  processFile as processFileImpl,
  skipFile as skipFileImpl
} from "./processFile.mjs";

// events
import * as Events from "./events.mjs";

// output
import {
  showMainScanParameters as showMainScanParametersImpl,
  endOfARootPathExploration as endOfARootPathExplorationImpl,
} from "./output.mjs";

// util
import { resolveCommonOrigin, alignTitle } from "./util/variousUtil.mjs";


class Explorateur {
  constructor(someProbe) {
    this.maxFilesToCheck = Number.MAX_SAFE_INTEGER;
    this.checkedFiles = 0;

    this.probeRun = {};
    if (someProbe) this.setProbe(someProbe);
    this.global_collect = new Collect("explorateur");
  }

  /* ------------------------ PROBE METHODS ------------------------ */

  // assign a probe to explorateur
  setProbe(someProbe) {
    return setProbeImpl.call(this, someProbe);
  }

  // change yaml entries to internal booleans and variables 
  flattenProbe(aProbe) {
    return flattenProbeImpl.call(this, aProbe);
  }

  // output probe on console  . Can be overwritten to set quiet 
  displayProbe(aProbe) {
    return displayProbeImpl.call(this, aProbe);
  }

  /* ------------------------ READER METHODS ------------------------ */

  readPdf(...args) {
    return readPdf.call(this, ...args);
  }

  /* ------------------------ PROCESS METHODS ------------------------ */

  async processDirectory(directoryPath, depth = 0) {
    return processDirectoryImpl.call(this, directoryPath, depth);
  }
  skipDirectory(currentPath) {
    return skipDirectoryImpl.call(this, currentPath);
  }
  /* ------------------------ EVENT : methods with no code for overwriting ------------------------ */

  /*
    called once all the filters on dir are passed: this dir is candidate to scan 
  */
  dirSelectedEvent(fullPath) {
    // hook available 
  }

  /*
   called when a scan is ended without any match inside the directory full content. 
   This can help to eliminates some useless dir in context for further runs. 
  */

  dirSelectedWithoutValidFilesEvent(fullPath) {
    // console.log("dir without valid files in tree ", fullPath);
  }

  /*
   can do something once the file is selected 
 */
  fileSelectedEvent(fullPath) {
    // console.log('->file selected : '+  fullPath);
  }

  /*
    can check collected data once a file was scanned 
    can be overwritten 
  */
  endOfProcessingFileEvent(collect) {

  }

  /*
    Event raised when a dir is finished 
  */
  endOfProcessingDirEvent(collect) {

  }



  /* ------------------------ OUTPUT METHODS ------------------------ */

  showMainScanParameters() {
    return showMainScanParametersImpl.call(this);
  }

  endOfARootPathExploration(root, collect) {
    return endOfARootPathExplorationImpl.call(this, root, collect);
  }

  /* ------------------------ Match PROCESSING ------------------------ */

  processFile(filePath) {
    return processFileImpl.call(this, filePath);
  }

  skipFile(filePath) {
    return skipFileImpl.call(this, filePath);
  }

  /* ------------------------ UTILS ------------------------ */

  /*
  utility to show shorter name for filepath 
  all filepath are enforced to start from os root to avoid side effects in recursive calls 
  this short remove the os part  
  */
  shortPath(fullPath) {
    const short = fullPath.replace(this.commonOrigin, "");
    return short;
  }



  async runSequential() {
    /*
      main loop on the roots 
    */
    for (let root of this.fullRoots) {
      if (this.detailedReport)
        console.log(alignTitle("start exploration of :" + this.shortPath(root), 80, 10));
      const collectOfRoot = await this.processDirectory(root);
      if (this.detailedReport) {
        this.endOfARootPathExploration(root, collectOfRoot);
      }
      this.collectOfRun.consolidate(collectOfRoot);
      this.endOfProcessingDirEvent(collectOfRoot);
    }
    // once all done, start an output if not already done previously ( if 1 rootToExplore )

    if (!this.detailedReport || fullRoots.length > 1) {
      this.endOfARootPathExploration(this.rootsToExplore, this.collectOfRun);
    }
  }


  async runParallel() {
    const results = await Promise.all(
      this.fullRoots.map(async (root) => {

        console.log(
          alignTitle(
            "start exploration of :" + this.shortPath(root),
            80,
            10
          )
        );



        const collectOfRoot = await this.processDirectory(root);

        if (this.detailedReport) {
          this.endOfARootPathExploration(root, collectOfRoot);
        }

        this.endOfProcessingDirEvent(collectOfRoot);

        return collectOfRoot;
      })
    );

    // consolidation kept sequential to avoid race conditions
    for (const collectOfRoot of results) {
      this.collectOfRun.consolidate(collectOfRoot);
    }

    // final aggregation
    if (!this.detailedReport || fullRoots.length > 1) {
      this.endOfARootPathExploration(this.rootsToExplore, this.collectOfRun);
    }







  }


  /* ------------------------ RUN ------------------------ */

  async run() {
    this.startTime = new Date();
    this.commonOrigin = resolveCommonOrigin(this.commonOrigin)

    // show current parameters 
    this.displayProbe();

    this.fullRoots = [];
    for (let aPath of this.rootsToExplore) {

      const abs = path.resolve(this.commonOrigin, aPath);
      let real;
      try {
        real = await fs.promises.realpath(abs);
      } catch (e) {
        if (e?.code === "ENOENT") {
          console.error("\n***************** rootToExplore not found:", aPath, "**** skipped *****\n ");
          continue;
        }
        throw e; // autre erreur (droits, etc.)
      }
      this.fullRoots.push(real);
    }

    this.collectOfRun = new Collect("root");
    if (this.probeRun.execution.mode == "parallel") {
      console.log(' run parallel ');
      await this.runParallel();
    }
    else {
      console.log(' run sequential ');
      await this.runSequential()
    };

    // main collected data  

    return this.collectOfRun;
  }
}

export default Explorateur;
