import { log, warn, error } from "./util/logger.mjs";
import { DictArray } from "./util/dictArray.mjs";
/*
    due to async // each individual analysis must fill its own collect
    collects are then grouped at an higher level up to root 
*/

export class Collect {
  constructor(category = "") {
    // to help trace
    this.category = category;
    // directories
    this.count_all_dir = 0;
    this.count_retained_dir = 0;
    this.has_sub_dir = false;
    // files

    this.count_all_visited_files = 0;
    this.count_matching_files = 0;
    //source code
    this.count_all_lines = 0;
    this.count_empty_lines = 0;
    this.count_comment_lines = 0;
    this.count_all_tested_lines = 0;
    this.count_retained_lines = 0;
    this.count_retained_match = 0;
    // part for an exploration of a file 
    this.regex = null;
    this.fullPath = "";  // from OS root
    this.shortPath = ""; // relative to commonOriginOfRoots
    this.displayPath = ""; // retained output 
    this.extension = "";
    this.match = false;   // if at least one match.

    // dictionary for synthesis .  A dictArray is (key: array of elements)
    // key : match , array of paths matching
    this.key_array_of_path = new DictArray();
  }

  /* 
  cumulate a new arriving collect at upper level
  */

  consolidate(other) {
    if (!other) return;

    // Direct increments for numeric counters
    this.count_all_dir += other.count_all_dir;
    this.count_retained_dir += other.count_retained_dir;
 
    this.count_all_visited_files += other.count_all_visited_files;
    this.count_matching_files += other.count_matching_files;
    // lines of code 
    this.count_all_lines += other.count_all_lines;
    this.count_all_tested_lines += other.count_all_tested_lines;
    this.count_empty_lines += other.count_empty_lines;
    this.count_retained_lines += other.count_retained_lines;
    this.count_retained_match += other.count_retained_match;
    this.count_comment_lines += other.count_comment_lines;

    // Merge DictArray results
    this.key_array_of_path.addAll(other.key_array_of_path);
  }
}
