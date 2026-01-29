/*
 a tool to check if there is space before CR as vsc don't care but github yes 
*/

import { getDefaultProbe } from "../explore/probeUtil.mjs";

import { log } from "../explore/util/logger.mjs";
import Explorateur from "../explore/explorateur.mjs";



let probe = getDefaultProbe();
// perimeter 
probe.commonOrigin = '../';
probe.rootsToExplore = []

probe.skipDirIfName.includes = ['package','node_modules'];
probe.keepExtension.includes =['.md'] 

//probe.displayProbe = "off";

// pattern dans une chaîne (tous les antislashs sont doublés)

probe.regex = '^(?![ \\t]{4,})(?![ \\t]*-)(?![ \\t]*#).*[^ \\t\\r\\n][ \\t]{0,2}(?:\\r?\\n|$)';
probe.traceMatchingLines = 'on';  


let result = await new Explorateur(probe).run();
//console.log(JSON.stringify(result,null,4))