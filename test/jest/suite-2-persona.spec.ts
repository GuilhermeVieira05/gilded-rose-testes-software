// Suite 2 — Persona Pattern
// Gerada com o Prompt 2 (Persona de QA Sênior)

import { Item, GildedRose } from '@/gilded-rose';

function updateOnce(name: string, sellIn: number, quality: number): Item {
  const shop = new GildedRose([new Item(name, sellIn, quality)]);
  return shop.updateQuality()[0];
}

describe('Gilded Rose — Suite 2 Persona', () => {

  // ─── Item normal ───────────────────────────────────────────────────────────

  describe('Item normal', () => {
    it('diminui sellIn em 1 a cada dia', () => {
      const item = updateOnce('Elixir of the Mongoose', 5, 10);
      expect(item.sellIn).toBe(4);
    });

    it('diminui quality em 1 antes do prazo', () => {
      const item = updateOnce('Elixir of the Mongoose', 5, 10);
      expect(item.quality).toBe(9);
    });

    it('diminui quality em 2 quando sellIn chega a 0 (dia do vencimento)', () => {
      const item = updateOnce('Elixir of the Mongoose', 0, 10);
      expect(item.quality).toBe(8);
    });

    it('diminui quality em 2 quando sellIn já é negativo (vencido)', () => {
      const item = updateOnce('Elixir of the Mongoose', -1, 10);
      expect(item.quality).toBe(8);
    });

    it('quality nunca fica abaixo de 0 antes do prazo', () => {
      const item = updateOnce('Elixir of the Mongoose', 5, 0);
      expect(item.quality).toBe(0);
    });

    it('quality nunca fica abaixo de 0 depois do prazo', () => {
      const item = updateOnce('Elixir of the Mongoose', -1, 0);
      expect(item.quality).toBe(0);
    });

    it('quality não fica negativa quando vale 1 e está vencido', () => {
      const item = updateOnce('Elixir of the Mongoose', -1, 1);
      expect(item.quality).toBe(0);
    });
  });

  // ─── Aged Brie ─────────────────────────────────────────────────────────────

  describe('Aged Brie', () => {
    it('aumenta quality em 1 antes do prazo', () => {
      const item = updateOnce('Aged Brie', 5, 10);
      expect(item.quality).toBe(11);
    });

    it('aumenta quality em 2 quando sellIn chega a 0', () => {
      const item = updateOnce('Aged Brie', 0, 10);
      expect(item.quality).toBe(12);
    });

    it('aumenta quality em 2 quando já está vencido', () => {
      const item = updateOnce('Aged Brie', -1, 10);
      expect(item.quality).toBe(12);
    });

    it('quality nunca ultrapassa 50 antes do prazo', () => {
      const item = updateOnce('Aged Brie', 5, 50);
      expect(item.quality).toBe(50);
    });

    it('quality nunca ultrapassa 50 depois do prazo', () => {
      const item = updateOnce('Aged Brie', -1, 49);
      expect(item.quality).toBe(50);
    });

    it('não ultrapassa 50 mesmo quando teria aumento duplo', () => {
      const item = updateOnce('Aged Brie', -1, 50);
      expect(item.quality).toBe(50);
    });

    it('diminui sellIn normalmente', () => {
      const item = updateOnce('Aged Brie', 3, 10);
      expect(item.sellIn).toBe(2);
    });
  });

  // ─── Sulfuras ───────────────────────────────────────────────────────────────

  describe('Sulfuras, Hand of Ragnaros', () => {
    it('nunca altera quality', () => {
      const item = updateOnce('Sulfuras, Hand of Ragnaros', 5, 80);
      expect(item.quality).toBe(80);
    });

    it('nunca altera sellIn', () => {
      const item = updateOnce('Sulfuras, Hand of Ragnaros', 5, 80);
      expect(item.sellIn).toBe(5);
    });

    it('não altera quality mesmo com sellIn negativo', () => {
      const item = updateOnce('Sulfuras, Hand of Ragnaros', -1, 80);
      expect(item.quality).toBe(80);
    });

    it('não altera sellIn mesmo quando já negativo', () => {
      const item = updateOnce('Sulfuras, Hand of Ragnaros', -1, 80);
      expect(item.sellIn).toBe(-1);
    });
  });

  // ─── Backstage passes ──────────────────────────────────────────────────────

  describe('Backstage passes to a TAFKAL80ETC concert', () => {
    const NAME = 'Backstage passes to a TAFKAL80ETC concert';

    it('aumenta quality em 1 quando sellIn > 10', () => {
      const item = updateOnce(NAME, 11, 20);
      expect(item.quality).toBe(21);
    });

    it('aumenta quality em 1 quando sellIn é exatamente 11', () => {
      const item = updateOnce(NAME, 11, 20);
      expect(item.quality).toBe(21);
    });

    it('aumenta quality em 2 quando sellIn é 10', () => {
      const item = updateOnce(NAME, 10, 20);
      expect(item.quality).toBe(22);
    });

    it('aumenta quality em 2 quando sellIn é 6', () => {
      const item = updateOnce(NAME, 6, 20);
      expect(item.quality).toBe(22);
    });

    it('aumenta quality em 3 quando sellIn é 5', () => {
      const item = updateOnce(NAME, 5, 20);
      expect(item.quality).toBe(23);
    });

    it('aumenta quality em 3 quando sellIn é 1', () => {
      const item = updateOnce(NAME, 1, 20);
      expect(item.quality).toBe(23);
    });

    it('quality cai para 0 quando sellIn é 0 (após o show)', () => {
      const item = updateOnce(NAME, 0, 20);
      expect(item.quality).toBe(0);
    });

    it('quality permanece 0 quando sellIn já é negativo', () => {
      const item = updateOnce(NAME, -1, 0);
      expect(item.quality).toBe(0);
    });

    it('quality nunca ultrapassa 50 com aumento simples', () => {
      const item = updateOnce(NAME, 15, 50);
      expect(item.quality).toBe(50);
    });

    it('quality nunca ultrapassa 50 com aumento duplo (sellIn=10)', () => {
      const item = updateOnce(NAME, 10, 49);
      expect(item.quality).toBe(50);
    });

    it('quality nunca ultrapassa 50 com aumento triplo (sellIn=5)', () => {
      const item = updateOnce(NAME, 5, 48);
      expect(item.quality).toBe(50);
    });

    it('diminui sellIn normalmente', () => {
      const item = updateOnce(NAME, 10, 20);
      expect(item.sellIn).toBe(9);
    });
  });

  // ─── Múltiplos dias acumulados ──────────────────────────────────────────────

  describe('Comportamento acumulado ao longo de múltiplos dias', () => {
    it('item normal chega a quality 0 após dias suficientes', () => {
      const shop = new GildedRose([new Item('Dexterity Vest', 10, 5)]);
      for (let i = 0; i < 10; i++) shop.updateQuality();
      expect(shop.items[0].quality).toBe(0);
    });

    it('Aged Brie acumula quality até 50 ao longo dos dias', () => {
      const shop = new GildedRose([new Item('Aged Brie', 60, 0)]);
      for (let i = 0; i < 50; i++) shop.updateQuality();
      expect(shop.items[0].quality).toBe(50);
    });

    it('Backstage passes chegam a 0 após o show e ficam em 0', () => {
      const NAME = 'Backstage passes to a TAFKAL80ETC concert';
      const shop = new GildedRose([new Item(NAME, 1, 20)]);
      shop.updateQuality(); // sellIn vira 0, quality += 3 → 23
      shop.updateQuality(); // sellIn vira -1, quality → 0
      expect(shop.items[0].quality).toBe(0);
    });

    it('múltiplos itens são atualizados de forma independente', () => {
      const shop = new GildedRose([
        new Item('Elixir of the Mongoose', 5, 10),
        new Item('Aged Brie', 5, 10),
      ]);
      shop.updateQuality();
      expect(shop.items[0].quality).toBe(9);
      expect(shop.items[1].quality).toBe(11);
    });
  });

});
