// @ts-nocheck
import { PokerPlayer, ActionType } from './types.js';
import { Carta } from '../../src/common/Card.js';
import { evaluateHand } from './evaluator.js';

// Simple rule-based AI: based on hand strength pre-flop and on evaluator after flop.
export function simpleAI(player: PokerPlayer, community: Carta[], minCall: number, pot: number): { type: ActionType, amount?: number } {
  // If player has no chips, they must check.
  if (player.stack <= 0) return { type: 'check' };

  // If there's a bet to call, decide whether to call, raise, or fold.
  if (minCall > 0) {
    // Post-flop: evaluate hand strength
    if (community.length > 0) {
      const evalRes = evaluateHand([...player.hole, ...community]);
      if (evalRes.rank >= 4) { // Straight or better
        if (Math.random() > 0.3) return { type: 'raise', amount: minCall * 2 };
        return { type: 'call' };
      }
      if (evalRes.rank >= 1) { // Pair or better
        if (minCall < player.stack / 5 && Math.random() > 0.5) return { type: 'call' };
      }
    }
    // Pre-flop or weak hand post-flop
    if (minCall > player.stack / 3) return { type: 'fold' }; // Don't call large bets with weak hands
    if (Math.random() < 0.6) return { type: 'call' };
    return { type: 'fold' };
  }
  // If no bet to call, decide whether to check or bet.
  else {
    if (community.length > 0) {
      const evalRes = evaluateHand([...player.hole, ...community]);
      if (evalRes.rank >= 2) { // Two pair or better
        if (Math.random() > 0.5) return { type: 'raise', amount: pot / 2 };
      }
    }
    // Pre-flop or weak hand post-flop, or just being tricky
    if (Math.random() > 0.8) return { type: 'raise', amount: 20 }; // Random bet
    return { type: 'check' };
  }
}
