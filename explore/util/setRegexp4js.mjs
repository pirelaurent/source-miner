/*
regex can have flags . 
as we search globally in case several match, add g flag if not set
*/

import { log } from "./logger.mjs"


// on command line /flags are at the end . Separation below 
export function parseCliRegexArg(arg) {
  if (!arg) return null;

  const s = arg.trim();

  // 1) JSON form: {"pattern":"...","flags":"..."}
  if (s.startsWith("{")) {
    try {
      const obj = JSON.parse(s);
      if (typeof obj.pattern !== "string") {
        throw new Error("missing pattern");
      }
      return {
        pattern: obj.pattern,
        flags: obj.flags ?? ""
      };
    } catch (e) {
      console.error("**** Invalid JSON regex argument:", s);
      process.exit(1);
    }
  }

  // 2) /pattern/flags form
  if (s.startsWith("/")) {
    const lastSlash = s.lastIndexOf("/");
    if (lastSlash > 0) {
      return {
        pattern: s.slice(0, lastSlash + 1), // "/pattern/"
        flags: s.slice(lastSlash + 1)
      };
    }
  }

  // 3) pattern nu
  return {
    pattern: s,
    flags: ""
  };
}
/*
  accept  
soit un yaml complet : 
regex:
  pattern: '/where is Charlie/'
  flags: 'g'

soit un yaml forcé : 
/comment/g  
*/

export function setRegexp4js(regexFromYaml) {
  // 1) Normalisation d'entrée
  let pattern;
  let flags = "";
  if (typeof regexFromYaml === "string") {
    // ex: "/comment/g" ou "comment"
    const s = regexFromYaml.trim();

    if (s.startsWith("/")) {
      const lastSlash = s.lastIndexOf("/");
      if (lastSlash <= 0) {
        console.error("**** Invalid regex format:", s);
        process.exit(1);
      }
      pattern = s.slice(1, lastSlash);
      flags = s.slice(lastSlash + 1);
    } else {
      pattern = s;
      flags = "";
    }
  } else if (regexFromYaml && typeof regexFromYaml === "object") {
    // ex: { pattern: '/where is Charlie/', flags: 'g' } ou pattern nu
    if (typeof regexFromYaml.pattern !== "string") {
      console.error("**** Invalid regex configuration:", regexFromYaml);
      process.exit(1);
    }

    pattern = regexFromYaml.pattern;
    flags = regexFromYaml.flags ?? "";

    // si pattern est de la forme /.../
    if (pattern.startsWith("/") && pattern.endsWith("/")) {
      pattern = pattern.slice(1, -1);
    }
  } else {
    console.error("**** Invalid regex configuration:", regexFromYaml);
    process.exit(1);
  }

  // 2) Validation flags
  if (typeof flags !== "string" || !/^[gimsuy]*$/.test(flags)) {
    console.error("**** Invalid regex flags:", flags);
    process.exit(1);
  }

  // 3) Forcer 'g' et 'm'
  if (!flags.includes("g")) flags += "g";
  if (!flags.includes("m")) flags += "m";

  // 4) Compilation
  try {
    return new RegExp(pattern, flags);
  } catch (e) {
    console.error("**** Invalid regex:", pattern, flags);
    console.error(e.message);
    process.exit(1);
  }
}

// compile list of includes into regex list 

export function compileIncludesRegex(list) {
  return (list ?? []).map((s) => {
    // sécurité
    if (s instanceof RegExp) return s;

    const str = String(s);

    // 1) vraie regex écrite /pattern/flags
    const m = str.match(/^\/(.+)\/([gimsuy]*)$/);
    if (m) {
      try {
        return new RegExp(m[1], m[2]);
      } catch (e) {
        throw new Error(`Invalid regex in config: ${str}`);
      }
    }

    // 2) fallback historique : substring (escape)
    return new RegExp(escapeRegex(str));
  });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export function regIncludes(text, regexList) {
    // pas de règles => ne rejette pas
  if (!regexList || regexList.length === 0) return false;
  
  for (const rx of regexList) {
    if (rx.test(text)) return true;
  }
  return false;
}

export function regNotIncludes(text, regexList) {
    // pas de règles => ne rejette pas
  if (!regexList || regexList.length === 0) return false;

  if (regexList.length === 0) return false; // aucun critère → ne pas skipper

  for (const rx of regexList) {
    if (rx.test(text)) {
      return false; // au moins un match → on garde
    }
  }
  return true; // aucun match → on skip
}
/*

matchAll documentation 

renvoie un itérateur ; chaque élément produit par l’itérateur est un objet “match” (un RegExpMatchArray) similaire à ce que renvoie RegExp.exec().

Pour un match donné :

match[0] : le texte qui a matché en entier
match[1], match[2], … : les groupes capturants (...) (s’ils existent)
match.length : nombre d’éléments (1 + nbGroupesCapturants)
match.index : position (offset) du match dans la chaîne
match.input : la chaîne d’origine (parfois présent)
match.groups : objet des groupes nommés (?<name>...) (si présents)

Exemple concret

Regex : /ab(\d+)-(\w+)/g sur "xxab12-foo yyab7-bar"

matchAll produira deux match :

1er match :
match[0] = "ab12-foo"
match[1] = "12"
match[2] = "foo"
match.index = 2
match.length = 3

2e match :
match[0] = "ab7-bar"
match[1] = "7"
match[2] = "bar"
match.index = 13
match.length = 3
*/