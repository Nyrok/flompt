---
title: "Décompose ton prompt : Un guide visuel de la structure du prompt"
date: "2026-03-18"
excerpt: "Tes prompts sont des systèmes invisibles. Décompose-les en blocs visuels pour voir ce qui est fort, ce qui est faible, et ce qui manque avant l'exécution."
tags: ["prompt engineering", "prompts visuels", "structure", "flompt"]
color: "primary"
---

La plupart des prompts = murs de texte.

Tu écris. C'est un bloc de phrases. Pas de structure visible. Pas idée de ce qui manque. Pas de vue sur l'assemblage.

Envoies à l'aveugle. Espères. Itères jusqu'à ce ça marche. Pas une stratégie. Du devinage.

Et si tu pouvais **voir** la structure avant l'exécution ?

---

## Pourquoi la structure visuelle importe

Quand tu écris du code, l'IDE te montre :
- Les fonctions appelées
- Les paramètres
- Les variables
- Les connexions

La représentation visuelle = trouver les pièces manquantes avant exécution.

Les prompts devraient fonctionner pareil.

Décompose visuellement : casse en blocs (Rôle, Objectif, Contexte, Contraintes, Exemples, Format). Tu vois immédiatement :
- **Ce qui est là** : tes éléments inclus
- **Ce qui manque** : tes blocs vides
- **Les connexions** : qui se référence

De "tas de texte" à "système structuré."

---

## Ce que la décomposition révèle

Voyons ce qui se passe quand tu décomposes un prompt brut.

### Exemple 1 : Un prompt faible

**Prompt brut** :
```
Écris un email à un client expliquant pourquoi sa demande de feature ne peut pas être implémentée.
```

**Quand décomposé**, tu vois :
```
Rôle : [vide]
Objectif : Email expliquant le refus ✓
Contexte : [vide]
Contraintes : [vide]
Exemples : [vide]
Format de sortie : [vide]
```

**Clé** : Tu manques 5 des 6 éléments. Ce prompt sera générique. Le modèle n'a pas le contexte : qui écrit ? quel ton ? qu'est-ce que le client valorise ?

### Exemple 2 : Le même prompt, amélioré

Maintenant décompose la meilleure version :

```
Rôle : Product manager senior en SaaS B2B.
       Empathique mais direct. Tu sais expliquer pourquoi les features sont rejetées.

Objectif : Email au client expliquant pourquoi on ne peut pas implémenter sa demande.
           Maintiens la relation. Sois honnête sur nos priorités.

Contexte : Demande : "Collaboration en temps réel dans l'éditeur web"
           Notre décision : Rejectée. Raison : 18 mois d'engineering.
           Conflit avec réécriture architecture Q3.
           Client : Tier Enterprise. Haute valeur. Mais pas cas d'usage primaire.

Contraintes : - Moins de 300 mots
              - Ton professionnel mais chaleureux
              - Inclus une alternative pour leur besoin réel
              - Pas de promesse d'autre examen (c'est décidé)

Exemples : [Email similaire d'avant qui a bien marché]

Format : Email (To/From/Subject/Body). Pas de signature.
```

**Ce que tu vois** : Chaque élément rempli. Direction claire pour le modèle. Sortie spécifique.

La différence = infos qui importent. Pas de devinage.

---

## Les trois niveaux de décomposition

Trois façons de visualiser la décomposition :

### Niveau 1 : Outline texte
Énumère les éléments :
```
Rôle : ...
Objectif : ...
Contexte : ...
```

**Bon pour** : Vérifications rapides
**Pas idéal pour** : Vue complète, relations complexes

### Niveau 2 : Blocs structurés
Chaque élément comme un bloc :

```
┌──────────────┐
│    RÔLE      │ Stratégiste produit
├──────────────┤
│  OBJECTIF    │ Définis Q2 priorités
├──────────────┤
│   CONTEXTE   │ Marché, équipe capacité
├──────────────┤
│ CONTRAINTES  │ Budget neutre. 2 semaines.
├──────────────┤
│   EXEMPLES   │ Décisions précédentes
├──────────────┤
│ FORMAT SORTIE│ Liste + raisons
└──────────────┘
```

**Bon pour** : Structure globale, présenter aux équipes
**Pas idéal pour** : Édition en temps réel

