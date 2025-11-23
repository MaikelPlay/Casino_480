// @ts-nocheck
import { Carta, Palo, Rango } from '../../src/common/Card.js';

const PALOS: Palo[] = ['corazones', 'rombo', 'picas', 'trebol'];
const RANGOS: Rango[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'as'];

export function createDeck(): Carta[] {
  const deck: Carta[] = [];
  for (const palo of PALOS) {
    for (const rango of RANGOS) {
      deck.push(new Carta(palo, rango));
    }
  }
  return deck;
}

export function shuffle(deck: Carta[]): Carta[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function draw(deck: Carta[], n = 1): Carta[] {
  return deck.splice(0, n);
}
