// Script de auditoria (Pessoa 4) — mede cobertura de decisão real de updateQuality().
//
// Por que não confiar só no "% Branch" do Jest/Istanbul: ifs sem else (a maioria das
// guard clauses de gilded-rose.ts) só têm 1 desfecho instrumentado por padrão (conta
// quantas vezes o bloco RODOU, não se o lado em que ele é PULADO também foi exercitado).
// Isso faz o relatório padrão de cobertura superestimar a cobertura de decisão real.
//
// Este script substitui temporariamente app/gilded-rose.ts por uma cópia instrumentada
// (mesma lógica, cada if numerado D2–D17 conforme prompts/prompt-4-estrutural-cfg.md,
// gravando V/F em resultados/decisions.log), roda as suítes pedidas com Jest, e depois
// restaura o arquivo original via `git checkout -- app/gilded-rose.ts`.
//
// Uso: node auditoria/evidencias/trace-decisoes.js <suite1.spec.ts> [suite2.spec.ts ...]
// (executar a partir da raiz do repositório; requer working tree de app/gilded-rose.ts limpo)

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const GILDED_ROSE = path.join(ROOT, 'app', 'gilded-rose.ts');
const LOG = path.join(ROOT, 'resultados', 'decisions.log');

const status = execSync('git status --porcelain -- app/gilded-rose.ts').toString().trim();
if (status) {
  console.error('app/gilded-rose.ts tem alterações não commitadas — aborta para não perder trabalho.');
  process.exit(1);
}

const original = fs.readFileSync(GILDED_ROSE, 'utf8');

const instrumented = `import * as fs from 'fs';
import * as path from 'path';

const LOG_PATH = path.join(__dirname, '..', 'resultados', 'decisions.log');
function rec(id: string, outcome: boolean) {
  fs.appendFileSync(LOG_PATH, \`\${id}:\${outcome ? 'V' : 'F'}\\n\`);
}

export class Item {
  name: string;
  sellIn: number;
  quality: number;

  constructor(name, sellIn, quality) {
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
  }
}

export class GildedRose {
  items: Array<Item>;

  constructor(items = [] as Array<Item>) {
    this.items = items;
  }

  updateQuality() {
    for (let i = 0; i < this.items.length; i++) {
      const d2 = this.items[i].name != 'Aged Brie' && this.items[i].name != 'Backstage passes to a TAFKAL80ETC concert';
      rec('D2', d2);
      if (d2) {
        const d3 = this.items[i].quality > 0;
        rec('D3', d3);
        if (d3) {
          const d4 = this.items[i].name != 'Sulfuras, Hand of Ragnaros';
          rec('D4', d4);
          if (d4) {
            this.items[i].quality = this.items[i].quality - 1
          }
        }
      } else {
        const d5 = this.items[i].quality < 50;
        rec('D5', d5);
        if (d5) {
          this.items[i].quality = this.items[i].quality + 1
          const d6 = this.items[i].name == 'Backstage passes to a TAFKAL80ETC concert';
          rec('D6', d6);
          if (d6) {
            const d7 = this.items[i].sellIn < 11;
            rec('D7', d7);
            if (d7) {
              const d8 = this.items[i].quality < 50;
              rec('D8', d8);
              if (d8) {
                this.items[i].quality = this.items[i].quality + 1
              }
            }
            const d9 = this.items[i].sellIn < 6;
            rec('D9', d9);
            if (d9) {
              const d10 = this.items[i].quality < 50;
              rec('D10', d10);
              if (d10) {
                this.items[i].quality = this.items[i].quality + 1
              }
            }
          }
        }
      }
      const d11 = this.items[i].name != 'Sulfuras, Hand of Ragnaros';
      rec('D11', d11);
      if (d11) {
        this.items[i].sellIn = this.items[i].sellIn - 1;
      }
      const d12 = this.items[i].sellIn < 0;
      rec('D12', d12);
      if (d12) {
        const d13 = this.items[i].name != 'Aged Brie';
        rec('D13', d13);
        if (d13) {
          const d14 = this.items[i].name != 'Backstage passes to a TAFKAL80ETC concert';
          rec('D14', d14);
          if (d14) {
            const d15 = this.items[i].quality > 0;
            rec('D15', d15);
            if (d15) {
              const d16 = this.items[i].name != 'Sulfuras, Hand of Ragnaros';
              rec('D16', d16);
              if (d16) {
                this.items[i].quality = this.items[i].quality - 1
              }
            }
          } else {
            this.items[i].quality = this.items[i].quality - this.items[i].quality
          }
        } else {
          const d17 = this.items[i].quality < 50;
          rec('D17', d17);
          if (d17) {
            this.items[i].quality = this.items[i].quality + 1
          }
        }
      }
    }

    return this.items;
  }
}
`;

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Uso: node auditoria/evidencias/trace-decisoes.js <arquivo(s) de teste>');
  process.exit(1);
}

try {
  fs.writeFileSync(GILDED_ROSE, instrumented);
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.writeFileSync(LOG, '');
  execSync(`npx jest ${files.map(f => `"${f}"`).join(' ')} --coverage=false --runInBand`, { stdio: 'inherit' });

  const decisions = ['D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13','D14','D15','D16','D17'];
  const lines = fs.readFileSync(LOG, 'utf8').trim().split('\n').filter(Boolean);
  const hit = {};
  for (const d of decisions) hit[d] = { V: 0, F: 0 };
  for (const line of lines) {
    const [d, o] = line.split(':');
    if (hit[d]) hit[d][o]++;
  }
  let covered = 0;
  const missing = [];
  for (const d of decisions) {
    if (hit[d].V > 0) covered++; else missing.push(d + ':V');
    if (hit[d].F > 0) covered++; else missing.push(d + ':F');
  }
  console.log('\n=== Cobertura de decisão real (D2-D17, D1/loop trivial) ===');
  console.log(`${covered}/${decisions.length * 2} (${(100 * covered / (decisions.length * 2)).toFixed(1)}%)`);
  console.log('Faltando:', missing.length ? missing.join(', ') : 'nenhum');
} finally {
  fs.writeFileSync(GILDED_ROSE, original);
  execSync('git checkout -- app/gilded-rose.ts');
  fs.rmSync(LOG, { force: true });
  console.log('\napp/gilded-rose.ts restaurado ao original.');
}
