// Suite 3 — Persona + Chain-of-Thought (CoT)
// Gerada com o Prompt 3: persona de QA Sênior com raciocínio explícito passo-a-passo
//
// Regras de negócio identificadas (raciocínio CoT):
//
// R1 — Item normal:
//   - quality cai 1/dia enquanto sellIn > 0 (após decremento: sellIn >= 0)
//   - quality cai 2/dia quando sellIn já é negativo após o decremento
//     → o código decrementa quality ANTES de decrementar sellIn, depois decrementa
//       novamente se sellIn ficar < 0; portanto sellIn inicial = 0 resulta em -2
//   - quality NUNCA fica abaixo de 0 (ambas as deduções são guardadas por `if quality > 0`)
//   - sellIn decrementa 1/dia
//
// R2 — Aged Brie:
//   - quality sobe 1/dia antes de vencer
//   - quality sobe 2/dia após vencer (sellIn torna-se negativo)
//   - quality NUNCA ultrapassa 50
//   - sellIn decrementa normalmente
//
// R3 — Sulfuras, Hand of Ragnaros:
//   - quality e sellIn são imutáveis (nenhum dos dois blocos afeta Sulfuras)
//
// R4 — Backstage passes to a TAFKAL80ETC concert:
//   - quality +1 quando sellIn > 10 (antes do decremento)
//   - quality +2 quando sellIn está em [6, 10] (antes do decremento; `sellIn < 11`)
//   - quality +3 quando sellIn está em [1, 5]  (antes do decremento; `sellIn < 6`)
//   - quality = 0 quando sellIn = 0 (antes do decremento): o código soma +3, decrementa
//     sellIn para -1 e depois zera quality via `quality = quality - quality`
//   - quality NUNCA ultrapassa 50 (cada incremento individual tem guard `quality < 50`)
//   - sellIn decrementa normalmente
//
// Boundary values mapeados:
//   Item normal  : quality ∈ {0, 1, 2};  sellIn ∈ {1, 0, -1}
//   Aged Brie    : quality ∈ {48, 49, 50}; sellIn ∈ {1, 0, -1}
//   Sulfuras     : qualquer sellIn (positivo, zero, negativo)
//   Passes       : sellIn ∈ {12, 11, 10, 6, 5, 1, 0, -1}; quality ∈ {48, 49, 50}

import { Item, GildedRose } from '@/gilded-rose';

function updateOnce(name: string, sellIn: number, quality: number): Item {
  const shop = new GildedRose([new Item(name, sellIn, quality)]);
  return shop.updateQuality()[0];
}

