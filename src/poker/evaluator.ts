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

function uniqueSortedRanks(cards: Carta[]): number[] {
  const set = new Set<number>(cards.map(c => c.numericalRank));
  const arr = Array.from(set).sort((a, b) => b - a);
  // If Ace (14) is present, add 1 for wheel straight detection (lowest ace value)
  if (set.has(14)) arr.push(1);
  return arr;
}

/**
 * Finds if a straight exists within the given sorted unique ranks.
 * Returns the ranks of the highest card in the straight, or null.
 * @param ranksDescUnique An array of unique, sorted numerical ranks (descending), including Ace as 1 if present.
 * @returns An array of 5 ranks forming the straight (highest first), or null.
 */
function findStraight(ranksDescUnique: number[]): number[] | null {
  if (ranksDescUnique.length < 5) return null;

  for (let i = 0; i <= ranksDescUnique.length - 5; i++) {
    const potentialStraight = ranksDescUnique.slice(i, i + 5);
    // Check if the 5 cards form a sequential straight (e.g., [7,6,5,4,3])
    if (potentialStraight[0] - potentialStraight[4] === 4) {
      return potentialStraight;
    }
  }
  return null;
}

/**
 * Helper to get actual Carta objects given an array of cards and target ranks.
 * Ensures that only unique cards (by reference) are picked for the best hand.
 */
function getCardsByRanks(allCards: Carta[], targetRanks: number[], suit?: string): Carta[] {
    const bestHand: Carta[] = [];
    const usedCardIndices = new Set<number>();

    for (const targetRank of targetRanks) {
        // For Ace-low straight (A-2-3-4-5), map rank 1 back to 14 for finding the actual Ace card.
        const effectiveRank = targetRank === 1 ? 14 : targetRank;
        const card = allCards.find((c, index) =>
            !usedCardIndices.has(index) &&
            c.numericalRank === effectiveRank &&
            (!suit || c.suit === suit)
        );
        if (card) {
            bestHand.push(card);
            usedCardIndices.add(allCards.indexOf(card)); // Add index of the card to prevent reuse
        }
    }
    // Sort the final hand by rank descending for consistent tie-breaking later if needed
    return bestHand.sort((a, b) => b.numericalRank - a.numericalRank);
}


