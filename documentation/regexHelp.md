# Regular expressions (regex) 

Regex are powerful tools for matching patterns in strings.   

## best advice : ask an AI   
 

 I ask an AI to get a regex for catching instanciations *new someClass* from java sources :     
 I precise 'for js code' (as escaping \ of regex as \\ is significant in js)     
 ( Think aboout to precise your usage to AI : for javascript, for yaml, for shell. ).   
 
      regex.pattern =
      '\\bnew\\s+([A-Za-z_]\\w*(?:\\.[A-Za-z_]\\w*)*)(?:\\s*<[^>]+>)?\\s*(?:\\(|\\[)';
      regex.flags = 'g';

 The same for command line : 

      node search.mjs probe.yaml '/\bnew\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)(?:\s*<[^>]+>)?\s*(?:\(|\[)/g'


While constructing such a regex manually is headache, an AI can not only generate it but also explain its structure and behavior.   

=> ask AI

--- 

Some basic regex concepts you may want to know can be helpful.

1. **Literal Characters**:
   - Matches exact characters. For example, `cat` matches the string "cat".

2. **Wildcards**:
   - `.` matches any single character except newline. For example, `c.t` matches "cat", "cot", "cut", etc.

3. **Character Classes**:
   - `[abc]` matches any one of the characters a, b, or c.
   - `[a-z]` matches any lowercase letter.
   - `[0-9]` matches any digit.
   - `[^abc]` matches any character except a, b, or c.

4. **Predefined Character Classes**:
   - `\d` matches any digit, equivalent to `[0-9]`.
   - `\D` matches any non-digit.
   - `\w` matches any word character (alphanumeric + underscore), equivalent to `[a-zA-Z0-9_]`.
   - `\W` matches any non-word character.
   - `\s` matches any whitespace character (spaces, tabs, line breaks).
   - `\S` matches any non-whitespace character.

5. **Anchors**:
   - `^` asserts the position at the start of a line.
   - `$` asserts the position at the end of a line.

6. **Quantifiers**:
   - `*` matches 0 or more occurrences of the preceding element.
   - `+` matches 1 or more occurrences of the preceding element.
   - `?` matches 0 or 1 occurrence of the preceding element.
   - `{n}` matches exactly n occurrences of the preceding element.
   - `{n,}` matches n or more occurrences of the preceding element.
   - `{n,m}` matches between n and m occurrences of the preceding element.

7. **Groups and Alternation**:
   - `(abc)` creates a group that matches the exact sequence "abc".
   - `|` acts as an OR operator. For example, `a|b` matches "a" or "b".
   - `(?:...)` creates a non-capturing group.

8. **Escaping Special Characters**:
   - To match special characters like `.` or `*`, escape them with a backslash (`\`). For example, `\.` matches a literal dot.

9. **Lookahead and Lookbehind**:
   - `(?=...)` is a positive lookahead assertion. 
     - It ensures that what follows the current position in the string matches the pattern inside the lookahead.
   - `(?!...)` is a negative lookahead assertion. 
     - It ensures that what follows the current position does not match the pattern inside the lookahead.
   - `(?<=...)` is a positive lookbehind assertion. 
     - It ensures that what precedes the current position in the string matches the pattern inside the lookbehind.
   - `(?<!...)` is a negative lookbehind assertion. 
     - It ensures that what precedes the current position does not match the pattern inside the lookbehind.

---   

### Regex differences between Command Line, YAML, JavaScript

The tool accepts regular expressions from three contexts.   
Each context has different escaping rules.    

### 1) Command line (CLI)

- Regex arguments are shell strings.   
- Always quote them.    
- On macOS / Linux / WSL, prefer single quotes.   

Use

      node search.mjs probe.yaml '/pattern/flags'


Notes
- Do not escape backslashes when using single quotes.  
- /pattern/flags is the safest and recommended CLI form.  

⸻

### 2) YAML probe files
- YAML values are passed as strings to JavaScript.   
- Backslashes must be escaped once.  
- Both combined and split forms are accepted.  

Recommended

      regex:
      pattern: '\\bword\\s+\\w+'
      flags: 'gi'

Alternative


      regex: '/\bword\s+\w+/gi'


⸻

### 3) JavaScript code
- JavaScript strings require double escaping.   
- Prefer the split form to avoid ambiguity.   


      probe.regex = {
      pattern: '\\bword\\s+\\w+',
      flags: 'gi'
      };


⸻

### General recommendations

- Internally, you can normalize to *{ pattern:   , flags:   }*.  
- Use */pattern/flags* only for CLI convenience.   
- If a regex works in JS but not in YAML or CLI, check escaping first or ask AI.   

⸻

### Common mistakes to avoid

- Confusing regex literals (/.../) with strings.      
- Forgetting that \ must be escaped in YAML and JS.  
- Passing JavaScript object literals on the command line.  

⸻

