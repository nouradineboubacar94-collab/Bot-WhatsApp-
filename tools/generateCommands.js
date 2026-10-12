// tools/generateCommands.js
// Génère des metadata de commandes pour chaque catégorie selon la répartition définie
const fs = require('fs');
const path = require('path');
const categoriesFile = path.join(process.cwd(), 'commands', 'metadata', 'categories.json');
if (!fs.existsSync(categoriesFile)) {
  console.error('categories.json manquant. Ajoute commands/metadata/categories.json');
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));
const outDir = path.join(process.cwd(), 'commands', 'metadata', 'generated');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
let idx = 1;
for (const [cat, count] of Object.entries(cfg.categories)) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const name = `${cat}_${String(i+1).padStart(3,'0')}`;
    arr.push({ id: `${cat}_${i+1}`, name, category: cat, description: `Commande ${name}`, usage: `.${name}`, permission: 'user', type: 'static', responseText: `Réponse pour ${name}` });
    idx++;
  }
  fs.writeFileSync(path.join(outDir, `${cat}.json`), JSON.stringify(arr, null, 2));
  console.log(`Wrote ${arr.length} commands to ${cat}.json`);
}
console.log('Génération terminée.');
