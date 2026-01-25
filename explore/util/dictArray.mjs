import { log } from "console";

/*
 class with a dict holding an array of (any)things  key : [ thing1, thing2 etc ])
*/
class DictArray {
  constructor() {
    const dico = Object.create({});
    Object.assign(this, dico);
  }

  /*
 return number of elements
*/
  totalEntries() {
    return Object.entries(this).length;
  }

  totalElements() {
    let count = 0;
    for (const element in this) {
      count += this[element].length;
    }
    return count;
  }

  /*
  add a new element in array of entry key
  if entry doesn't exist, it is first created 
  The new element is added to the array by add("mykey",myData)
  If we don't want duplicated data in the array of this key : add("mykey",myData,true)
*/
  add(key, thing, unique = false) {
    if (this.hasOwnProperty(key)) {
      if (!unique || !this[key].includes(thing)) {
        this[key].push(thing);
      }
    } else {
      this[key] = [thing];
    }
  }

  // fusion d'un autre dans le courant 
  addAll(otherDictArray) {

    // merge to dict 

    for (const key of Object.keys(otherDictArray)) {
      const elements = otherDictArray[key];
      for (const e of elements) {
        this.add(key, e);
      }
    }
  }

  // list 
  sortedByValueDesc() {
    return [...this.items].sort((a, b) => b.value - a.value);
  }


  /*
   Return an array of [key, count] sorted by count descending
   */
  sortedByOccurrencesDesc() {
    const result = [];

    for (const [key, value] of Object.entries(this)) {
      if (Array.isArray(value)) {
        result.push([key, value.length]);
      }
    }

    return result.sort((a, b) => b[1] - a[1]);
  }

  // liste ordonnées

  listOderedByKey() {
    let result = "";
    // Trier les clés alphabétiquement
    const sortedKeys = Object.keys(this).sort();
    // Afficher l'objet en ordre alphabétique
    sortedKeys.forEach((key) => {
      result += `${key}: ${this[key]}\n`;
    });
    return result;
  }

  /*
 search and count entries with size of array between min and max
 detail : show keys and counts
 fullDetail: show keys and array values
*/
  showEntriesWithArraySizeInMinMax(
    min = 0,
    max = 1000000,
    detail = false,
    fullDetail = false
  ) {
    let count = 0;
    let result = "";
    for (const element in this) {
      let leafSize = this[element].length;
      if (leafSize > min && leafSize <= max) {
        if (detail) result += "\n" + element + " : " + leafSize + " values";
        if (fullDetail)
          this[element].forEach((value) => (result += " " + value + ","));
        count += 1;
      }
    }
    console.log(
      "------------found",
      count,
      " elements with array size between ",
      min,
      " and ",
      max,
      "entries",
      result
    );
  }

  /*
  rather than an array, 
  the value of an entry is a counter
*/

  countOccurences(key) {
    if (this.hasOwnProperty(key)) {
      this[key] += 1;
    } else {
      this[key] = 1;
    }
  }

/*
   regex with OR and group can collect composite keys. 
   Here they are filtered in a new dictionnaries 
  */


  filterKeysByPrefix(prefix) {
    const out = new DictArray();
    for (const [k, arr] of Object.entries(this)) {
      if (k.startsWith(prefix)) out[k] = arr;
    }
    return out;
  }

  // option: plusieurs préfixes
  filterKeysByPrefixes(prefixes) {
    const out = new DictArray();
    for (const [k, arr] of Object.entries(this)) {
      if (prefixes.some(p => k.startsWith(p))) out[k] = arr;
    }
    return out;
  }



  /*
    With a dict counting occurences this method returns distincts names 
    for a key aaa, it will return aaa, next time aaa(1)  aaa(2) etc. 
    This is useful to create graphs with distinct shortnames when conflicts occurs
  */

  nextNameFor(key) {
    this.countOccurences(key);
    let addOn = this[key] > 1 ? `(${this[key] - 1})` : "";
    return key + addOn;
  }
} //class

/*
 wrap a standard {} to add direct method just to have a counter 
*/
class OccurrenceCounter {
  constructor() {
    const dico = Object.create({});
    Object.assign(this, dico);
  }

  // Méthode pour ajouter des éléments et compter leurs occurrences
  add(key) {
    if (this.hasOwnProperty(key)) {
      this[key] += 1;
    } else {
      this[key] = 1;
    }
  }

  listAll() {
    let result = "";
    for (const element in this) {
      result = result + element + " : " + this[element] + "\n";
    }
    return result;
  }

  // liste ordonnées
  listOderedByValue() {
    let result = "";
    // Trier les clés
    const entries = Object.entries(this);
    const sortedEntries = entries.sort((a, b) => b[1] - a[1]);

    sortedEntries.forEach(([key, value]) => {
      result += `${value} : ${key}\n`;
    });

    return result;
  }


  
}



export { DictArray };
