/*
    command line to get probe as second parameter and regex in folllowing parameter
    
    node appName.mjs probePath/yam  '/regex/options/' 

*/

import { readProbeFromFile } from "./probeUtil.mjs";
import {parseCliRegexArg} from "./util/setRegexp4js.mjs"
import { log } from "./util/logger.mjs";

import path from 'node:path';
import fs from 'node:fs';


export function getProbeFromCommandLine() {

    let probe;
    const args = process.argv.slice(2); // slice(2) removes the first two entries (node and script path)
    if (!args[0]) {
        console.log(
            "*** must be run as :  node.js yourApp.mjs filePathOfProbe  '/regex/option/' ");
        process.exit(0);

    } else {
        // load context form file json or yaml
        let probeFileName = args[0];


        // si pas d'extension, on ajoute .yaml  pour se simplifier la vie
        if (!path.extname(probeFileName)) {
            probeFileName = `${probeFileName}.yaml`;
            //log(`--- added .yaml extension to probe file name , now : ${probeFileName}`);
        }

        // check existence
        const resolvedProbeFile = path.resolve(probeFileName);
        if (!fs.existsSync(resolvedProbeFile)) {
            console.error(`Unknown file for probe . check path : ${resolvedProbeFile}  - program exited`);
            process.exit(1);
        }

        // read probe as yaml/json 

        probe = readProbeFromFile(probeFileName);
        //console.log("PLA"+JSON.stringify(probe,null,4));

    }

    /*
     Better to give regex on command line rather than change default in the probe
    */
    if (args[1]) {
        probe.regex = parseCliRegexArg(args[1]);

    }
    return probe;
} 