function updateMany(name: string, sellIn: number, quality: number, days: number): Item {
  const shop = new GildedRose([new Item(name, sellIn, quality)]);
  for (let i = 0; i < days; i++) shop.updateQuality();
  return shop.items[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// R1 — Item normal
// ─────────────────────────────────────────────────────────────────────────────
describe('R1 — Item normal', () => {

  // sellIn
  it('R1-S1 [normal] decrementa sellIn em 1 a cada dia', () => {
    // CoT: sellIn=5 → após 1 ciclo → sellIn=4
    const item = updateOnce('Elixir of the Mongoose', 5, 10);
    expect(item.sellIn).toBe(4);
  });

  // quality antes do prazo
  it('R1-Q1 [normal] diminui quality em 1 quando sellIn > 0', () => {
    // CoT: sellIn=5, quality=10 → -1 antes → sellIn torna-se 4 (≥ 0) → sem 2ª dedução → 9
    const item = updateOnce('Elixir of the Mongoose', 5, 10);
    expect(item.quality).toBe(9);
  });

  it('R1-Q2 [boundary] quality=1 e sellIn positivo → quality chega exatamente a 0', () => {
    // CoT: quality=1 > 0 → -1 → quality=0; sellIn=5→4 (≥0); sem 2ª dedução → 0
    const item = updateOnce('Elixir of the Mongoose', 5, 1);
    expect(item.quality).toBe(0);
  });

  it('R1-Q3 [beyond] quality=0 e sellIn positivo → permanece em 0 (floor)', () => {
    // CoT: quality=0, guard `quality > 0` falha → nenhuma dedução → 0
    const item = updateOnce('Elixir of the Mongoose', 5, 0);
    expect(item.quality).toBe(0);
  });

  // quality no dia do vencimento (sellIn inicial = 0)
  it('R1-Q4 [boundary] sellIn=0 causa degradação dupla de quality', () => {
    // CoT: sellIn=0 → 1ª dedução (-1) → sellIn decrementado para -1 → -1 < 0 → 2ª dedução (-1) → total -2
    const item = updateOnce('Elixir of the Mongoose', 0, 10);
    expect(item.quality).toBe(8);
  });

  it('R1-Q5 [boundary] sellIn=1 causa degradação simples (último dia antes de vencer)', () => {
    // CoT: sellIn=1 → -1 → sellIn torna-se 0; 0 < 0 é falso → sem 2ª dedução → total -1
    const item = updateOnce('Elixir of the Mongoose', 1, 10);
    expect(item.quality).toBe(9);
  });

  // quality após o prazo (sellIn inicial negativo)
  it('R1-Q6 [normal] sellIn=-1 causa degradação dupla (já vencido)', () => {
    // CoT: sellIn=-1 → 1ª dedução (-1) → sellIn torna-se -2 → -2 < 0 → 2ª dedução (-1) → total -2
    const item = updateOnce('Elixir of the Mongoose', -1, 10);
    expect(item.quality).toBe(8);
  });

  it('R1-Q7 [boundary] quality=1 vencido → não ultrapassa 0 com degradação dupla', () => {
    // CoT: quality=1 → 1ª dedução → 0; 2ª dedução: guard `quality > 0` (quality=0) falha → permanece 0
    const item = updateOnce('Elixir of the Mongoose', -1, 1);
    expect(item.quality).toBe(0);
  });

  it('R1-Q8 [beyond] quality=0 vencido → permanece em 0', () => {
    // CoT: quality=0, ambas as guards falham → 0
    const item = updateOnce('Elixir of the Mongoose', -1, 0);
    expect(item.quality).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// R2 — Aged Brie
// ─────────────────────────────────────────────────────────────────────────────
describe('R2 — Aged Brie', () => {

  it('R2-S1 [normal] decrementa sellIn normalmente', () => {
    const item = updateOnce('Aged Brie', 5, 10);
    expect(item.sellIn).toBe(4);
  });

  it('R2-Q1 [normal] aumenta quality em 1 antes do prazo', () => {
    // CoT: sellIn=5, quality=10 < 50 → +1 → 11; sellIn → 4 (≥0) → sem 2º aumento → 11
    const item = updateOnce('Aged Brie', 5, 10);
    expect(item.quality).toBe(11);
  });

  it('R2-Q2 [boundary] sellIn=1 (último dia) → aumento simples', () => {
    // CoT: sellIn=1 → +1; sellIn → 0; 0 < 0 é falso → sem 2º aumento → +1 total
    const item = updateOnce('Aged Brie', 1, 10);
    expect(item.quality).toBe(11);
  });

  it('R2-Q3 [boundary] sellIn=0 (dia do vencimento) → aumento duplo', () => {
    // CoT: +1 antes; sellIn → -1; -1 < 0 → Aged Brie → quality < 50 → +1 → total +2
    const item = updateOnce('Aged Brie', 0, 10);
    expect(item.quality).toBe(12);
  });

  it('R2-Q4 [beyond] sellIn=-1 (já vencido) → aumento duplo', () => {
    // CoT: +1; sellIn → -2; -2 < 0 → +1 → total +2
    const item = updateOnce('Aged Brie', -1, 10);
    expect(item.quality).toBe(12);
  });

  it('R2-Q5 [boundary] quality=49 antes do prazo → sobe para exatamente 50', () => {
    const item = updateOnce('Aged Brie', 5, 49);
    expect(item.quality).toBe(50);
  });

  it('R2-Q6 [boundary] quality=50 antes do prazo → permanece em 50 (cap)', () => {
    // CoT: guard `quality < 50` falha → nenhum aumento
    const item = updateOnce('Aged Brie', 5, 50);
    expect(item.quality).toBe(50);
  });

  it('R2-Q7 [boundary] quality=49 vencido → sobe para 50 e para (cap no 2º aumento)', () => {
    // CoT: +1 → 50; sellIn → -1; 2º aumento: quality(50) < 50 falsa → fica 50
    const item = updateOnce('Aged Brie', 0, 49);
    expect(item.quality).toBe(50);
  });

  it('R2-Q8 [boundary] quality=48 vencido → sobe 2 → exatamente 50', () => {
    // CoT: +1 → 49; sellIn → -1; +1 → 50
    const item = updateOnce('Aged Brie', -1, 48);
    expect(item.quality).toBe(50);
  });

  it('R2-Q9 [beyond] quality=50 vencido → permanece em 50 (cap duplo)', () => {
    const item = updateOnce('Aged Brie', -1, 50);
    expect(item.quality).toBe(50);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// R3 — Sulfuras, Hand of Ragnaros
// ─────────────────────────────────────────────────────────────────────────────
describe('R3 — Sulfuras, Hand of Ragnaros', () => {
  const NAME = 'Sulfuras, Hand of Ragnaros';

  it('R3-Q1 [normal] quality nunca muda com sellIn positivo', () => {
    const item = updateOnce(NAME, 5, 80);
    expect(item.quality).toBe(80);
  });

  it('R3-S1 [normal] sellIn nunca muda com sellIn positivo', () => {
    const item = updateOnce(NAME, 5, 80);
    expect(item.sellIn).toBe(5);
  });

  it('R3-Q2 [boundary] quality imutável quando sellIn=0', () => {
    const item = updateOnce(NAME, 0, 80);
    expect(item.quality).toBe(80);
  });

  it('R3-S2 [boundary] sellIn permanece 0 quando inicialmente 0', () => {
    const item = updateOnce(NAME, 0, 80);
    expect(item.sellIn).toBe(0);
  });

  it('R3-Q3 [beyond] quality imutável com sellIn negativo', () => {
    const item = updateOnce(NAME, -1, 80);
    expect(item.quality).toBe(80);
  });

  it('R3-S3 [beyond] sellIn permanece negativo (não é decrementado)', () => {
    const item = updateOnce(NAME, -1, 80);
    expect(item.sellIn).toBe(-1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// R4 — Backstage passes to a TAFKAL80ETC concert
// ─────────────────────────────────────────────────────────────────────────────
describe('R4 — Backstage passes to a TAFKAL80ETC concert', () => {
  const NAME = 'Backstage passes to a TAFKAL80ETC concert';

  // sellIn decrementa
  it('R4-S1 [normal] decrementa sellIn em 1 por dia', () => {
    const item = updateOnce(NAME, 15, 20);
    expect(item.sellIn).toBe(14);
  });

  // Faixa sellIn > 10 → +1
  it('R4-Q1 [normal] sellIn=12 → quality +1', () => {
    // CoT: 12 não é < 11 nem < 6 → apenas 1º aumento (+1) → total +1
    const item = updateOnce(NAME, 12, 20);
    expect(item.quality).toBe(21);
  });

  it('R4-Q2 [boundary superior] sellIn=11 → quality +1 (ainda na faixa >10)', () => {
    // CoT: 11 não é < 11 → apenas +1
    const item = updateOnce(NAME, 11, 20);
    expect(item.quality).toBe(21);
  });

  // Faixa sellIn ≤ 10 → +2  (limite inferior: sellIn < 11)
  it('R4-Q3 [boundary] sellIn=10 → quality +2 (entra na faixa ≤10)', () => {
    // CoT: 10 < 11 → +1; total 1ª+2ª = +2; 10 não é < 6 → sem 3ª
    const item = updateOnce(NAME, 10, 20);
    expect(item.quality).toBe(22);
  });

  it('R4-Q4 [normal] sellIn=8 → quality +2', () => {
    const item = updateOnce(NAME, 8, 20);
    expect(item.quality).toBe(22);
  });

  it('R4-Q5 [boundary superior] sellIn=6 → quality +2 (última posição da faixa ≤10, >5)', () => {
    // CoT: 6 < 11 → +1; total +2; 6 não é < 6 → sem 3ª
    const item = updateOnce(NAME, 6, 20);
    expect(item.quality).toBe(22);
  });

  // Faixa sellIn ≤ 5 → +3  (limite inferior: sellIn < 6)
  it('R4-Q6 [boundary] sellIn=5 → quality +3 (entra na faixa ≤5)', () => {
    // CoT: +1; 5 < 11 → +1; 5 < 6 → +1 → total +3
    const item = updateOnce(NAME, 5, 20);
    expect(item.quality).toBe(23);
  });

  it('R4-Q7 [normal] sellIn=3 → quality +3', () => {
    const item = updateOnce(NAME, 3, 20);
    expect(item.quality).toBe(23);
  });

  it('R4-Q8 [boundary] sellIn=1 → quality +3 (último dia antes do show)', () => {
    // CoT: +1; 1 < 11 → +1; 1 < 6 → +1 → total +3; sellIn → 0; 0 < 0 falso → quality mantida
    const item = updateOnce(NAME, 1, 20);
    expect(item.quality).toBe(23);
  });

  // Dia do show (sellIn=0) → quality vai a 0
  it('R4-Q9 [boundary] sellIn=0 → quality cai para 0 após o show', () => {
    // CoT: +1; 0 < 11 → +1; 0 < 6 → +1; sellIn → -1; -1 < 0 → quality = 0
    const item = updateOnce(NAME, 0, 20);
    expect(item.quality).toBe(0);
  });

  it('R4-Q10 [beyond] sellIn=-1 (já passado) → quality permanece 0', () => {
    const item = updateOnce(NAME, -1, 0);
    expect(item.quality).toBe(0);
  });

  // Cap de quality = 50 na faixa +1
  it('R4-Q11 [boundary] quality=50 e sellIn=15 → permanece em 50 (cap +1)', () => {
    // CoT: quality(50) < 50 falsa → nenhum aumento
    const item = updateOnce(NAME, 15, 50);
    expect(item.quality).toBe(50);
  });

  it('R4-Q12 [boundary] quality=49 e sellIn=15 → sobe para 50 e para', () => {
    const item = updateOnce(NAME, 15, 49);
    expect(item.quality).toBe(50);
  });

  // Cap de quality = 50 na faixa +2
  it('R4-Q13 [boundary] quality=49 e sellIn=10 → sobe para 50 e para (cap no 2º aumento)', () => {
    // CoT: 49 < 50 → +1 → 50; 10 < 11 → quality(50) < 50 falsa → para em 50
    const item = updateOnce(NAME, 10, 49);
    expect(item.quality).toBe(50);
  });

  it('R4-Q14 [boundary] quality=50 e sellIn=10 → permanece 50 (cap imediato)', () => {
    const item = updateOnce(NAME, 10, 50);
    expect(item.quality).toBe(50);
  });

  // Cap de quality = 50 na faixa +3
  it('R4-Q15 [boundary] quality=48 e sellIn=5 → sobe para 50 e para (cap no 3º aumento)', () => {
    // CoT: +1 → 49; 5 < 11 → +1 → 50; 5 < 6 → quality(50) < 50 falsa → fica 50
    const item = updateOnce(NAME, 5, 48);
    expect(item.quality).toBe(50);
  });

  it('R4-Q16 [boundary] quality=49 e sellIn=5 → sobe para 50 no 1º aumento e para', () => {
    // CoT: +1 → 50; 5 < 11 → quality(50) < 50 falsa → fica 50
    const item = updateOnce(NAME, 5, 49);
    expect(item.quality).toBe(50);
  });

  it('R4-Q17 [beyond] quality=50 e sellIn=5 → permanece 50', () => {
    const item = updateOnce(NAME, 5, 50);
    expect(item.quality).toBe(50);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Comportamento acumulado (múltiplos dias)
// ─────────────────────────────────────────────────────────────────────────────
describe('Comportamento acumulado ao longo de múltiplos dias', () => {

  it('item normal chega exatamente a 0 e permanece lá', () => {
    // CoT: 3 dias com sellIn positivo → -3; garante que não fica negativo depois
    const item = updateMany('Elixir of the Mongoose', 10, 3, 3);
    expect(item.quality).toBe(0);
    const item2 = updateMany('Elixir of the Mongoose', 10, 3, 4);
    expect(item2.quality).toBe(0);
  });

  it('Aged Brie atinge o cap 50 e não ultrapassa mesmo com mais dias', () => {
    // CoT: quality=0, sellIn grande → após 50 dias → quality=50; mais dias → continua 50
    const item = updateMany('Aged Brie', 100, 0, 55);
    expect(item.quality).toBe(50);
  });

  it('Backstage passes: quality cai para 0 no dia seguinte ao show e permanece 0', () => {
    // CoT: sellIn=1 → +3 (quality 23); sellIn=0 → quality=0; sellIn=-1 → permanece 0
    const shop = new GildedRose([new Item(NAME, 1, 20)]);
    shop.updateQuality(); // sellIn → 0, quality → 23
    expect(shop.items[0].quality).toBe(23);
    shop.updateQuality(); // sellIn → -1, quality → 0
    expect(shop.items[0].quality).toBe(0);
    shop.updateQuality(); // sellIn → -2, quality → 0
    expect(shop.items[0].quality).toBe(0);
  });

  it('Sulfuras permanece inalterado após múltiplos dias', () => {
    const item = updateMany('Sulfuras, Hand of Ragnaros', 0, 80, 10);
    expect(item.quality).toBe(80);
    expect(item.sellIn).toBe(0);
  });

  it('múltiplos itens de tipos diferentes são atualizados de forma independente', () => {
    const shop = new GildedRose([
      new Item('Elixir of the Mongoose', 5, 10),
      new Item('Aged Brie', 5, 10),
      new Item('Sulfuras, Hand of Ragnaros', 5, 80),
      new Item('Backstage passes to a TAFKAL80ETC concert', 5, 20),
    ]);
    shop.updateQuality();
    expect(shop.items[0].quality).toBe(9);   // normal: -1
    expect(shop.items[1].quality).toBe(11);  // Aged Brie: +1
    expect(shop.items[2].quality).toBe(80);  // Sulfuras: inalterado
    expect(shop.items[3].quality).toBe(23);  // Passes sellIn=5: +3
  });
});

// Constante usada dentro do describe de múltiplos dias
const NAME = 'Backstage passes to a TAFKAL80ETC concert';
