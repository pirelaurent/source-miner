
/*
 per source code profile, separate each line in three parts :
 - original
 - pure code
 - pure comment

 The goal is 
 1- to count :
 - number of original lines in source with line number
 - if orginal.trim() is empty, count an empty line.
 - number of empty lines 
 - number of lines with comment, partial or full 
 2- to apply the regex search including or not including the comments 

*/


const BASE_PROFILES = {
    cLike: {
        lineComments: ["//"],
        blockComments: [["/*", "*/"]],
        stringDelimiters: ['"', "'"],
        escapeStyle: "backslash",
    },
    java: {
        lineComments: ["//"],
        blockComments: [["/*", "*/"]],
        stringDelimiters: ['"""', '"', "'"], // ordre important
        escapeStyle: "backslash",
        multilineStrings: true,
    },
    jsLike: {
        lineComments: ["//"],
        blockComments: [["/*", "*/"]],
        stringDelimiters: ['"', "'", "`"],
        escapeStyle: "backslash",
    },

    sqlStd: {
        lineComments: ["--"],
        blockComments: [["/*", "*/"]],
        stringDelimiters: ["'"],
        escapeStyle: "sql",
    },

    yaml: {
        lineComments: ["#"],
        blockComments: [],
        stringDelimiters: ["'", '"'],
        escapeStyle: "mixed", // '' pour ', \ pour "
    },
    markdown: {
        lineComments: [],

        blockComments: [["<!--", "-->"]],

        stringDelimiters: ["`"],      // inline code
        escapeStyle: "backslash",     // \*, \_, \`, etc.
    }
};

const LANGUAGE_BY_EXTENSION = {
    // C-like
    c: BASE_PROFILES.cLike,
    h: BASE_PROFILES.cLike,
    cpp: BASE_PROFILES.cLike,
    hpp: BASE_PROFILES.cLike,
    rust: BASE_PROFILES.cLike,
    go: BASE_PROFILES.cLike,
    // java
    java: BASE_PROFILES.java,
    kt: BASE_PROFILES.java,
    // JS-like
    js: BASE_PROFILES.jsLike,
    mjs: BASE_PROFILES.jsLike,
    ts: BASE_PROFILES.jsLike,
    cs: BASE_PROFILES.cLike,
    // SQL
    sql: BASE_PROFILES.sqlStd,
    // YAML
    yaml: BASE_PROFILES.yaml,
    yml: BASE_PROFILES.yaml,
    // Shell
    sh: BASE_PROFILES.shell,
    bash: BASE_PROFILES.shell,
    zsh: BASE_PROFILES.shell,
    // markdown
    md: BASE_PROFILES.markdown,
};

// nouvelle table : clés ".java", ".js", ...

export const LANGUAGE_BY_DOT_EXTENSION = Object.fromEntries(
    Object.entries(LANGUAGE_BY_EXTENSION).map(([ext, profile]) => ["." + ext, profile])
);

/*
    split in two parts : code and comment using delimiters by language profile

*/

export function splitCodeAndComments(data, collect) {

    const lines = data.split(/\r?\n/);

    // delimiters
    let profile = LANGUAGE_BY_DOT_EXTENSION[collect.extension];
    if (!profile) {
        warn(`No comment profile for extension ${collect.extension} . All lines considered as code.`);
        // default empty profile
        profile = {
            lineComments: [],
            blockComments: [],
            stringDelimiters: [],
            escapeStyle: "none",
        };
    }

    let inBlockComment = false;
    let inString = false;
    let stringDelimiter = null;

    const results = [];

    for (const originalLine of lines) {
        let code = "";
        let comment = "";

        let i = 0;
        while (i < originalLine.length) {
            const ch = originalLine[i];
            const next = originalLine[i + 1];

            /* ---------- STRING ---------- */
            if (inString) {

                // fin de string (multi-char OK)
                if (originalLine.startsWith(stringDelimiter, i)) {
                    code += stringDelimiter;
                    i += stringDelimiter.length;
                    inString = false;
                    stringDelimiter = null;
                    continue;
                }

                // échappements
                if (profile.escapeStyle === "sql"
                    && stringDelimiter === "'"
                    && ch === "'"
                    && next === "'") {
                    code += "''";
                    i += 2;
                    continue;
                }

                if (profile.escapeStyle === "backslash" && ch === "\\") {
                    code += ch + next;
                    i += 2;
                    continue;
                }

                code += ch;
                i++;
                continue;
            }

            /* ---------- BLOCK COMMENT ---------- */
            if (inBlockComment) {
                const [open, close] = profile.blockComments[0];
                if (ch === close[0] && next === close[1]) {
                    inBlockComment = false;
                    comment += close;
                    i += 2;
                } else {
                    comment += ch;
                    i++;
                }
                continue;
            }

            /* ---------- BLOCK START ---------- */
            let consumed = false;
            for (const [open, close] of profile.blockComments) {
                if (originalLine.startsWith(open, i)) {
                    inBlockComment = true;
                    comment += open;
                    i += open.length;
                    consumed = true;
                    break;
                }
            }
            if (consumed) continue;

            /* ---------- LINE COMMENT ---------- */
            for (const lc of profile.lineComments) {
                if (originalLine.startsWith(lc, i)) {
                    comment += originalLine.slice(i);
                    i = originalLine.length;
                    break;
                }
            }

            if (i >= originalLine.length) break;

            /* ---------- STRING START ---------- due to triple """ in case java" */
            let stringStarted = false;
            for (const delim of profile.stringDelimiters) {
                if (originalLine.startsWith(delim, i)) {
                    inString = true;
                    stringDelimiter = delim;
                    code += delim;
                    i += delim.length;
                    stringStarted = true;
                    break;
                }
            }
            if (stringStarted) continue;

            /* ---------- CODE ---------- */
            code += ch;
            i++;
        }

        results.push({
            code: code.trimEnd(),
            comment: comment.trim(),
        });
    }

    return results;
}


/*
    reconstiture either code part either comments part 
*/
export function isolateSearchedData(results,  codePart, collect) {
    const parts = [];
    // recreate pure code data
    for (let k = 0; k < results.length; k++) {
        if (k > 0) parts.push('\n');
        let res = results[k];
        let code = codePart ? res.code : res.comment;
        parts.push(code);
        let tcode = code.trim().length;
        let tcomment = res.comment.length;
        if (tcomment > 0) collect.count_comment_lines++;
        if (tcode + tcomment == 0) collect.count_empty_lines += 1;
    }
    return parts.join('');
}