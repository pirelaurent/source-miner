/* ============================================================
   JavaCommentAllCases.java
   This file is a static corpus of ALL tricky Java comment cases.
   Intended as input for testing comment-stripping logic.
   ============================================================ */

public class JavaCommentAllCases {

    // ----------------------------------------------------------
    // 1. Simple single-line comments
    // ----------------------------------------------------------

    int a = 1; // trailing comment
    // full line comment
    int b = 2;

    // ----------------------------------------------------------
    // 2. False single-line comments inside strings
    // ----------------------------------------------------------

    String s1 = "http://example.com/path";
    String s2 = "this is not a comment: // really";
    String s3 = "// entirely inside string";

    // ----------------------------------------------------------
    // 3. False block comments inside strings
    // ----------------------------------------------------------

    String s4 = "this is not /* a comment */ at all";
    String s5 = "/* not a comment";
    String s6 = "not a comment */";

    // ----------------------------------------------------------
    // 4. Escaped quotes and comment markers
    // ----------------------------------------------------------

    String s7 = "escaped quote: \" // still string";
    String s8 = "escaped slash: \\\\// still string";
    String s9 = "escaped block markers: \\/* not comment *\\/";

    // ----------------------------------------------------------
    // 5. Character literals that look like comments
    // ----------------------------------------------------------

    char c1 = '/';
    char c2 = '*';
    char c3 = '"';
    char c4 = '\''; // trailing comment

    // ----------------------------------------------------------
    // 6. Real block comments
    // ----------------------------------------------------------

    /* full block comment */
    int d = 4;

    int e = 5; /* inline block comment */ int f = 6;

    // ----------------------------------------------------------
    // 7. Multi-line block comments with fake content
    // ----------------------------------------------------------

    /*
       block comment line
       contains fake // comment
       contains fake "string"
       contains fake 'char'
       contains fake /* nested start
       ends here
    */
    int g = 7;

    // ----------------------------------------------------------
    // 8. Nested-looking block comments (Java does NOT nest)
    // ----------------------------------------------------------

    /* outer block start
       /* inner-looking block (not real)
       outer block ends here */
    int h = 8;

    // ----------------------------------------------------------
    // 9. Comments adjacent to tokens
    // ----------------------------------------------------------

    int i/*comment*/=/*comment*/9/*comment*/;

    // ----------------------------------------------------------
    // 10. Strings concatenated with comment-like tokens
    // ----------------------------------------------------------

    String s10 = "a" + "/*" + "b" + "//" + "c" + "*/";

    // ----------------------------------------------------------
    // 11. Text blocks (Java 15+)
    // ----------------------------------------------------------

    String s11 = """
        This is a text block.
        It may contain // and /* and */ without being comments.
        Example: "http://host//path"
        Example: "/* not a comment */"
        """;

    // ----------------------------------------------------------
    // 12. Comments before and after code
    // ----------------------------------------------------------

    /* comment */ int j = 10;
    int k = 11; /* comment */

    // ----------------------------------------------------------
    // 13. Edge cases
    // ----------------------------------------------------------

    String s12 = "ends here"; // comment after string
    /* comment */ int l = 12;

    String s13 = "regex-like: \\/\\* not comment \\*\\/";
}
