import { readProbeFromFile as readProbeFromFile } from "../explore/probeUtil.mjs";
import assert from "node:assert/strict";
import { log } from "../explore/util/logger.mjs";
import Explorateur from "../explore/explorateur.mjs";
import path from 'node:path';
import fs from 'node:fs';

/*
    extends Explorateur to change behaviors 
*/
class TestExplorateur extends Explorateur {
    constructor(title, probe, expectedLines, expectedMatches, description, logCollect = false) {
        super(probe);
        this.expectedLines = expectedLines;
        this.expectedMatches = expectedMatches;
        this.description = description;
        this.logCollect = logCollect;
        this.title = title;
    }

    // overwrite displayProbe to avoid cluttering test output 
    displayProbe() {
        //super.displayProbe() // uncomment if need main probe parts on console
    }

    // overwrite end of scan to get results and compare 

    endOfARootPathExploration(root, collect) {

        super.endOfARootPathExploration(root, collect) // uncomment to have more details 

        if (this.logCollect) console.log(collect);
        try {
            let ok = (collect.count_retained_lines == this.expectedLines);
            ok = ok && (collect.count_retained_match == this.expectedMatches);

            assert.strictEqual(ok, true, `expected: ${this.expectedLines} lines, ${this.expectedMatches} matches . Found ${collect.count_retained_lines}, ${collect.count_retained_match} `);

            console.log(`✅ Search test ${probe.regex}  ${this.description} (${this.expectedLines},${this.expectedMatches}) test passed`);
        } catch (err) {
            console.error(`❌ Test failed: ${probe.regex} ${err.message}`);
            // ne pas re-throw si tu veux éviter le rejet de la promise
        }
    }
    // override to add a title 
    async run() {
        console.log(this.title);
        return super.run();
    }
    /* ou encore 
    async run() {
        console.log(this.title);
        await super.run();
    }
    */
} // TestExplorateur

/*
    The serie of test share a probe loaded first then patched for each test
*/

// check for a valid probe to share main parameters  
let probeFileName = "./testProbe.yaml";
const resolvedProbeFile = path.resolve(probeFileName);
if (!fs.existsSync(resolvedProbeFile)) {
    console.error(`Uses ${probeFileName} unreachable.  Please run the test from the root of the project where test/testProbe.yaml is located.`);
    process.exit(1);
}
// base probe 
let probe = readProbeFromFile(probeFileName);
let title = "";

//------------------------------//------------------------------//------------------------------
title = ('\n------------ 1- tests for search of keywords:  comments not ignored ----------');
// reduce to java
probe.keepExtension.includes = [".java"];
// restrict to this very named file 
probe.skipFileIfName.notIncludes = ['JavaCommentAllCases'];
// search the word comment everywhere including in comments // / * * / etc.
probe.ignoreComments = 'off';
// case sensitive (g is implicit to search several matches per line )
probe.regex = '/comment/';
//probe.traceMatchingLines = "on"
await new TestExplorateur(title, probe, 31, 33, "count all lines <> all matches case sensitive").run()


// case insensitive
title = ('\n------------ 2- tests for search of keywords:  comments not ignored , ignoring case ----------');
probe.ignoreComments = 'off';
probe.regex = '/comment/i';
//probe.traceMatchingLines = "on"
await new TestExplorateur(title, probe, 35, 37, "count all lines <> all matches case sensitive").run();



title = ('\n------------ 3-tests for search of keywords: ignoring comments , ignoring case----------');
probe.skipFileIfName.notIncludes = ['JavaCommentAllCases'];
probe.ignoreComments = 'on';
probe.regex = '/comment/i';
//probe.traceMatchingLines = "on"
await new TestExplorateur(title, probe, 9, 9, "count all lines <> all matches case sensitive", false).run();

//------------------------------ SQL comment

title = ('\n------------ 4-Starting tests for search including comments or not in SQL files ----------');

probe.keepExtension.includes = [".sql"];
probe.skipFileIfName.notIncludes = ['SQLCommentAllCases.sql'];
probe.ignoreComments = 'off';
probe.regex = '/SELECT/';
//probe.traceMatchingLines = "on"
// 48 SELECT dans le source  5 lignes avec 2 SELECT -> 43 lignes 
await new TestExplorateur(title, probe, 43, 48, " count words SELECT including in comments", false).run();


title = ('\n------------ 5-Starting tests for search  in SQL files ');
//----- must have only real SELECT if sql dialect
probe.keepExtension.includes = [".sql"];
probe.skipFileIfName.notIncludes = ['SQLCommentAllCases.sql'];
probe.ignoreComments = 'on';
probe.regex = '/SELECT/';

await new TestExplorateur(title, probe, 31, 32, " count word SELECT after excluding comments", false).run();

title = ('\n------------ All tests passed ----------');
