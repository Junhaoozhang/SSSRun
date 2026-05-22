# Patrons de Disseny - Prototip Funcional (SSSRun)

A continuació es documenten els nous patrons de disseny d'interfície i experiència d'usuari (UI/UX) (basats en els referenciats a [ui-patterns.com](https://ui-patterns.com/patterns)) que s'han aplicat explícitament en el desenvolupament del prototip funcional, posant l'accent de ple en la naturalesa gamificada i social del sistema. No es repeteixen els de lliuraments anteriors.

## 1. Leaderboard
S'ha dissenyat una vista sencera dedicada al rànquing d'usuaris (`LeaderboardView.vue`), que compara les puntuacions, distàncies i constància de la comunitat.
* **Justificació:** Com indica ui-patterns, el Leaderboard és el patró rei per la recompensa social i la gamificació. Facilita la retenció a l'activar l'esperit competitiu mitjançant taules comparatives (amb medalles pel top 3). Fomenta que l'usuari interaccioni més sovint amb la "rutina" (córrer o caminar més) per escalar posicions i ser validat front als altres jugadors.

## 2. Friend
S'ha consolidat un sistema de relacions socials recíproques on es poden enviar sol·licituds, afegir usuaris o eliminar-los (`SocialView.vue`).
* **Justificació:** Dins la categoria social de ui-patterns, el concepte de "Friend" o amic estableix un lligam relacional que augmenta enormement l'adhesió. Al permetre a l'usuari triar exactament amb qui competeix o qui pot veure el seu estat ("en línia", reptes aconseguits), es promou el compromís periòdic mutu, fonamentant el propòsit d'invitar a nous usuaris a la plataforma perquè s'afegeixin al cercle de joc.

## 3. Friend List
La presentació del panell d'amics (`SocialView.vue`) està dissenyada imitant una llista de contactes clàssica interactiva. Inclou l'avatar, el nivell, senyalització mitjançant codificació de colors ("verd en línia, gris offline") i la principal mètrica, les pomes acumulades.
* **Justificació:** El patró *Contact List* de ui-patterns permet a l'usuari escanejar ràpidament tota la seva xarxa relacional. Ordenant dinàmicament per "en línia", garantim que el llistat obeeix a necessitats funcionals (jugadors potencials disponibles) afegint claredat respecte a l'estatus de cadascú i aportant un element recognoscible derivat de les apps clàssiques de missatgeria per una ràpida interpretació visual.

## 4. Module Tabs (Pestanyes de Mòdul)
S'ha aplicat a la navegació interna de diferents pantalles, destancant-se, per exemple, a la vista «Social» (per alternar de manera neta entre *Amics* i *Grups*) i al «Leaderboard» (per alternar les taules de resultats de la comunitat *Global* respecte al filtre de només *Amics*).
* **Justificació:** Aquest patró de navegació i gestió de dades s'utilitza per contextualitzar elements equivalents sobre el mateix assumpte. Aconseguim que l'usuari consumeixi les dades dins la pantalla o mòdul on ja es troba i no forcem redireccions innecessàries al servidor ni recàrregues completes, evitant interrompre la interacció natural del jugador. Associat, a més, a colors vius (verd fosc/blanc), l'estat activat/desactivat és instantàniament desxifrat (visibilitat del sistema).

## 5. Forgiving Format (Botó de Retorn / Sortida Segura)
A les pantalles de detall s'han afegit de manera explícita capçaleres amb botons "Atrás" (`$router.back()`).
* **Justificació:** Els usuaris necessiten explorar la interfície sabent que no es quedaran "atrapats". Donar una sortida clara i fàcil d'identificar (a dalt a l'esquerra) millora la confiança del jugador (Safe Exploration). Evita que hagi de dependre només de la navegació del navegador (particularment invàlida si la PWA s'ha d'instal·lar com app nativa).

