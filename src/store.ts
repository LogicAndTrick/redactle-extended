import pluralize from 'pluralize';
import { reactive } from 'vue';
import { commonWords } from './common-words';
import { Article, getArticle } from './net';

export type GameVersion = 'standard' | 'gaming';

function isValidVersion(name : string | null | undefined) : name is GameVersion {
    return name == 'standard' || name == 'gaming';
}

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

type ListItem = {
    date: string,
    index: number,
    name: string
};

export function loadDefaultGame() {
    const hashMatch = window.location.hash.match(/^#\/([a-z]+)\/(\d+)/i);
    if (hashMatch) {
        const version = hashMatch[1];
        const id = parseInt(hashMatch[2], 10);
        if (isValidVersion(version)) return loadGameById(version, id);
    }

    const version = localStorage.getItem('selected-version');
    if (isValidVersion(version)) return loadTodaysGame(version);
    else return loadTodaysGame('standard');
}

export async function loadTodaysGame(version : GameVersion) {
    const today = new Date();
    await loadDateGame(version, today);
}

export async function loadGameById(version : GameVersion, id : number) {
    const date = new Date(Date.parse('2022-06-25T00:00:00Z'));
    const now = new Date();
    date.setUTCDate(date.getUTCDate() + id);
    if (date > now) await loadDateGame(version, now);
    else await loadDateGame(version, date);
}

async function loadDateGame(version : GameVersion, date : Date) {
    const ym = date.getUTCFullYear() + (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const ymd = ym + date.getUTCDate().toString().padStart(2, '0');
    const file = '/lists/' + version + '/' + ym + '.js';
    const resp = await fetch(file);
    const json = <ListItem[]> await resp.json();
    const game = json.find(x => x.date == ymd);
    if (!game) throw 'Server error: unable to get game list';
    await loadGame(version, game);
}

async function loadGame(version : GameVersion, game : ListItem) {
    gameState.loading = true;
    gameState.version = version;
    gameState.guesses = [];
    gameState.id = game.index;
    gameState.loading = false;
    gameState.solved = false;
    gameState.highlighted = undefined;

    gameState.element.innerHTML = 'Loading...';
    
    if (!load()) gameState.article = await getArticle(atob(game.name));
    
    if (!gameState.article || !gameState.article.html) return;

    const el = gameState.element;
    el.classList.add('content');
    el.innerHTML = gameState.article.html;
    
    // Censoring
    el.querySelectorAll('.word').forEach(x => {
        if (!x.textContent) return;

        const text = x.textContent.trim().toLowerCase();
        (<any> x).originalContent = x.textContent;
        (<any> x).word = text.replace("'", '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

        if (commonWords.includes(text)) return;
        x.textContent = '\u2588'.repeat(text.length);
        x.classList.add('censored');
    });

    window.location.hash = `#/${version}/${gameState.id}`;

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
    word = word.replace(/\s/g,'').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    if (commonWords.includes(word)) {
        highlight({
            word,
            words: [word],
            hits: 0
        });
        return;
    }

    const existingGuess = gameState.guesses.find(x => x.words.includes(word));
    if (existingGuess) {
        highlight(existingGuess);
        return;
    }

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
        gameState.element.closest('.overflow-auto')?.scrollTo({ top: 0, behavior: 'smooth' });
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
