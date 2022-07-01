<script setup lang="ts">

import { ref, computed, watch, onMounted, onUpdated, onUnmounted } from 'vue';
import { commonWords } from '../common-words';
import { mediator } from '../mediator';

import { gameState, loadGame, save, load, win, Guess } from '../store';

let gameElement : HTMLDivElement = document.createElement('div');
const element = ref<HTMLElement>();

onMounted(() => {
    reset();
    mediator.on('loaded', reset);
    mediator.on('reveal', reveal);
});

onUnmounted(() => {
    mediator.off('loaded', reset);
    mediator.off('reveal', reveal);
});

function reset() {
    if (gameState.loading || !gameState.article || !gameState.article.html) return;
    const el = document.createElement('div');
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
        (<any> x).word = text;
    });

    gameElement = el;
    element.value?.replaceChildren(gameElement);
    load();
    reveal(gameState.guesses);
}

function reveal(event : any) {
    console.log('reveal', event);
    const words : string[] = event.flatMap((x : Guess) => x.words).map((x : string) => x.toLowerCase());
    gameElement.querySelectorAll('.word').forEach(x => {
        const w = (<any> x).word;
        if (w && words.includes(w)) {
            x.textContent = (<any> x).originalContent ?? x.textContent;
            x.classList.remove('censored');
        }
    });
    gameElement = gameElement;
    checkForWin();
}

function checkForWin() {
    const heading = gameElement.querySelector('h1')!;
    const solved = heading.querySelectorAll('.censored').length == 0;
    if (solved) {
        gameElement.querySelectorAll('.censored').forEach(x => {
            x.textContent = (<any> x).originalContent ?? x.textContent;
            x.classList.remove('censored');
        });
        win();
    }
}

onUpdated(() => {
});



</script>

<template>
    <article class="overflow-auto" ref="element">
    </article>
</template>

<style lang="scss">
article {
    position: fixed;
    top: 56px;
    left: 0;
    bottom: 56px;
    right: 30vw;
    padding: 1rem;

    @media (max-width: 991.98px) {
        bottom: calc(25vw + 56px);
        right: 0;
    }

    .content {
        font-family: monospace;
        font-size: 18px;
        margin-top: 15px;
        margin-bottom: 10vh;
        overflow-x: auto;
        overflow-wrap: break-word;
    }

    .censored {
        background-color: #989898;
    }

    .highlighted {
        background-color: #00585e !important;
    }

    .superHighlighted {
        background-color: #00becc !important;
        color: #0f0f0f;
    }
}

</style>
