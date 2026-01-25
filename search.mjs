/*
 standard minimum search 
*/

import Explorateur from "./explore/explorateur.mjs";
import { getProbeFromCommandLine } from "./explore/commandLine.mjs";

// prepare an instance of Explorateur with a read probe (includes regex)from command line
// start exploration . Node will wait until finished
let probe = getProbeFromCommandLine();
let explore = new Explorateur(probe);
await explore.run();
