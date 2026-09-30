// Suite 4 — Estrutural (CFG + Cobertura de Decisão)
// Gerada a partir do Prompt 4 (`prompts/prompt-4-estrutural-cfg.md`): em vez de partir das
// regras de negócio, o ponto de partida é a estrutura de decisões do CFG de
// `updateQuality()` e o critério de Cobertura de Decisão (34 resultados V/F).
//
// As 17 decisões abaixo seguem a numeração do prompt (ordem de avaliação no código-fonte,
// não a numeração de nós do desenho do CFG):
//   D1  — i < items.length                                          (laço)
//   D2  — name != 'Aged Brie' && name != 'Backstage...'              (item é "normal"/Sulfuras)
//   D3  — quality > 0                                                (1ª dedução, ramo normal)
//   D4  — name != 'Sulfuras, Hand of Ragnaros'                       (guarda de Sulfuras, dedução)
//   D5  — quality < 50                                               (guarda de teto, ramo Brie/Backstage)
//   D6  — name == 'Backstage passes to a TAFKAL80ETC concert'
//   D7  — sellIn < 11                                                (faixa +2 do Backstage)
//   D8  — quality < 50                                               (guarda de teto, +2)
//   D9  — sellIn < 6                                                 (faixa +3 do Backstage)
//   D10 — quality < 50                                               (guarda de teto, +3)
//   D11 — name != 'Sulfuras, Hand of Ragnaros'                       (guarda do decremento de sellIn)
//   D12 — sellIn < 0                                                 (já vencido após o decremento)
//   D13 — name != 'Aged Brie'                                        (ramo pós-vencimento)
//   D14 — name != 'Backstage passes to a TAFKAL80ETC concert'        (ramo pós-vencimento)
//   D15 — quality > 0                                                (2ª dedução, item normal vencido)
//   D16 — name != 'Sulfuras, Hand of Ragnaros'                       (guarda redundante de Sulfuras)
//   D17 — quality < 50                                               (2ª valorização, Brie vencido)
//
// D1 (o laço) é exercitado em V e F por qualquer teste abaixo: ele entra (V) para processar
// o único item da lista e sai (F) logo em seguida — por isso não tem um teste dedicado.
//
// Estratégia de minimização (conforme pedido no prompt): cada cenário foi escolhido para
// fechar o maior número possível de resultados V/F ainda em aberto, reaproveitando efeitos
// colaterais estruturais (ex.: um item já vencido cobre, na mesma chamada, o decremento de
// sellIn E o ramo pós-vencimento). Resultado: 11 cenários fecham as 34 combinações V/F.

import { Item, GildedRose } from '@/gilded-rose';

function updateOnce(name: string, sellIn: number, quality: number): Item {
  const shop = new GildedRose([new Item(name, sellIn, quality)]);
  return shop.updateQuality()[0];
}

const VEST = '+5 Dexterity Vest';
const BRIE = 'Aged Brie';
const BACKSTAGE = 'Backstage passes to a TAFKAL80ETC concert';
const SULFURAS = 'Sulfuras, Hand of Ragnaros';

