import { Carta, Palo, Rango } from '../../src/common/Card';
import { evaluateHand, compareEval } from '../../src/poker/evaluator';
import { HandRank } from '../../src/poker/types';

// Helper to create a card
const card = (rango: Rango, palo: Palo): Carta => new Carta(palo, rango);

describe('evaluateHand', () => {
  // Royal Flush
  test('should correctly identify a Royal Flush', () => {
    const cards = [
      card('as', 'corazones'), card('k', 'corazones'), card('q', 'corazones'),
      card('j', 'corazones'), card('10', 'corazones'), card('2', 'picas'), card('3', 'picas')
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.RoyalFlush);
    expect(result.description).toBe('Escalera Real');
    expect(result.bestHand.length).toBe(5);
  });

  // Straight Flush
  test('should correctly identify a Straight Flush', () => {
    const cards = [
      card('9', 'corazones'), card('8', 'corazones'), card('7', 'corazones'),
      card('6', 'corazones'), card('5', 'corazones'), card('k', 'picas'), card('q', 'trebol')
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.StraightFlush);
    expect(result.description).toBe('Escalera de Color');
    expect(result.ranks[0]).toBe(9);
    expect(result.bestHand.length).toBe(5);
  });

  test('should correctly identify an Ace-low Straight Flush (5-4-3-2-A)', () => {
    const cards = [
      card('as', 'rombo'), card('2', 'rombo'), card('3', 'rombo'),
      card('4', 'rombo'), card('5', 'rombo'), card('k', 'picas'), card('q', 'trebol')
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.StraightFlush);
    expect(result.description).toBe('Escalera de Color');
    expect(result.ranks[0]).toBe(5); // Ace-low straight's highest card is 5
    expect(result.bestHand.length).toBe(5);
  });

  // Four of a Kind
  test('should correctly identify Four of a Kind', () => {
    const cards = [
      card('as', 'corazones'), card('as', 'rombo'), card('as', 'picas'),
      card('as', 'trebol'), card('k', 'corazones'), card('q', 'picas'), card('2', 'rombo')
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.FourOfKind);
    expect(result.description).toBe('Póker');
    expect(result.ranks[0]).toBe(14); // Four Aces
    expect(result.bestHand.length).toBe(5);
  });

  // Full House
  test('should correctly identify a Full House (trips over pair)', () => {
    const cards = [
      card('k', 'corazones'), card('k', 'rombo'), card('k', 'picas'),
      card('q', 'trebol'), card('q', 'picas'), card('2', 'rombo'), card('3', 'corazones')
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.FullHouse);
    expect(result.description).toBe('Full House');
    expect(result.ranks[0]).toBe(13); // Kings
    expect(result.ranks[1]).toBe(12); // Queens
    expect(result.bestHand.length).toBe(5);
  });

  test('should correctly identify a Full House (from two trips)', () => {
    const cards = [
      card('k', 'corazones'), card('k', 'rombo'), card('k', 'picas'),
      card('q', 'trebol'), card('q', 'picas'), card('q', 'rombo'), card('2', 'corazones')
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.FullHouse);
    expect(result.description).toBe('Full House');
    expect(result.ranks[0]).toBe(13); // Kings
    expect(result.ranks[1]).toBe(12); // Queens (the second trip acts as a pair)
    expect(result.bestHand.length).toBe(5);
  });

  test('should correctly identify a Full House (from three pairs, highest pair + highest second pair)', () => {
    const cards = [
      card('k', 'corazones'), card('k', 'rombo'), card('k', 'picas'),
      card('q', 'trebol'), card('q', 'picas'), card('j', 'rombo'), card('j', 'corazones')
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.FullHouse);
    expect(result.description).toBe('Full House');
    expect(result.ranks[0]).toBe(13); // Kings
    expect(result.ranks[1]).toBe(12); // Queens
    expect(result.bestHand.length).toBe(5);
  });

  // Flush
  test('should correctly identify a Flush', () => {
    const cards = [
      card('as', 'corazones'), card('k', 'corazones'), card('10', 'corazones'),
      card('7', 'corazones'), card('3', 'corazones'), card('2', 'picas'), card('q', 'rombo')
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.Flush);
    expect(result.description).toBe('Color');
    expect(result.ranks[0]).toBe(14); // Ace of hearts
    expect(result.bestHand.length).toBe(5);
  });

  // Straight
  test('should correctly identify a Straight', () => {
    const cards = [
      card('j', 'corazones'), card('10', 'rombo'), card('9', 'picas'),
      card('8', 'trebol'), card('7', 'corazones'), card('k', 'picas'), card('2', 'rombo')
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.Straight);
    expect(result.description).toBe('Escalera');
    expect(result.ranks[0]).toBe(11); // Jack-high straight
    expect(result.bestHand.length).toBe(5);
  });

  test('should correctly identify an Ace-low Straight (5-4-3-2-A)', () => {
    const cards = [
      card('as', 'corazones'), card('2', 'rombo'), card('3', 'picas'),
      card('4', 'trebol'), card('5', 'corazones'), card('j', 'picas'), card('k', 'rombo')
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.Straight);
    expect(result.description).toBe('Escalera');
    expect(result.ranks[0]).toBe(5); // 5-high straight
    expect(result.bestHand.length).toBe(5);
  });

  // Three of a Kind
  test('should correctly identify Three of a Kind', () => {
    const cards = [
      card('10', 'corazones'), card('10', 'rombo'), card('10', 'picas'),
      card('as', 'trebol'), card('k', 'corazones'), card('q', 'picas'), card('2', 'rombo')
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.ThreeOfKind);
    expect(result.description).toBe('Trío');
    expect(result.ranks[0]).toBe(10); // Three Tens
    expect(result.bestHand.length).toBe(5);
  });

  // Two Pair
  test('should correctly identify Two Pair', () => {
    const cards = [
      card('k', 'corazones'), card('k', 'rombo'), card('q', 'picas'),
      card('q', 'trebol'), card('as', 'corazones'), card('2', 'rombo'), card('3', 'picas')
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.TwoPair);
    expect(result.description).toBe('Doble pareja');
    expect(result.ranks[0]).toBe(13); // Kings
    expect(result.ranks[1]).toBe(12); // Queens
    expect(result.bestHand.length).toBe(5);
  });

  // One Pair
  test('should correctly identify One Pair', () => {
    const cards = [
      card('as', 'corazones'), card('as', 'rombo'), card('k', 'picas'),
      card('q', 'trebol'), card('9', 'corazones'), card('7', 'picas'), card('2', 'rombo') // Changed J and 10 to 9 and 7 to break straight
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.Pair);
    expect(result.description).toBe('Pareja');
    expect(result.ranks[0]).toBe(14); // Pair of Aces
    expect(result.bestHand.length).toBe(5);
  });

  // High Card
  test('should correctly identify High Card', () => {
    const cards = [
      card('as', 'corazones'), card('k', 'rombo'), card('q', 'picas'),
      card('j', 'trebol'), card('9', 'corazones'), card('7', 'picas'), card('2', 'rombo')
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.HighCard);
    expect(result.description).toBe('Carta alta');
    expect(result.ranks[0]).toBe(14); // Ace high
    expect(result.bestHand.length).toBe(5);
  });

  // --- Tie-breaker Tests for compareEval ---
  describe('compareEval', () => {
    test('should correctly compare two High Card hands', () => {
      const handA = evaluateHand([card('as', 'picas'), card('k', 'rombo'), card('q', 'trebol'), card('j', 'corazones'), card('9', 'picas')]);
      const handB = evaluateHand([card('k', 'picas'), card('q', 'rombo'), card('j', 'trebol'), card('10', 'corazones'), card('8', 'picas')]);
      expect(compareEval(handA, handB)).toBeGreaterThan(0); // Ace high > King high
    });

    test('should correctly compare two Pair hands', () => {
      const handA = evaluateHand([card('k', 'picas'), card('k', 'rombo'), card('as', 'trebol'), card('q', 'corazones'), card('j', 'picas')]);
      const handB = evaluateHand([card('q', 'picas'), card('q', 'rombo'), card('as', 'trebol'), card('k', 'corazones'), card('10', 'picas')]);
      expect(compareEval(handA, handB)).toBeGreaterThan(0); // Pair of Kings > Pair of Queens
    });

    test('should correctly compare two Pair hands with same pair but different kickers', () => {
      const handA = evaluateHand([card('k', 'picas'), card('k', 'rombo'), card('as', 'trebol'), card('q', 'corazones'), card('10', 'picas')]);
      const handB = evaluateHand([card('k', 'picas'), card('k', 'rombo'), card('q', 'trebol'), card('j', 'corazones'), card('9', 'picas')]);
      expect(compareEval(handA, handB)).toBeGreaterThan(0); // Pair of Kings, Ace kicker > Pair of Kings, Queen kicker
    });

    test('should correctly compare two Two Pair hands', () => {
      const handA = evaluateHand([card('k', 'picas'), card('k', 'rombo'), card('q', 'trebol'), card('q', 'corazones'), card('as', 'picas')]);
      const handB = evaluateHand([card('j', 'picas'), card('j', 'rombo'), card('10', 'trebol'), card('10', 'corazones'), card('k', 'picas')]);
      expect(compareEval(handA, handB)).toBeGreaterThan(0); // KKQQ > JJT
    });

    test('should correctly compare two Flush hands', () => {
      const handA = evaluateHand([card('as', 'corazones'), card('k', 'corazones'), card('q', 'corazones'), card('j', 'corazones'), card('9', 'corazones')]);
      const handB = evaluateHand([card('k', 'corazones'), card('q', 'corazones'), card('j', 'corazones'), card('10', 'corazones'), card('8', 'corazones')]);
      expect(compareEval(handA, handB)).toBeGreaterThan(0); // Ace high flush > King high flush
    });

    test('should return 0 for identical hands', () => {
      const cards = [
        card('as', 'corazones'), card('k', 'corazones'), card('q', 'corazones'),
        card('j', 'corazones'), card('10', 'corazones'), card('2', 'picas'), card('3', 'picas')
      ];
      const handA = evaluateHand(cards);
      const handB = evaluateHand(cards);
      expect(compareEval(handA, handB)).toBe(0);
    });

    test('should correctly compare hands with different ranks', () => {
      const royalFlush = evaluateHand([
        card('as', 'corazones'), card('k', 'corazones'), card('q', 'corazones'),
        card('j', 'corazones'), card('10', 'corazones')
      ]);
      const straightFlush = evaluateHand([
        card('9', 'rombo'), card('8', 'rombo'), card('7', 'rombo'),
        card('6', 'rombo'), card('5', 'rombo')
      ]);
      expect(compareEval(royalFlush, straightFlush)).toBeGreaterThan(0);
    });
  });
});
