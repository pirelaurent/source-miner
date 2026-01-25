  /*
  for performance better to chunk and cut lines manually
  but side effects to be checked 
  *** NO WAY the chunk are not coherent with vsc
*/

import { log } from "./util/logger.mjs";
import fs from "fs";
import readline from "readline";
import { open } from "fs/promises";


/*
 new algorithm for comment split needs full lines 
*/
export async function readLinesOneShot(path, collect) {
  const text = fs.readFileSync(path, "utf8");
  const lines = text.split(/\r?\n/); // gère \n et \r\n
  return lines;
}


  /*
 experimental 
*/
  export async function readPdf(path) {
    const dataBuffer = fs.readFileSync(path);
    log('pdfParse to do')
    log(path);
/*     pdfParse(dataBuffer).then(async (data) => {
      // Make the function async
      console.log(data);
      const lines = data.text.split("\n");
      let max = lines.length;
      for (const [index, line] of lines.entries()) {
        console.log(line);
        let percent = ((100 * index) / max).toFixed(2);
        await this.processLine(percent + "%:" + line, context); // Use await here
        if (context.stopReadingLines) {
          break; // Exits the loop
        }
      }
    }); */
  }