// ─────────────────────────────────────────────────────────────────────────────
// Item normal
// ─────────────────────────────────────────────────────────────────────────────
describe('Item normal — ramo D2/D3/D4 e pós-vencimento D12–D16', () => {

  it('T1 [D2V, D3V, D4V, D11V, D12F] não vencido, quality > 0 → degradação simples', () => {
    const item = updateOnce(VEST, 5, 10);
    expect(item.sellIn).toBe(4);
    expect(item.quality).toBe(9);
  });

  it('T2 [D2V, D3F, D11V, D12V, D13V, D14V, D15F] quality=0 no dia do vencimento → sem dedução, sellIn cruza para negativo', () => {
    const item = updateOnce(VEST, 0, 0);
    expect(item.sellIn).toBe(-1);
    expect(item.quality).toBe(0);
  });

  it('T3 [D2V, D3V, D4V, D11V, D12V, D13V, D14V, D15V, D16V] já vencido, quality > 0 → dedução dupla', () => {
    const item = updateOnce(VEST, -1, 5);
    expect(item.sellIn).toBe(-2);
    expect(item.quality).toBe(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sulfuras, Hand of Ragnaros
// ─────────────────────────────────────────────────────────────────────────────
describe('Sulfuras — único caso que fecha D4F, D11F e D16F', () => {

  it('T4 [D2V, D3V, D4F, D11F, D12V, D13V, D14V, D15V, D16F] já vencido → totalmente imutável', () => {
    // Mesmo com sellIn inicial negativo (D12V), Sulfuras nunca sofre dedução: D4 e D16
    // (guardas de Sulfuras) barram os dois pontos onde quality poderia ser decrementada,
    // e D11 barra o decremento de sellIn.
    const item = updateOnce(SULFURAS, -1, 80);
    expect(item.sellIn).toBe(-1);
    expect(item.quality).toBe(80);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Aged Brie
// ─────────────────────────────────────────────────────────────────────────────
describe('Aged Brie — ramo D5/D6F e D13F/D17', () => {

  it('T5 [D2F, D5F, D11V, D12F] quality já no teto (50) → nenhum incremento', () => {
    const item = updateOnce(BRIE, 5, 50);
    expect(item.sellIn).toBe(4);
    expect(item.quality).toBe(50);
  });

  it('T6 [D2F, D5V, D6F, D11V, D12V, D13F, D17F] vencido, teto atingido no 1º incremento → 2º incremento é bloqueado', () => {
    const item = updateOnce(BRIE, 0, 49);
    expect(item.sellIn).toBe(-1);
    expect(item.quality).toBe(50);
  });

  it('T11 [D2F, D5V, D6F, D11V, D12V, D13F, D17V] vencido, longe do teto → incremento duplo', () => {
    const item = updateOnce(BRIE, 0, 10);
    expect(item.sellIn).toBe(-1);
    expect(item.quality).toBe(12);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Backstage passes to a TAFKAL80ETC concert
// ─────────────────────────────────────────────────────────────────────────────
describe('Backstage passes — ramo D6V/D7/D8/D9/D10 e zeragem D14F', () => {

  it('T7 [D2F, D5V, D6V, D7F, D9F, D11V, D12F] fora das faixas de bônus (sellIn=15) → +1', () => {
    const item = updateOnce(BACKSTAGE, 15, 20);
    expect(item.sellIn).toBe(14);
    expect(item.quality).toBe(21);
  });

  it('T8 [D2F, D5V, D6V, D7V, D8F, D9F, D11V, D12F] faixa +2, teto atingido no 1º incremento → 2º é bloqueado', () => {
    const item = updateOnce(BACKSTAGE, 10, 49);
    expect(item.sellIn).toBe(9);
    expect(item.quality).toBe(50);
  });

  it('T9 [D2F, D5V, D6V, D7V, D8V, D9V, D10F, D11V, D12F] faixa +3, teto atingido no 2º incremento → 3º é bloqueado', () => {
    const item = updateOnce(BACKSTAGE, 5, 48);
    expect(item.sellIn).toBe(4);
    expect(item.quality).toBe(50);
  });

  it('T10 [D2F, D5V, D6V, D7V, D8V, D9V, D10V, D11V, D12V, D13V, D14F] dia do show, longe do teto → +3 e depois zera', () => {
    const item = updateOnce(BACKSTAGE, 0, 20);
    expect(item.sellIn).toBe(-1);
    expect(item.quality).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Matriz de cobertura de decisão (17 decisões × V/F = 34 resultados)
// ─────────────────────────────────────────────────────────────────────────────
//
// | Decisão | V coberto por        | F coberto por         |
// |---------|-----------------------|------------------------|
// | D1      | todos os testes      | todos os testes        |
// | D2      | T1,T2,T3,T4           | T5,T6,T7,T8,T9,T10,T11 |
// | D3      | T1,T3,T4              | T2                     |
// | D4      | T1,T2,T3              | T4                     |
// | D5      | T6,T7,T8,T9,T10,T11   | T5                     |
// | D6      | T7,T8,T9,T10          | T6,T11                 |
// | D7      | T8,T9,T10             | T7                     |
// | D8      | T9,T10                | T8                     |
// | D9      | T9,T10                | T7,T8                  |
// | D10     | T10                   | T9                     |
// | D11     | T1,T2,T3,T5,T6,T7,T8,T9,T10,T11 | T4          |
// | D12     | T2,T3,T4,T6,T10,T11   | T1,T5,T7,T8,T9         |
// | D13     | T2,T3,T4,T10          | T6,T11                 |
// | D14     | T2,T3,T4              | T10                    |
// | D15     | T3,T4                 | T2                     |
// | D16     | T3                    | T4                     |
// | D17     | T11                   | T6                     |
//
// 34/34 resultados V/F cobertos por 11 cenários (T1–T11), abaixo do limite teórico de
// V(G)=18 caminhos básicos porque Cobertura de Decisão é um critério mais fraco que
// Cobertura de Caminhos — não exige percorrer todas as combinações possíveis de decisões,
// só que cada uma isoladamente produza V e F ao menos uma vez.
