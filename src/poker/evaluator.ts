// @ts-nocheck
import { Carta } from '../../src/common/Card.js';
import { EvalResult, HandRank } from './types.js';

function ranksDesc(cards: Carta[]): number[] {
  return cards.map(c => c.numericalRank).sort((a,b)=>b-a);
}

function countRanks(cards: Carta[]) {
  const m = new Map<number, number>();
  for (const c of cards) m.set(c.numericalRank, (m.get(c.numericalRank) || 0) + 1);
  return m;
}

function uniqueSortedRanks(cards: Carta[]) {
  const set = new Set<number>(cards.map(c=>c.numericalRank));
  const arr = Array.from(set).sort((a,b)=>b-a);
  // if Ace present, add 1 for wheel straight detection (lowest ace value)
  if (set.has(14)) arr.push(1);
  return arr;
}

function findStraight(ranksDescUnique: number[]): number[] | null {
  if (ranksDescUnique.length < 5) return null;
  for (let i = 0; i <= ranksDescUnique.length - 5; i++) {
    const potentialStraight = ranksDescUnique.slice(i, i + 5);
    // Check if the 5 cards form a sequential straight (e.g., [7,6,5,4,3])
    // Or if it's a wheel straight [5,4,3,2,1]
    if (potentialStraight[0] - potentialStraight[4] === 4) {
        return potentialStraight;
    }
  }
  return null;
}

// Helper to get cards by their ranks
function getCardsByRank(allCards: Carta[], ranksToFind: number[], count: number = 1): Carta[] {
    const foundCards: Carta[] = [];
    const usedIndices = new Set<number>(); // To avoid using the same physical card multiple times

    for (const rank of ranksToFind) {
        let currentRankCount = 0;
        for (let i = 0; i < allCards.length; i++) {
            if (!usedIndices.has(i) && allCards[i].numericalRank === rank) {
                foundCards.push(allCards[i]);
                usedIndices.add(i);
                currentRankCount++;
                if (currentRankCount === count) break;
            }
        }
    }
    return foundCards;
}

// Helper to get cards by their ranks and suits for flushes
function getCardsByRankAndSuit(allCards: Carta[], ranksToFind: number[], suit: string): Carta[] {
    const foundCards: Carta[] = [];
    for (const rank of ranksToFind) {
        const card = allCards.find(c => c.numericalRank === rank && c.suit === suit);
        if (card) foundCards.push(card);
    }
    return foundCards;
}


