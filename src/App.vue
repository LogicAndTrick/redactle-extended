<script setup lang="ts">

import { onMounted } from 'vue';

import { loadDefaultGame } from './store';

import Navbar from './components/Navbar.vue';
import GuessList from './components/GuessList.vue';
import GuessBox from './components/GuessBox.vue';
import Content from './components/Content.vue';

onMounted(() => {
    loadDefaultGame();
});

</script>

<template>
    <Navbar />
    <GuessList />
    <Content />
    <GuessBox />
</template>

<style lang="scss">
@import 'bootstrap/scss/bootstrap';

body {
    font-family: "Segoe UI", "Liberation Sans", sans-serif;
    background-color: #0f0f0f;
    color: #989898;
    height: 100vh;
}

#app {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 1051;
}

</style>