### Niveau 3 : Canvas visuel interactif
Chaque élément comme un nœud. Édite live. Feedback immédiat.

**Bon pour** : Décomposition profonde, affinage itératif
**Excellent pour** : Équipes collaborant, auditer avant exécution

---

## Comment décomposer un prompt toi-même

Même sans outil, tu peux décomposer :

### Étape 1 : Rôle
Quelle expertise le modèle doit adopter ?
```
Rôle : [Perspective/background]
```

### Étape 2 : Objectif
Quelle est la tâche réelle ?
```
Objectif : [Quel problème ? Sois spécifique.]
```

### Étape 3 : Contexte
Quelles infos de base ?
```
Contexte : [Qu'est-ce que le modèle doit savoir ?]
```

### Étape 4 : Contraintes
Quelles limites ?
```
Contraintes : [Longueur ? Ton ? Format ? Vitesse ?]
```

### Étape 5 : Exemples
À quoi ressemble la réussite ?
```
Exemples : [Entrée/sortie ou exemples]
```

### Étape 6 : Format de sortie
Comment la réponse doit être structurée ?
```
Format : [Exactement comment tu veux la réponse]
```

Maintenant tu as un prompt décomposé. Tu vois :
- Quels éléments sont forts
- Lesquels manquent
- Quoi améliorer avant l'exécution

---

## Décomposition + audit = meilleurs prompts

Une fois décomposé, audite :

**Vérifie chaque élément :**
- ✓ **Rôle** — expertise claire ?
- ✓ **Objectif** — but énoncé ? Pas vague ?
- ✓ **Contexte** — assez d'infos ?
- ✓ **Contraintes** — limites claires ?
- ✓ **Exemples** — montrent ce que tu veux ?
- ✓ **Format** — format explicite ?

**Note la force :**
- 6/6 = **Excellent** (95%+ confiance)
- 5/6 = **Bon** (80%+ confiance)
- 4/6 = **Décent** (60%+ confiance)
- 3/6 ou moins = **Faible** (itère d'abord)

**Si moins de 5/6** : Ajoute les éléments manquants. Avant exécution. Pas après.

---

## Outils pour la décomposition visuelle

[flompt](https://flompt.dev) décompose ton prompt en blocs visuels :

1. Colle ton prompt brut
2. Clique : décompose
3. Vois chaque élément comme un bloc
4. Obtiens un score de qualité
5. Vois le feedback sur ce qui manque
6. Édite les blocs directement
7. Vois le score s'améliorer
8. Compile quand c'est prêt

Processus de révision intégré.

Open-source. Auto-hébergeable. Dans ton navigateur. Pas de compte. Tes prompts restent locaux.

---

## Pourquoi c'est important pour les équipes

Travailles en équipe sur l'IA ? La décomposition = encore plus importante.

Un développeur écrit. Un product manager révise. Décomposition visuelle = c'est possible. Ils voient :
- Ce prompt résout le problème réel ?
- Clairs sur les contraintes ?
- Pensé aux cas limites ?

La décomposition = de "un truc qui marche" à "un système révisable."

Entre code sans review. Code avec standards.

---

## Le workflow de décomposition

Intègre la décomposition dans ton développement :

1. **Brainstorm brut** → Écris normalement
2. **Décompose** → Casse en éléments structurels
3. **Audite** → Vérifie chaque élément
4. **Remplis les lacunes** → Ajoute. Renforce.
5. **Ré-audite** → Revérifie le score
6. **Exécute** → Envoie si confiant
7. **Affine** → Sauvegarde. Améliore.

5 minutes de plus. Épargne 30+ minutes d'itération.

---

## Le résultat

Tes prompts sont des systèmes. Ils ont besoin de structure. La structure est invisible jusqu'à ce que tu la décomposes.

Casse visuellement ton prompt en Rôle, Objectif, Contexte, Contraintes, Exemples et Format. Tu vois immédiatement ce qui est fort et ce qui est faible.

Tu le corriges avant l'exécution, pas après.

Moins de devinage, moins d'itération à l'aveugle.

Juste des prompts qui fonctionnent.

---

**Essaie de décomposer ton prochain prompt** — manuellement ou avec [flompt](https://flompt.dev). Vois comment la structure visuelle change ta qualité de sortie.

[Explore flompt](https://flompt.dev) | [Voir sur GitHub](https://github.com/Nyrok/flompt)
