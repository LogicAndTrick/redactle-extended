import pluralize from 'pluralize';
import { reactive } from 'vue';
import { commonWords } from './common-words';
import { Article, getArticle } from './net';

export type GameVersion = 'standard' | 'gaming';

export type Guess = {
    word: string,
    words: string[],
    hits: number
};

export const gameState = reactive({
    id: 0,
    loading: false,
    version: <GameVersion> 'standard',
    guesses: <Guess[]> [],
    article: <Article | undefined> undefined,
    solved: false,
    element: <HTMLElement> document.createElement('div'),
    highlighted: <Guess | undefined> undefined
});

export async function loadTodaysGame(version : GameVersion) {
    await loadGame(version, 0);
}

export async function loadGame(version : GameVersion, id : number) {
    gameState.loading = true;
    gameState.version = version;
    gameState.guesses = [];
    gameState.id = id;
    gameState.loading = false;
    gameState.solved = false;
    gameState.highlighted = undefined;

    gameState.element.innerHTML = 'Loading...';
    
    if (!load()) gameState.article = await getArticle('Particle_physics');
    
    if (!gameState.article || !gameState.article.html) return;

    const el = gameState.element;
    el.classList.add('content');
    el.innerHTML = gameState.article.html;
    
    // Censoring
    el.querySelectorAll('.word').forEach(x => {
        if (!x.textContent) return;
        const text = x.textContent.trim().toLowerCase();
        if (commonWords.includes(text)) return;
        (<any> x).originalContent = x.textContent;
        x.textContent = '\u2588'.repeat(text.length);
        x.classList.add('censored');
        (<any> x).word = text.replace("'", '').normalize('NFD');
    });

    save();
    reveal(gameState.guesses);
    checkForWin();
}

const SAVE_VERSION = 2;

function save() {
    localStorage.setItem('selected-version', gameState.version);
    localStorage.setItem(gameState.version + '-' + gameState.id, JSON.stringify({
        v: SAVE_VERSION,
        id: gameState.id,
        guesses: gameState.guesses,
        article: gameState.article,
        solved: gameState.solved
    }));
}

function load() : boolean {
    const itemJson = <any> localStorage.getItem(gameState.version + '-' + gameState.id);
    if (!itemJson) return false;

    try {
        const item = JSON.parse(itemJson);
        if (item.id !== gameState.id) return false;
        if (item.v !== SAVE_VERSION) return false;
        
        gameState.guesses = item.guesses;
        gameState.article = <Article> item.article;
        if (item.solved === true) gameState.solved = true;
        return true;
    } catch {
        return false;
    }
}

export async function guess(word: string) {
    word = word.replace(/\s/g,'').normalize('NFD');
    const words = [word];

    const plu = pluralize(word);
    if (plu && plu != word) words.push(plu);
    
    const sin = pluralize.singular(word);
    if (sin && sin != word) words.push(sin);

    const g : Guess = { word, words, hits: 0 };
    reveal([ g ]);
    gameState.guesses.push(g);
    save();

    highlight(g);
    checkForWin();
}

function reveal(guesses : Guess[]) {
    const guessMap : Record<string, Guess> = {};
    guesses.forEach(g => {
        g.hits = 0;
        g.words.forEach(w => {
            guessMap[w] = g;
        });
    });
    const words : string[] = Object.keys(guessMap);
    gameState.element.querySelectorAll('.word').forEach(x => {
        const w = (<any> x).word;
        if (w && words.includes(w)) {
            x.textContent = (<any> x).originalContent ?? x.textContent;
            x.classList.remove('censored');
            guessMap[w].hits++;
        }
    });
}

function checkForWin() {
    const heading = gameState.element.querySelector('h1')!;
    const solved = heading.querySelectorAll('.censored').length == 0;
    if (solved) {
        gameState.element.querySelectorAll('.censored').forEach(x => {
            x.textContent = (<any> x).originalContent ?? x.textContent;
            x.classList.remove('censored');
        });
            
        gameState.solved = true;
        highlight(undefined);
        save();
    }
}


let highlightIndex = 0;
export function highlight(guess : Guess | undefined) {
    const arr = !guess ? [] : Array.from(gameState.element.querySelectorAll('.word'))
        .filter(x => {
            const w = (<any> x).word;
            return guess.words.includes(w);
        });
    if (gameState.highlighted == guess) {
        highlightIndex++;
        if (highlightIndex >= arr.length) highlightIndex = 0;
    } else {
        gameState.highlighted = guess;
        highlightIndex = 0;
    }
    gameState.element.querySelectorAll('.highlighted').forEach(x => x.classList.remove('highlighted'));
    gameState.element.querySelectorAll('.superHighlighted').forEach(x => x.classList.remove('superHighlighted'));

    arr.forEach(x => x.classList.add('highlighted'));
    if (arr.length > 0 && arr.length > highlightIndex) {
        const focused = arr[highlightIndex];
        focused.classList.add('superHighlighted');
        focused.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
}
