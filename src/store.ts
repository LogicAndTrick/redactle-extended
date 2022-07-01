

import pluralize from 'pluralize';
import { ref, reactive } from 'vue';
import { mediator } from './mediator';
import { Article, getArticle } from './net';

export type GameVersion = 'standard';

export type Guess = {
    word: string,
    words: string[]
};

export const gameState = reactive({
    id: 0,
    loading: false,
    version: <GameVersion> 'standard',
    guesses: <Guess[]> [],
    article: <Article | undefined> undefined,
    solved: false
});

export async function loadGame(version : GameVersion) {
    gameState.loading = true;
    gameState.version = version;
    gameState.guesses = [];
    gameState.article = await getArticle('Particle_physics');
    gameState.loading = false;
    gameState.solved = false;
    mediator.emit('loaded');
}

const SAVE_VERSION = 1;

export async function save() {
    localStorage.setItem(gameState.version, JSON.stringify({
        v: SAVE_VERSION,
        id: gameState.id,
        guesses: gameState.guesses,
        solved: gameState.solved
    }));
}

export async function load() {
    const itemJson = <any> localStorage.getItem(gameState.version);
    if (!itemJson) return;

    try {
        const item = JSON.parse(itemJson);
        if (item.id !== gameState.id) return;
        if (item.v !== SAVE_VERSION) return;
        if (Array.isArray(item.guesses)) {
            gameState.guesses = item.guesses;
        }
        if (item.solved === true) gameState.solved = true;
    } catch {
        //
    }
}

export async function guess(word: string) {
    word = word.replace(/\s/g,'');
    const words = [word];

    const plu = pluralize(word);
    if (plu && plu != word) words.push(plu);
    
    const sin = pluralize.singular(word);
    if (sin && sin != word) words.push(sin);

    const g = {
        word,
        words
    };
    gameState.guesses.push(g);
    mediator.emit('reveal', [g]);

    save();
}

export async function win() {
    gameState.solved = true;
    save();
}