---
title: "Flompt Projects : plusieurs espaces de travail, zéro rétention de données"
date: "2026-03-14"
excerpt: "Flompt supporte maintenant plusieurs projets indépendants, chacun avec son propre canvas, son prompt et son output. Passez de l'un à l'autre instantanément, exportez et importez en JSON, et gardez tout en local. Vos données ne quittent jamais votre navigateur."
tags: ["projects", "confidentialité", "workflow", "local-first", "open-source"]
color: "primary"
---

## Le problème d'un canvas unique

Flompt avait un seul canvas. Un seul prompt. Un seul état.

Suffit pour une chose. Mais la plupart construisent des workflows différents. Clients différents. Cas d'usage différents. Code review. Pipeline contenu. Support client. Onboarding.

Ou canvas surchargé. Ou effacer et perdre. Aucune option satisfaisante.

**Projects change ça.**

## Ce que sont les Projects

Un **project** dans flompt est un espace de travail complet et isolé. Il stocke :

- Votre canvas (tous les blocs, positions, connexions)
- L'output du prompt compilé
- Le format et la langue courants

Chaque projet est indépendant. Changer de projet remplace l'intégralité de l'état du canvas, pas de mélange, pas d'interférence entre les espaces de travail.

Les projets sont créés, gérés et changés depuis un **sélecteur en forme de pill dans le header**, centré entre les panneaux gauche et droit. Cliquez sur le sélecteur, voyez tous vos projets, basculez en un clic. Vous pouvez renommer n'importe quel projet directement, supprimer ceux dont vous n'avez plus besoin, et en créer autant que votre travail l'exige.

## Sauvegarde automatique, toujours

Vous ne sauvegardez pas manuellement. Flompt le fait pour vous.

Chaque modification du canvas, ajout d'un bloc, édition du contenu, déplacement d'un nœud, déclenche une sauvegarde automatique, avec un debounce d'une seconde. Le temps que vous fassiez une pause, votre travail est déjà persisté. Fermez l'onglet, revenez demain : tout est exactement là où vous l'avez laissé.

C'est la même chose quand vous changez de projet. L'état courant est enregistré avant que le changement n'ait lieu. Rien n'est perdu en cours de workflow.

## Le projet par défaut

Quand vous ouvrez flompt pour la première fois, un **projet par défaut** est créé automatiquement. Il est traduit dans la langue de votre interface et il est protégé, il ne peut pas être supprimé. Vous avez toujours un espace de travail de secours, quoi qu'il arrive.

Le projet par défaut est aussi là où migre tout état de canvas existant depuis l'ère pré-projets. Si vous utilisiez déjà flompt avant cette mise à jour, votre travail est toujours là.

## Import / Export : portabilité sans cloud

Les projets peuvent être exportés et importés en tant que fichiers JSON bruts.

C'est plus puissant que ça en a l'air. Quelques scénarios concrets :

**Sauvegarder son travail** : Exportez un projet avant une restructuration majeure. Si la nouvelle direction ne fonctionne pas, importez la sauvegarde. Du versioning pour vos prompts, sans Git.

**Partager des flows avec une équipe** : Exportez votre meilleur projet de code review, envoyez le JSON à un collègue. Il l'importe dans sa propre instance flompt en quelques secondes. Pas de compte, pas d'espace cloud partagé, pas de permissions à configurer.

**Changer de machine** : Exportez depuis votre ordinateur de travail, importez sur votre laptop personnel. Votre espace de travail entier voyage dans un seul fichier.

**Intégrer de nouveaux collaborateurs** : Construisez un projet de référence avec les structures de prompts standard de votre équipe. Exportez-le. Chaque nouveau membre l'importe et part d'une base cohérente.

Le format JSON est lisible et stable. Ce n'est pas un blob opaque, vous pouvez l'inspecter, le differ, et le stocker dans un dépôt aux côtés de votre code si vous le souhaitez.

## Zéro rétention de données. Pour toujours.

Flompt a toujours été local-first. Les Projects ne changent pas ça, ils l'étendent.

Tout vit dans le `localStorage` de votre navigateur. Pas de compte requis. Aucun serveur ne voit vos prompts. Aucune analytics sur votre contenu. Rien n'est transmis, stocké ou traité sur l'infrastructure de flompt.

C'est important. Les prompts contiennent souvent des éléments sensibles, détails internes de produit, informations clients, processus propriétaires, données personnelles. Quand vous construisez un prompt dans flompt, ce contenu reste sur votre machine. Le fichier JSON exporté reste où vous le mettez. Vous avez le contrôle total.

Nous n'avons pas de politique de rétention de données parce que nous n'avons pas vos données. C'est intentionnel, et ça ne changera pas.

## Un cas d'usage concret

Voici comment une petite équipe produit pourrait utiliser les Projects au quotidien :

1. **Projet "Point hebdo"** : un flow de prompt récurrent avec des blocs pour le statut d'équipe, les blocages et les prochaines étapes. Compilé chaque lundi, envoyé vers Make.com, traité par Claude, poussé dans Notion.

2. **Projet "Code review"** : un template d'analyse de code détaillé avec des blocs role, constraints et output format. Utilisé par le tech lead avant chaque merge de PR.

3. **Projet "Réponse client"** : un template de réponse support construit autour du ton de voix du produit. Exporté et importé par chaque agent support.

4. **Projet "Veille concurrentielle"** : un prompt de recherche pour les sessions de stratégie trimestrielle. Partagé sous forme de fichier JSON dans l'équipe direction.

Quatre espaces de travail indépendants. Quatre usages différents. Un seul outil, pas de cloud.

## La suite

Projects est la fondation d'une vision plus large : **flompt comme système d'exploitation personnel pour les prompts**.

Les pièces s'assemblent, un canvas pour construire des prompts structurés, une bibliothèque de templates pour démarrer, Make.com pour automatiser la suite, et maintenant les projets pour tout organiser.

Sur la roadmap :
- **Tags et recherche de projets** : retrouver n'importe quel projet instantanément quand vous en avez des dizaines
- **Paramètres par projet** : format par défaut, URL webhook et langue propres à chaque projet
- **Liens de partage éphémères** : partage opt-in sans backend
- **Historique des versions** : voir comment un prompt a évolué au fil du temps dans un projet

Si vous avez des idées, des retours, ou si vous voulez contribuer, le dépôt est ouvert : [**github.com/Nyrok/flompt**](https://github.com/Nyrok/flompt).

---

[**Ouvrir flompt →**](https://flompt.dev/app) · [**Star sur GitHub**](https://github.com/Nyrok/flompt) · [**Installer l'extension**](https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc)
