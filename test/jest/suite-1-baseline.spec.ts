// Suite 1 — Baseline
// Gerada com o Prompt 1 (sem técnica especial)
// Cole aqui o código gerado pelo Claude na sessão do Prompt 1

import { Item, GildedRose } from '@/gilded-rose';

describe('Gilded Rose — Suite 1 Baseline', () => {
  describe('Item normal', () => {
    it('diminui quality em 1 a cada dia', () => {
      const gildedRose = new GildedRose([new Item('Elixir of the Mongoose', 5, 10)]);
      const items = gildedRose.updateQuality();
      expect(items[0].quality).toBe(9);
    });

    it('diminui sellIn em 1 a cada dia', () => {
      const gildedRose = new GildedRose([new Item('Elixir of the Mongoose', 5, 10)]);
      const items = gildedRose.updateQuality();
      expect(items[0].sellIn).toBe(4);
    });

    it('quality nunca fica negativa', () => {
      const gildedRose = new GildedRose([new Item('Elixir of the Mongoose', 5, 0)]);
      const items = gildedRose.updateQuality();
      expect(items[0].quality).toBe(0);
    });

    it('quality degrada duas vezes mais rapido apos sellIn chegar a zero', () => {
      const gildedRose = new GildedRose([new Item('Elixir of the Mongoose', 0, 10)]);
      const items = gildedRose.updateQuality();
      expect(items[0].quality).toBe(8);
    });

    it('quality nunca fica negativa apos sellIn expirar', () => {
      const gildedRose = new GildedRose([new Item('Elixir of the Mongoose', 0, 1)]);
      const items = gildedRose.updateQuality();
      expect(items[0].quality).toBe(0);
    });
  });

  describe('Aged Brie', () => {
    it('aumenta quality com o tempo', () => {
      const gildedRose = new GildedRose([new Item('Aged Brie', 5, 10)]);
      const items = gildedRose.updateQuality();
      expect(items[0].quality).toBe(11);
    });

    it('quality nao ultrapassa 50', () => {
      const gildedRose = new GildedRose([new Item('Aged Brie', 5, 50)]);
      const items = gildedRose.updateQuality();
      expect(items[0].quality).toBe(50);
    });

    it('quality aumenta apos sellIn expirar', () => {
      const gildedRose = new GildedRose([new Item('Aged Brie', 0, 10)]);
      const items = gildedRose.updateQuality();
      expect(items[0].quality).toBe(12);
    });
  });

  describe('Sulfuras', () => {
    it('nao altera quality', () => {
      const gildedRose = new GildedRose([new Item('Sulfuras, Hand of Ragnaros', 5, 80)]);
      const items = gildedRose.updateQuality();
      expect(items[0].quality).toBe(80);
    });

    it('nao altera sellIn', () => {
      const gildedRose = new GildedRose([new Item('Sulfuras, Hand of Ragnaros', 5, 80)]);
      const items = gildedRose.updateQuality();
      expect(items[0].sellIn).toBe(5);
    });
  });

  describe('Backstage passes', () => {
    it('aumenta quality em 1 quando sellIn > 10', () => {
      const gildedRose = new GildedRose([new Item('Backstage passes to a TAFKAL80ETC concert', 15, 20)]);
      const items = gildedRose.updateQuality();
      expect(items[0].quality).toBe(21);
    });

    it('aumenta quality em 2 quando sellIn esta entre 6 e 10', () => {
      const gildedRose = new GildedRose([new Item('Backstage passes to a TAFKAL80ETC concert', 10, 20)]);
      const items = gildedRose.updateQuality();
      expect(items[0].quality).toBe(22);
    });

    it('aumenta quality em 3 quando sellIn esta entre 1 e 5', () => {
      const gildedRose = new GildedRose([new Item('Backstage passes to a TAFKAL80ETC concert', 5, 20)]);
      const items = gildedRose.updateQuality();
      expect(items[0].quality).toBe(23);
    });

    it('quality vai a zero apos o concerto', () => {
      const gildedRose = new GildedRose([new Item('Backstage passes to a TAFKAL80ETC concert', 0, 20)]);
      const items = gildedRose.updateQuality();
      expect(items[0].quality).toBe(0);
    });

    it('quality nao ultrapassa 50', () => {
      const gildedRose = new GildedRose([new Item('Backstage passes to a TAFKAL80ETC concert', 5, 49)]);
      const items = gildedRose.updateQuality();
      expect(items[0].quality).toBe(50);
    });
  });

  describe('multiplos itens', () => {
    it('atualiza todos os itens corretamente', () => {
      const gildedRose = new GildedRose([
        new Item('Elixir of the Mongoose', 5, 10),
        new Item('Aged Brie', 3, 20),
      ]);
      const items = gildedRose.updateQuality();
      expect(items[0].quality).toBe(9);
      expect(items[1].quality).toBe(21);
    });
  });
});
