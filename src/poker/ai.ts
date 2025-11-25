import { ActionType, HandRank } from './types.js';
import { PokerPlayer } from './PokerPlayer.js';
import { Carta } from '../../src/common/Card.js';
import { evaluateHand } from './evaluator.js';

// IA Agresiva: siempre intenta conseguir la mejor mano posible y asume riesgos.
export function simpleAI(player: PokerPlayer, community: Carta[], minCall: number, lastBet: number, minRaise: number): { type: ActionType, amount?: number } {
  // Si el jugador no tiene fichas, debe pasar/retirarse.
  if (player.stack <= 0) {
      if (minCall > 0) return { type: 'fold' };
      return { type: 'check' };
  }

  const amountToCall = minCall;
  const canAffordCall = player.stack >= amountToCall;
  const canAffordMinRaise = player.stack >= amountToCall + minRaise;
  const potSize = lastBet + community.reduce((sum, c) => sum + (c ? 0 : 0), 0); // Tamaño aproximado del bote (ciegas + apuesta actual)

  // Ayudante para evaluación de mano
  const currentHandEval = community.length > 0 ? evaluateHand([...player.holeCards, ...community]) : null;

  // Lógica de decisión cuando hay una apuesta que igualar
  if (amountToCall > 0) {
    if (!canAffordCall) { // Debe retirarse si no puede permitirse igualar
        return { type: 'fold' };
    }

    // Manos muy fuertes (Escalera o mejor)
    if (currentHandEval && currentHandEval.rank >= HandRank.Straight) {
        // Siempre subir si es posible, si no, igualar/ir all-in
        if (canAffordMinRaise) {
            const raiseAmount = Math.min(player.stack, amountToCall + minRaise + Math.floor(player.stack * 0.2)); // Subida agresiva
            return { type: 'raise', amount: raiseAmount };
        }
        return { type: 'call' }; // Igualar o ir all-in implícitamente
    }

    // Manos fuertes (Doble Pareja, Trío, Color, Full, Póker, Escalera de Color, Escalera Real)
    if (currentHandEval && currentHandEval.rank >= HandRank.TwoPair) {
        if (amountToCall <= player.stack / 2) { // Igualar hasta la mitad del stack
            // Subir agresivamente si la apuesta no es demasiado grande en comparación con el stack
            if (canAffordMinRaise && amountToCall < player.stack / 4) {
                 const raiseAmount = Math.min(player.stack, amountToCall + minRaise + Math.floor(player.stack * 0.15));
                 return { type: 'raise', amount: raiseAmount };
            }
            return { type: 'call' };
        } else if (amountToCall < player.stack) { // Si la apuesta es grande pero todavía se puede igualar
            // Solo igualar apuestas muy grandes con manos más fuertes, o si está casi all-in
            if (currentHandEval.rank >= HandRank.Flush || player.stack < this.bigBlind * 5) {
                return { type: 'call' };
            }
        }
    }

    // Manos de fuerza media (Pareja) o buenos proyectos (ej. 4 para color, 4 para escalera - no se comprueba explícitamente aquí, pero se infiere por la naturaleza agresiva)
    if (currentHandEval && currentHandEval.rank >= HandRank.Pair) {
        if (amountToCall <= player.stack / 3) { // Igualar hasta un tercio del stack
            // Pequeña posibilidad de subir de farol o por valor con una pareja fuerte
            if (canAffordMinRaise && amountToCall < player.stack / 5 && Math.random() < 0.2) {
                const raiseAmount = Math.min(player.stack, amountToCall + minRaise);
                return { type: 'raise', amount: raiseAmount };
            }
            return { type: 'call' };
        }
    }

    // Pre-flop o mano débil post-flop con una igualada mínima
    if (community.length === 0) { // Decisión pre-flop
        const highCard1 = player.holeCards[0].numericalRank;
        const highCard2 = player.holeCards[1].numericalRank;
        const isSuited = player.holeCards[0].suit === player.holeCards[1].suit;
        const isPair = highCard1 === highCard2;

        if (isPair && highCard1 >= 10) { // Pareja alta (JJ+)
            if (canAffordMinRaise) return { type: 'raise', amount: Math.min(player.stack, amountToCall + minRaise * 2) };
            return { type: 'call' };
        }
        if (highCard1 >= 12 && highCard2 >= 10) { // AK, AQ, AJ
            if (canAffordMinRaise) return { type: 'raise', amount: Math.min(player.stack, amountToCall + minRaise * 1.5) };
            return { type: 'call' };
        }
        if (isSuited && highCard1 >= 10 && highCard2 >= 8) { // Conectores del mismo palo, buenas cartas del mismo palo
             if (canAffordCall && amountToCall < player.stack / 5) return { type: 'call' };
        }
    }

    // Por defecto para manos débiles con una apuesta que igualar: retirarse, a menos que sea una apuesta muy pequeña
    if (amountToCall < player.stack / 10 && canAffordCall) { // Igualar apuestas muy pequeñas para ver la siguiente carta
        return { type: 'call' };
    }
    return { type: 'fold' };
  }
  // Lógica de decisión cuando no hay apuesta que igualar (se puede pasar o apostar)
  else {
    // Manos muy fuertes (Escalera o mejor)
    if (currentHandEval && currentHandEval.rank >= HandRank.Straight) {
        const betAmount = Math.min(player.stack, Math.max(minRaise, Math.floor(player.stack * 0.4))); // Apuesta agresiva
        return { type: 'bet', amount: betAmount };
    }

    // Manos fuertes (Doble Pareja, Trío)
    if (currentHandEval && currentHandEval.rank >= HandRank.TwoPair) {
        const betAmount = Math.min(player.stack, Math.max(minRaise, Math.floor(player.stack * 0.25))); // Apuesta decente
        return { type: 'bet', amount: betAmount };
    }

    // Manos de fuerza media (Pareja)
    if (currentHandEval && currentHandEval.rank >= HandRank.Pair) {
        const betAmount = Math.min(player.stack, Math.max(minRaise, Math.floor(player.stack * 0.1))); // Pequeña apuesta por valor
        if (Math.random() < 0.6) return { type: 'bet', amount: betAmount }; // Apostar más a menudo
        return { type: 'check' };
    }

    // Pre-flop o mano débil post-flop, puede intentar una pequeña apuesta de farol (raramente)
    if (canAffordMinRaise && community.length > 0 && Math.random() < 0.1) { // Pequeño farol
        return { type: 'bet', amount: minRaise };
    }
    if (community.length === 0) { // Pre-flop
        const highCard1 = player.holeCards[0].numericalRank;
        const highCard2 = player.holeCards[1].numericalRank;
        const isPair = highCard1 === highCard2;
        if (isPair && highCard1 >= 7) { // Pareja media (77-TT)
             return { type: 'bet', amount: minRaise * 2 };
        }
    }


    return { type: 'check' }; // Por defecto, pasar si no hay razón para apostar
  }
}