export function evaluateHand(cards: Carta[]): EvalResult {
  // We need exactly 7 cards (2 hole + 5 community) to evaluate.
  // Or fewer during testing if we are testing a subset.
  if (cards.length < 5 || cards.length > 7) {
      // This case should ideally not happen in a full game but good for robustness
      // For poker, we always take 5 cards for evaluation.
  }

  // Sort all cards by rank descending.
  // This sorting helps in selecting kickers and constructing best hands.
  const sortedCards = [...cards].sort((a, b) => b.numericalRank - a.numericalRank);

  // Count ranks for pairs, trips, quads
  const rankCounts = countRanks(sortedCards); // Map<rank, count>
  const countsByRank: Map<number, number[]> = new Map(); // Map<count, [ranks]>
  for (const [rank, count] of rankCounts) {
    if (!countsByRank.has(count)) countsByRank.set(count, []);
    countsByRank.get(count)!.push(rank);
  }
  // Sort ranks within each count category in descending order
  for (const arr of countsByRank.values()) arr.sort((a, b) => b - a);

  // Flush detection: find if any suit has 5 or more cards
  const suitsMap = new Map<string, Carta[]>();
  for (const c of sortedCards) {
    const arr = suitsMap.get(c.suit) || [];
    arr.push(c);
    suitsMap.set(c.suit, arr);
  }
  let flushSuitCards: Carta[] = [];
  for (const [s, arr] of suitsMap.entries()) {
    if (arr.length >= 5) {
      flushSuitCards = arr.sort((a, b) => b.numericalRank - a.numericalRank);
      break; // Found a flush, take the highest ranked one
    }
  }

  // Straight and Straight Flush detection
  const uniqueRanksAllCards = uniqueSortedRanks(sortedCards);
  const straightRanksAllCards = findStraight(uniqueRanksAllCards);

  let straightFlushRanks: number[] | null = null;
  let straightFlushSuit: string | undefined;
  if (flushSuitCards.length >= 5) {
    const uniqueRanksFlush = uniqueSortedRanks(flushSuitCards);
    straightFlushRanks = findStraight(uniqueRanksFlush);
    if (straightFlushRanks) {
        straightFlushSuit = flushSuitCards[0].suit; // Any card in the flush will have this suit
    }
  }

  // --- Evaluate hand ranks and determine bestHand ---

  // Royal Flush
  if (straightFlushRanks && straightFlushRanks[0] === 14 && straightFlushSuit) {
    return {
      rank: HandRank.RoyalFlush,
      ranks: [14],
      description: 'Escalera Real',
      bestHand: getCardsByRanks(sortedCards, [14, 13, 12, 11, 10], straightFlushSuit)
    };
  }
  // Straight Flush
  if (straightFlushRanks && straightFlushSuit) {
    return {
      rank: HandRank.StraightFlush,
      ranks: [straightFlushRanks[0]],
      description: 'Escalera de Color',
      bestHand: getCardsByRanks(sortedCards, straightFlushRanks, straightFlushSuit)
    };
  }

  // Four of a kind
  if (countsByRank.has(4)) {
    const fourRank = countsByRank.get(4)![0];
    const bestHand: Carta[] = getCardsByRanks(sortedCards, [fourRank, fourRank, fourRank, fourRank]);
    const kickerCandidates = sortedCards.filter(c => c.numericalRank !== fourRank);
    if (kickerCandidates.length > 0) {
      bestHand.push(kickerCandidates[0]);
    }
    return {
      rank: HandRank.FourOfKind,
      ranks: [fourRank, bestHand[4] ? bestHand[4].numericalRank : 0],
      description: 'Póker',
      bestHand: bestHand
    };
  }

  // Full House
  if (countsByRank.has(3) && (countsByRank.get(3)!.length >= 2 || countsByRank.has(2))) {
    const tripsRanks = countsByRank.get(3) || [];
    const pairsRanks = countsByRank.get(2) || [];

    // Combine all possible pair ranks including a second trip as a pair for FH
    let allPairCandidates: number[] = [...pairsRanks];
    if (tripsRanks.length >= 2) {
        allPairCandidates.push(tripsRanks[1]); // Use the second highest trip as a pair
    }
    allPairCandidates.sort((a,b) => b-a); // Sort descending

    const bestTripRank = tripsRanks[0];
    const bestPairRank = allPairCandidates.length > 0 ? allPairCandidates[0] : null;

    if (bestTripRank && bestPairRank) {
        const bestHand: Carta[] = getCardsByRanks(sortedCards, [bestTripRank, bestTripRank, bestTripRank, bestPairRank, bestPairRank]);
        // Ensure 5 cards are selected. If getCardsByRanks doesn't provide enough (e.g. not enough cards in original pool)
        // this would be an issue with initial card generation.
        if (bestHand.length === 5) {
            return {
                rank: HandRank.FullHouse,
                ranks: [bestTripRank, bestPairRank],
                description: 'Full House',
                bestHand: bestHand
            };
        }
    }
  }

  // Flush
  if (flushSuitCards.length >= 5) {
    const top5Flush = flushSuitCards.slice(0, 5);
    return {
      rank: HandRank.Flush,
      ranks: top5Flush.map(c => c.numericalRank),
      description: 'Color',
      bestHand: top5Flush
    };
  }

  // Straight
  if (straightRanksAllCards) {
    // Reconstruct the best hand of Carta objects for the straight
    const bestHand: Carta[] = getCardsByRanks(sortedCards, straightRanksAllCards);
    return {
      rank: HandRank.Straight,
      ranks: [straightRanksAllCards[0]],
      description: 'Escalera',
      bestHand: bestHand
    };
  }

  // Three of a kind
  if (countsByRank.has(3)) {
    const threeRank = countsByRank.get(3)![0];
    const bestHand: Carta[] = getCardsByRanks(sortedCards, [threeRank, threeRank, threeRank]);
    const kickerCandidates = sortedCards.filter(c => c.numericalRank !== threeRank);
    bestHand.push(...kickerCandidates.slice(0, 2)); // Add two highest kickers
    return {
      rank: HandRank.ThreeOfKind,
      ranks: [threeRank, bestHand[3] ? bestHand[3].numericalRank : 0, bestHand[4] ? bestHand[4].numericalRank : 0],
      description: 'Trío',
      bestHand: bestHand
    };
  }

  // Two pair
  if (countsByRank.has(2) && countsByRank.get(2)!.length >= 2) {
    const pairsRanks = countsByRank.get(2)!.slice(0, 2); // Get top two pairs
    const bestHand: Carta[] = getCardsByRanks(sortedCards, [pairsRanks[0], pairsRanks[0], pairsRanks[1], pairsRanks[1]]);
    const kickerCandidates = sortedCards.filter(c => c.numericalRank !== pairsRanks[0] && c.numericalRank !== pairsRanks[1]);
    if (kickerCandidates.length > 0) {
      bestHand.push(kickerCandidates[0]); // Add highest kicker
    }
    return {
      rank: HandRank.TwoPair,
      ranks: [pairsRanks[0], pairsRanks[1], bestHand[4] ? bestHand[4].numericalRank : 0],
      description: 'Doble pareja',
      bestHand: bestHand
    };
  }

  // Pair
  if (countsByRank.has(2)) {
    const pairRank = countsByRank.get(2)![0];
    const bestHand: Carta[] = getCardsByRanks(sortedCards, [pairRank, pairRank]);
    const kickerCandidates = sortedCards.filter(c => c.numericalRank !== pairRank);
    bestHand.push(...kickerCandidates.slice(0, 3)); // Add three highest kickers
    return {
      rank: HandRank.Pair,
      ranks: [pairRank, bestHand[2] ? bestHand[2].numericalRank : 0, bestHand[3] ? bestHand[3].numericalRank : 0, bestHand[4] ? bestHand[4].numericalRank : 0],
      description: 'Pareja',
      bestHand: bestHand
    };
  }

  // High card
  const top5Cards = sortedCards.slice(0, 5);
  return {
    rank: HandRank.HighCard,
    ranks: top5Cards.map(c => c.numericalRank),
    description: 'Carta alta',
    bestHand: top5Cards
  };
}

export function compareEval(a: EvalResult, b: EvalResult): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.max(a.ranks.length, b.ranks.length); i++) {
    const av = a.ranks[i] || 0;
    const bv = b.ranks[i] || 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}
