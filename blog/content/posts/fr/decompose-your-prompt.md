---
title: "Décompose ton prompt : Un guide visuel de la structure du prompt"
date: "2026-03-18"
excerpt: "Tes prompts sont des systèmes invisibles. Décompose-les en blocs visuels pour voir ce qui est fort, ce qui est faible, et ce qui manque avant l'exécution."
tags: ["prompt engineering", "prompts visuels", "structure", "flompt"]
color: "primary"
---

Voici le problème avec la plupart des prompts : ce sont juste des murs de texte.

Tu écris ton prompt dans un éditeur de texte ou une interface de chat. C'est un bloc de phrases. Tu ne peux pas voir la structure. Tu ne peux pas dire ce qui manque. Tu ne peux pas visualiser comment les pièces s'assemblent.

Alors tu l'envoies à l'aveugle, tu espères que ça fonctionne, et tu itères jusqu'à ce que ça ne fonctionne pas. Ce n'est pas une stratégie. C'est du devinage.

Et si tu pouvais **voir** la structure de ton prompt avant l'exécution ?

---

## Pourquoi la structure visuelle importe

Quand tu écris du code, ton IDE ne te montre pas juste du texte. Il te montre :
- Quelles fonctions sont appelées
- Quels paramètres elles ont
- Quelles variables sont définies
- Comment elles sont connectées

La représentation visuelle t'aide à repérer les pièces manquantes avant de l'exécuter.

Les prompts devraient fonctionner de la même façon.

Quand tu décomposes visuellement un prompt — en le brisant en blocs distincts (Rôle, Objectif, Contexte, Contraintes, Exemples, Format de sortie) — tu vois immédiatement :
- **Ce qui est là** : Quels éléments tu as inclus
- **Ce qui manque** : Quels blocs sont vides ou sous-développés
- **Comment ils se connectent** : Quels éléments se référencent les uns aux autres

Tu passes de "voilà un tas de texte" à "voilà un système structuré."

---

## Ce que la décomposition révèle

Laisse-moi te montrer ce qui se passe quand tu décomposes visuellement un prompt brut.

### Exemple 1 : Un prompt faible

**Prompt brut** (comme texte) :
```
Écris un email à un client expliquant pourquoi sa demande de feature ne peut pas être implémentée.
```

**Quand décomposé**, tu vois :
```
Rôle : [vide]
Objectif : Écrire email expliquant le refus de feature ✓
Contexte : [vide]
Contraintes : [vide]
Exemples : [vide]
Format de sortie : [vide]
```

**Ce qui est immédiatement clair** : Tu manques 5 des 6 éléments structurels. Ce prompt produira une sortie générique parce que le modèle n'a aucun contexte sur qui écrit, quel ton utiliser, ou ce que le client valorise.

### Exemple 2 : Le même prompt, amélioré

Maintenant décompose la meilleure version :

```
Rôle : Tu es un responsable produit senior dans une entreprise SaaS B2B.
       Tu es empathique mais direct. Tu comprends pourquoi les features sont rejetées
       et comment l'expliquer aux clients.

Objectif : Écris un email à un client expliquant pourquoi on ne peut pas implémenter
           sa demande de feature. L'objectif est de maintenir la relation
           tout en étant honnête sur les priorités de notre roadmap.

Contexte : Client a demandé : "Collaboration en temps réel dans l'éditeur web"
           Notre décision : Rejetée. Raison : 18 mois d'effort d'ingénierie,
           conflite avec la réécriture de l'architecture prévue pour Q3.
           Le client : Tier Enterprise, haute valeur, mais pas un cas d'usage primaire pour eux.

Contraintes : - Reste sous 300 mots
              - Ton professionnel mais chaleureux
              - Inclus une alternative qui adresse leur besoin sous-jacent
              - Ne promets pas une reconsidération future (on a déjà décidé)

Exemples : [Exemple d'un email client similaire que tu as envoyé le trimestre dernier qui
           a bien fonctionné et maintenu la relation]

Format de sortie : Format email (To/From/Subject/Body).
                   Ne pas inclure de signature.
```

**Ce que tu vois maintenant** : Chaque élément structurel est rempli. Le modèle a une direction claire. La sortie sera spécifique, appropriée et authentique.

La différence ? La version décomposée a les infos qui importent. Le modèle ne doit pas deviner.

---

## Les trois niveaux de décomposition

Il y a trois façons de visualiser la décomposition de prompts :

### Niveau 1 : Outline texte
Juste énumère les éléments comme texte :
```
Rôle : ...
Objectif : ...
Contexte : ...
```

**Bon pour** : Vérifications rapides, validation légère
**Pas idéal pour** : Voir l'image complète, repérer les relations complexes

### Niveau 2 : Blocs structurés
Visualise chaque élément comme un bloc distinct :

```
┌──────────────┐
│    RÔLE      │ Tu es un stratégiste produit
├──────────────┤
│  OBJECTIF    │ Définis les priorités Q2
├──────────────┤
│   CONTEXTE   │ Analyse de marché, capacité d'équipe
├──────────────┤
│ CONTRAINTES  │ Neutre sur le budget, timeline 2 semaines
├──────────────┤
│   EXEMPLES   │ Décisions roadmap précédentes
├──────────────┤
│ FORMAT SORTIE│ Liste à puces avec justification
└──────────────┘
```

**Bon pour** : Comprendre la structure globale, présenter aux équipes
**Pas idéal pour** : Édition interactive, feedback dynamique

### Niveau 3 : Canvas visuel interactif
Vois chaque élément comme un nœud dans un système visuel. Édite en temps réel. Obtiens du feedback immédiat sur la complétude.

