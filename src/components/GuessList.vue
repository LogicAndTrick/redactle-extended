<script setup lang="ts">

import { ref, onMounted } from 'vue';

import { gameState } from '../store';

</script>

<template>
    <section class="guess-list bg-dark overflow-auto">
        <table class="table table-dark table-hover">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Guess</th>
                    <th scope="col">Hits</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(guess, i) in gameState.guesses">
                    <td>{{i+1}}</td>
                    <td>{{guess.word}}</td>
                    <td>1</td>
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
