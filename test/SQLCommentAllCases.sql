-- commentaire seul

SELECT 1; -- commentaire inline sur ce SELECT

/* commentaire block simple avant ce SELECT */
SELECT 2;

/*
block multi-lignes
qui s'étend sur
plusieurs lignes 
pour ce SELECT
*/
SELECT 3;

/* block inline avec SELECT*/ SELECT 4;

/* début et fin sur la même ligne que le SELECT */ SELECT 5; /* après code */

/* block multi-lignes
   contenant du texte ressemblant à une fin */
SELECT 6;

/* block contenant -- ce n'est PAS une fin de ligne pour PostgreSQL */
SELECT 7;

SELECT '-- ceci n est pas un commentaire dans une string';
SELECT "/* ni ceci */ dans une string";
SELECT '/* ou ceci */ dans une string';
SELECT "-- ni cela dans une string";

/*
 block contenant du texte ressemblant à slash* sans imbrication
 Les regex doivent gérer ce cas sans supposer de profondeur
 suivi de SELECT
*/ 

SELECT 8;

/* commentaire contenant le mot clé COMMENT */
SELECT 9;

/* commentaire avec   espaces    et    tabs		*/
SELECT 10;

/* block */ SELECT 11; /* block juste après */ SELECT 12;

/* block vide */ SELECT 13;

/* commentaire collé */SELECT 14;

/*- commentaire commençant par tiret et étoile avec SELECT -*/
SELECT 15;

/* commentaire contenant le marqueur de fin * / (séparé volontairement pour ne pas fermer) puis SELECT */
SELECT 16;

/*
 lignes blanches qui suivent
 (pour tester le contexte en lecteur ligne par ligne)
 Avant un SELECT
*/


SELECT 17;

/*
 commentaire contenant des mots "comment", "uncomment", "commentaire"
 mais ce ne sont pas des commentaires supplémentaires
 et SELECT suit après
*/
SELECT 18;

/* séquence trompeuse : le mot "* /" découpé
    * /
 ne ferme pas le commentaire car l’astérisque et le slash ne sont pas collés
 puis SELECT suit après
*/
SELECT 19;

-- ligne suivant une fin de commentaire suivi d'un SELECT
SELECT 20;

/* un block
   sans imbrication
   avec symboles avant un SELECT */ SELECT 21;

/* commentaire avec parenthèses () [] {} < > suivi de SELECT*/
SELECT 22;

/* commentaire avec caractères spéciaux !@#$%^&*() et SELECT*/
SELECT 23;

/* commentaire avant code */
SELECT 24;  /* commentaire après code */

/* commentaire multi instructions avec 2 SELECT*/
SELECT 25;
SELECT 26;

/* commentaire contenant "*/ SELECT 27; /*" les guillemets n'arrêtent pas la fin de commentaire.*/
SELECT 27;