**Bon pour** : Décomposition profonde, affinage itératif, comprendre les dépendances
**Excellent pour** : Les équipes collaborant sur les prompts, auditer la qualité avant exécution

---

## Comment décomposer un prompt toi-même

Même sans outil, tu peux décomposer manuellement :

### Étape 1 : Extrais le rôle
Lis ton prompt. Quelle expertise le modèle doit adopter ?
```
Rôle : [Quelle perspective ou background le modèle doit utiliser ?]
```

### Étape 2 : Extrais l'objectif
Quelle est la tâche réelle ?
```
Objectif : [Quel problème tu résous ? Sois spécifique.]
```

### Étape 3 : Extrais le contexte
Quelles infos de base le modèle a besoin ?
```
Contexte : [Qu'est-ce que le modèle devrait savoir de la situation ?]
```

### Étape 4 : Extrais les contraintes
Quelles sont les règles ou limites ?
```
Contraintes : [Quelles limites s'appliquent ? Longueur ? Ton ? Format ? Vitesse ?]
```

### Étape 5 : Extrais les exemples
À quoi ressemble la réussite ?
```
Exemples : [Montre 1-2 paires entrée/sortie ou des exemples de ce que tu veux]
```

### Étape 6 : Extrais le format de sortie
Comment la réponse doit être structurée ?
```
Format de sortie : [Spécifie exactement comment tu veux la réponse formatée]
```

Maintenant tu as un prompt décomposé. Tu peux voir :
- Quels éléments sont forts
- Lesquels manquent
- Quoi améliorer avant l'exécution

---

## Décomposition + audit = meilleurs prompts

Une fois que tu as décomposé ton prompt, audite-le :

**Vérifie chaque élément :**
- ✓ **Rôle** : L'expertise est-elle claire et spécifique ?
- ✓ **Objectif** : Le but est-il énoncé, pas vague ?
- ✓ **Contexte** : Y a-t-il assez d'infos de base ?
- ✓ **Contraintes** : Les limites sont-elles claires ?
- ✓ **Exemples** : Les exemples montrent-ils ce que tu veux ?
- ✓ **Format de sortie** : Le format est-il explicite ?

**Note la force globale :**
- 6/6 éléments forts = **Excellent prompt** (95%+ confiance)
- 5/6 éléments forts = **Bon prompt** (80%+ confiance)
- 4/6 éléments forts = **Prompt décent** (60%+ confiance)
- 3/6 ou moins = **Prompt faible** (besoin d'itération)

**Si tu es sous 5/6 :** Ajoute les éléments manquants avant l'exécution. N'itère pas après l'échec.

---

## Outils pour la décomposition visuelle

Si tu veux visualiser ceci de manière interactive, [flompt](https://flompt.dev) décompose ton prompt en blocs visuels. Tu :

1. Colles ton prompt brut
2. Cliques sur décompose
3. Vois chaque élément comme un bloc visuel (Rôle, Objectif, Contexte, Contraintes, Exemples, Format de sortie)
4. Obtiens un score de qualité (0-100) basé sur la complétude
5. Vois du feedback spécifique sur ce qui manque
6. Édites les blocs directement
7. Regardes le score se mettre à jour au fur et à mesure que tu améliores
8. Compiles le prompt final quand il est prêt

C'est comme avoir un processus de révision de prompt intégré.

L'outil est open-source, auto-hébergeable, et fonctionne dans ton navigateur. Pas de compte requis. Tes prompts restent sur ta machine.

---

## Pourquoi c'est important pour les équipes

Si tu travailles en équipe sur des produits IA, la décomposition devient encore plus importante.

Quand un développeur écrit un prompt, un responsable produit devrait pouvoir le réviser. Quand tu décomposes visuellement, c'est possible. Ils peuvent voir :
- Ce prompt résout-il réellement le problème ?
- Sommes-nous clairs sur nos contraintes ?
- Avons-nous pensé aux cas limites ?

La décomposition transforme les prompts de "voici un truc qui fonctionne plus ou moins" à "voici un système qu'on peut réviser et améliorer."

C'est la différence entre écrire du code sans code review et avoir des standards.

---

## Le workflow de décomposition

Voici comment intégrer la décomposition dans ton développement de prompt :

1. **Brainstorm le prompt brut** → Écris-le comme d'habitude
2. **Décompose-le** → Casse-le en éléments structurels
3. **Audite-le** → Vérifie chaque élément pour la force et la clarté
4. **Remplis les lacunes** → Ajoute les éléments manquants ou renforce les faibles
5. **Ré-audite** → Revérifie le score
6. **Exécute** → Envoie seulement quand tu es confiant dans la structure
7. **Affine pour la prochaine fois** → Sauvegarde le prompt, continue à l'améliorer

Ce processus prend 5 minutes de plus mais épargne 30+ minutes en itération.

---

## Le résultat

Tes prompts sont des systèmes. Ils ont besoin de structure. Et la structure est invisible jusqu'à ce que tu la décomposes.

En brisant visuellement ton prompt en Rôle, Objectif, Contexte, Contraintes, Exemples et Format de sortie, tu vois immédiatement ce qui est fort et ce qui est faible.

Puis tu le corriges avant l'exécution, pas après.

Plus d'itération à l'aveugle. Plus de devinage.

Juste des prompts qui fonctionnent.

---

**Essaie de décomposer ton prochain prompt** — soit manuellement ou avec [flompt](https://flompt.dev). Vois comment la structure visuelle change ta qualité de sortie. Tu remarqueras la différence immédiatement.

[Explore flompt](https://flompt.dev) | [Voir sur GitHub](https://github.com/Nyrok/flompt)
