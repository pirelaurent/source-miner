/*
  for debug, either using console.log, use these log(), warn(), error()
  they put in message the file and line number of the caller
  so that we know where the message comes from
*/

export function log(...args) {
  const loc = getCallerLocation();
  console.log(`[${loc}]`, ...args);
}

export function warn(...args) {
  const loc = getCallerLocation();
  console.warn(`[${loc}]`, ...args);
}

export function error(...args) {
  const loc = getCallerLocation();
  console.error(`[${loc}]`, ...args);
}

/// internal function to get caller file and line number

function getCallerLocation() {
  const err = new Error();
  const stack = err.stack ? err.stack.split('\n') : [];

  // On ignore la 1ère ligne ("Error")
  for (let i = 1; i < stack.length; i++) {
    const line = stack[i];

    let m =
      line.match(/\((.*):(\d+):(\d+)\)/) || // avec parenthèses
      line.match(/at (.*):(\d+):(\d+)/);    // sans parenthèses

    if (!m) continue;

    let file = m[1];
    const lineNumber = m[2];

    // Nettoyage éventuel
    file = file.replace(/^file:\/\//, '');
    const shortFile = file.split(/[\\/]/).slice(-1)[0];

    // ⚠ sauter les lignes qui viennent du logger lui-même
    if (shortFile === 'logger.mjs') continue;

    return `${shortFile}:${lineNumber}`;
  }

  return 'unknown';
}


