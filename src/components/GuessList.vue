<script setup lang="ts">

import { ref, computed, onMounted } from 'vue';

import { gameState, highlight, Guess } from '../store';

const guesses = computed(() => {
    const copy = gameState.guesses.map((x, i) => ({
        index: i + 1,
        word: x.word,
        words: x.words,
        hits: x.hits,
        guess: x,
        cls: gameState.highlighted === x ? 'table-secondary' : ''
    }));
    copy.reverse();
    return copy;
});

const accuracy = computed(() => {
    const total = gameState.guesses.length;
    if (total <= 0) return 'N/A';
    const hit = gameState.guesses.filter(x => x.hits > 0).length;
    return Math.round((hit / total) * 10000) / 100 + '%';
});

</script>

<template>
    <section class="guess-list bg-dark overflow-auto">
        <div class="text-center">Current accuracy: {{accuracy}}</div>
        <table class="table table-dark table-hover">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Guess</th>
                    <th scope="col">Hits</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="guess in guesses" v-on:click="highlight(guess.guess)" :class="guess.cls">
                    <td>{{guess.index}}</td>
                    <td>{{guess.word}}</td>
                    <td>{{guess.hits}}</td>
                </tr>
            </tbody>
        </table>
    </section>
</template>

<style lang="scss">
.guess-list {
    position: fixed;
    top: 56px;
    right: 0;
    bottom: 0;
    width: 30vw;

    @media (max-width: 991.98px) {
        top: auto;
        left: 0;
        bottom: 56px;
        width: auto;
        height: 25vh;
    }

    td {
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>
