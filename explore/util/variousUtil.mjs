#!/usr/bin/env node
import { log } from "./logger.mjs";



import os from "os";
import path from "path";

/*
  get a real root if some key chars in dir exprtession 
*/

export function resolveCommonOrigin(commonOrigin, cwd = process.cwd()) {
  if (!commonOrigin) return cwd; // défaut

  let p = commonOrigin;

  // expand "~/" only
  if (p === "~" || p.startsWith("~/")) {
    p = path.join(os.homedir(), p.slice(2)); // "~/" -> homedir
  }

  // resolve relative paths like "./xxx", "../x", "xxx"
  if (!path.isAbsolute(p)) {
    p = path.resolve(cwd, p);
  }

  return p;
}




/*
 Utilitaire : transforme un texte brut en regex échappée .
  Exemple : "mon.texte*" => mon\.texte\*
  set automatically when adding /? at  end of user regex input
*/
 export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/*
 kind of trim including tabs
 not used here, available for inerithance (aka explorerPackages)
*/

export function  cleanLine(line) {
    line = line.trimStart(); // avoid blank at beginning
    line = line.replace(/^\t+/, ""); // avoid tab at new beginning
    return line;
  }

/*
 useful: metrology properly formatted elapsed time since start date
*/
  export function logElapsedTimeSince(start) {
    const end = new Date();
    const timeElapsed = end - start;
    const seconds = Math.floor(timeElapsed / 1000);
    const milliseconds = timeElapsed % 1000;
    return ` ${seconds}s ${milliseconds}ms `;
  }


// format number with locale for output
export function numOut(num){
  return num.toLocaleString('fr-FR');
}

/*
 search line feed to separate lines in a text . returns indexes 
*/
export function computeLineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) { // '\n'
      starts.push(i + 1);
    }
  }
  return starts;
}



/*
 dichotomie : returns the line number taht include char at index 
*/
export function lineNumberFromIndex(lineStarts, index) {
  let lo = 0, hi = lineStarts.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lineStarts[mid] <= index) lo = mid + 1;
    else hi = mid - 1;
  }
  return hi + 1; // lignes 1-based
}
/*
  lineStarts : an array of char position for each new line 
*/
export function lineTextFromLineNumber(text, lineStarts, lineNumber) {
  const i = lineNumber - 1;               // convert to 0-based
  const start = lineStarts[i];
  if (start == null) return null;

  const end = (i + 1 < lineStarts.length) ? lineStarts[i + 1] - 1 : text.length;

  // remove optional trailing '\r' for CRLF files
  let line = text.slice(start, end);
  if (line.endsWith("\r")) line = line.slice(0, -1);
  return line;
}

/*
  Align titles 
*/
export function alignTitle(text=null, size = 80, border = 0){
  if(!text) return '-'.repeat(size);
if (border !=0) text = ' '.repeat(border)+text+' '.repeat(border);

  let free = size - text.length-2; // as we surround one space each side
  if (free <=2) return text; 

  let t = '-'.repeat(free/2) +" ";
  t+=text+" ";
  let rab = size - t.length;
  t+= '-'.repeat(rab);
  return t;
}