export function evaluateHand(cards: Carta[]): EvalResult {
  // Sort all cards by rank descending, then by suit (arbitrary but consistent)
  const sortedCards = [...cards].sort((a, b) => {
    if (b.numericalRank !== a.numericalRank) return b.numericalRank - a.numericalRank;
    return a.suit.localeCompare(b.suit);
  });

  const rankCounts = countRanks(sortedCards);
  const byCount = new Map<number, number[]>();
  for (const [r,cnt] of rankCounts) {
    if (!byCount.has(cnt)) byCount.set(cnt, []);
    byCount.get(cnt)!.push(r);
  }
  for (const arr of byCount.values()) arr.sort((a,b)=>b-a);

  // Flush detection
  const suits = new Map<string, Carta[]>();
  for (const c of sortedCards) {
    const arr = suits.get(c.suit) || [];
    arr.push(c);
    suits.set(c.suit, arr);
  }
  let flushSuit: {suit: string, cards: Carta[]} | undefined;
  for (const [s, arr] of suits.entries()) {
      if (arr.length >= 5) {
          flushSuit = { suit: s, cards: arr.sort((a,b)=>b.numericalRank-a.numericalRank) }; // Already sorted by rank
          break;
      }
  }
  const flushCards = flushSuit ? flushSuit.cards : [];

  // Straight and Straight Flush
  const unique = uniqueSortedRanks(sortedCards);
  const straightRanks = findStraight(unique);
  let straightFlushRanks: number[] | null = null;
  if (flushCards.length >=5) {
    const uflush = uniqueSortedRanks(flushCards);
    straightFlushRanks = findStraight(uflush);
  }

  // --- Evaluate hand ranks and determine bestHand ---

  // Royal
  if (straightFlushRanks && straightFlushRanks[0] === 14) {
    return { rank: HandRank.RoyalFlush, ranks: [14], description: 'Escalera Real', bestHand: getCardsByRankAndSuit(sortedCards, [14, 13, 12, 11, 10], flushSuit!.suit) };
  }
  // Straight Flush
  if (straightFlushRanks) {
    return { rank: HandRank.StraightFlush, ranks: [straightFlushRanks[0]], description: 'Escalera de Color', bestHand: getCardsByRankAndSuit(sortedCards, straightFlushRanks, flushSuit!.suit) };
  }

  // Four of a kind
  if (byCount.has(4)) {
    const fourRank = byCount.get(4)![0];
    const bestHand: Carta[] = getCardsByRank(sortedCards, [fourRank], 4);
    const kicker = sortedCards.find(c => c.numericalRank !== fourRank);
    if (kicker) bestHand.push(kicker);
    return { rank: HandRank.FourOfKind, ranks: [fourRank, kicker ? kicker.numericalRank : 0], description: 'Póker', bestHand: bestHand };
  }

  // Full House
  if (byCount.has(3) && (byCount.get(3)!.length >=2 || byCount.has(2))) {
    const tripsRanks = byCount.get(3)!.slice().sort((a,b)=>b-a);
    let pairRank = (byCount.get(3) && byCount.get(3)!.length>=2) ? byCount.get(3)![1] : byCount.get(2)![0];
    if (byCount.get(2) && byCount.get(2)!.length > 0) { // Prefer a higher pair if available for the second part
      pairRank = Math.max(pairRank, byCount.get(2)![0]);
    }
    
    const bestHand: Carta[] = getCardsByRank(sortedCards, [tripsRanks[0]], 3);
    const pairCards = getCardsByRank(sortedCards.filter(c => c.numericalRank !== tripsRanks[0]), [pairRank], 2);
    bestHand.push(...pairCards);
    return { rank: HandRank.FullHouse, ranks: [tripsRanks[0], pairRank], description: 'Full House', bestHand: bestHand };
  }

  // Flush
  if (flushCards.length >=5) {
    const top5 = flushCards.slice(0,5);
    return { rank: HandRank.Flush, ranks: top5.map(c=>c.numericalRank), description: 'Color', bestHand: top5 };
  }

  // Straight
  if (straightRanks) {
    // Need to reconstruct the cards for the bestHand
    const bestHand: Carta[] = [];
    const usedRanks = new Set<number>();
    for (const rank of straightRanks) {
        // Find one card of this rank
        const card = sortedCards.find(c => c.numericalRank === rank && !usedRanks.has(c.numericalRank));
        if (card) {
            bestHand.push(card);
            usedRanks.add(rank);
        }
    }
    // Handle ace-low straight (A,2,3,4,5) where Ace is 1
    if (bestHand.length < 5 && straightRanks.includes(1) && straightRanks.includes(5)) {
        const aceCard = sortedCards.find(c => c.numericalRank === 14 && !usedRanks.has(14));
        if (aceCard) {
            bestHand.push(aceCard);
            usedRanks.add(14);
        }
    }
    return { rank: HandRank.Straight, ranks: [straightRanks[0]], description: 'Escalera', bestHand: bestHand.slice(0,5) };
  }

  // Three of a kind
  if (byCount.has(3)) {
    const threeRank = byCount.get(3)![0];
    const bestHand: Carta[] = getCardsByRank(sortedCards, [threeRank], 3);
    const kickers = sortedCards.filter(c => c.numericalRank !== threeRank).slice(0,2);
    bestHand.push(...kickers);
    return { rank: HandRank.ThreeOfKind, ranks: [threeRank, ...kickers.map(c=>c.numericalRank)], description: 'Trío', bestHand: bestHand };
  }

  // Two pair
  if (byCount.has(2) && byCount.get(2)!.length >=2) {
    const pairsRanks = byCount.get(2)!.slice().sort((a,b)=>b-a);
    const bestHand: Carta[] = getCardsByRank(sortedCards, [pairsRanks[0]], 2);
    bestHand.push(...getCardsByRank(sortedCards.filter(c => c.numericalRank !== pairsRanks[0]), [pairsRanks[1]], 2));
    const kicker = sortedCards.find(c => c.numericalRank !== pairsRanks[0] && c.numericalRank !== pairsRanks[1]);
    if (kicker) bestHand.push(kicker);
    return { rank: HandRank.TwoPair, ranks: [pairsRanks[0], pairsRanks[1], kicker ? kicker.numericalRank : 0], description: 'Doble pareja', bestHand: bestHand };
  }

  // Pair
  if (byCount.has(2)) {
    const pairRank = byCount.get(2)![0];
    const bestHand: Carta[] = getCardsByRank(sortedCards, [pairRank], 2);
    const kickers = sortedCards.filter(c => c.numericalRank !== pairRank).slice(0,3);
    bestHand.push(...kickers);
    return { rank: HandRank.Pair, ranks: [pairRank, ...kickers.map(c=>c.numericalRank)], description: 'Pareja', bestHand: bestHand };
  }

  // High card
  const tops = sortedCards.slice(0,5);
  return { rank: HandRank.HighCard, ranks: tops.map(c=>c.numericalRank), description: 'Carta alta', bestHand: tops };
}

export function compareEval(a: EvalResult, b: EvalResult): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i=0;i<Math.max(a.ranks.length,b.ranks.length);i++) {
    const av = a.ranks[i]||0; const bv = b.ranks[i]||0;
    if (av !== bv) return av - bv;
  }
  return 0;
}
