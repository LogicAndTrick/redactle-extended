<script setup lang="ts">

import { ref, onMounted } from 'vue';
import { guess, gameState, highlight } from '../store';

const input = ref('');

function top() {
    gameState.element.closest('.overflow-auto')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function submit() {
    if (!input.value) {
        if (gameState.highlighted) highlight(gameState.highlighted);
        return;
    }
    if (gameState.solved) return;
    guess(input.value);
    input.value = '';
}

</script>

<template>
    <form class="guess-box bg-dark" v-on:submit.prevent="submit">
        <div class="input-group">
            <button class="btn btn-outline-secondary" type="button" @click.prevent="top">&#9650; Top</button>
            <input v-model="input" type="text" class="form-control" aria-label="Text input" autofocus autocomplete="off" placeholder="Guess" :disabled="gameState.solved">
            <button class="btn btn-outline-secondary" type="submit" :disabled="gameState.solved">Guess</button>
        </div>
    </form>
</template>

<style lang="scss">
.guess-box {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 30vw;
    height: 56px;

    .input-group {
        max-width: 50vw;
        padding-left: 10vw;
        margin: 0.5rem;
    }

    @media (max-width: 991.98px) {
        right: 0;

        .input-group {
            max-width: 90vw;
        }
    }
}
</style>
