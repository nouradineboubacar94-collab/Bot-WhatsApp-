# EL-NOUR MD

EL-NOUR MD - WhatsApp Bot

Ce repo contient une scaffolding pour le bot WhatsApp EL-NOUR MD.

Instructions rapides:
1. Copier `.env.example` en `.env` et remplir `OPENAI_API_KEY` et `OWNER_NUMBER`.
2. Installer dépendances: `npm install`
3. Lancer le bot: `npm start`

Notes importantes:
- Ajoute ton image/GIF d'animation à `assets/el-nour.gif`. Pour l'instant il y a un placeholder `assets/EL-NOUR-MD.txt`.
- Les commandes AI utilisent l'API OpenAI. Coûts potentiels — fais attention.
- Pour générer les 890 commandes statiques: `npm run generate` qui placera des fichiers dans `commands/metadata/generated/`.

