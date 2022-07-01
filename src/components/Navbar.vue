<script setup lang="ts">

import { Modal } from 'bootstrap';
import { ref, onMounted } from 'vue';

import { loadTodaysGame, gameState } from '../store';

const infoModal = ref<HTMLDivElement>();
let im: Modal | null = null;

onMounted(() => {
    im = new Modal(infoModal.value!);
});

function openInfoModal() {
    im?.show();
}
</script>

<template>
    <nav class="top-nav navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
        <span class="navbar-brand mb-0 h1 mx-4">Redactle Extended</span>
        <button class="navbar-toggler mx-2" type="button" data-toggle="collapse" data-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse ms-5" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link mx-2" href="#" id="infoBtn" @click.prevent="openInfoModal">Info</a>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Edition: {{gameState.version}}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="navbarDropdown">
                        <li><a class="dropdown-item" href="#" @click.prevent="loadTodaysGame('standard')">Standard</a></li>
                        <li><a class="dropdown-item" href="#" @click.prevent="loadTodaysGame('gaming')">Gaming</a></li>
                    </ul>
                </li>
                <li class="nav-item">
                    <a class="nav-link mx-2" href="https://www.redactle.com/" target="_blank">Original Redactle</a>
                </li>
            </ul>
        </div>
    </nav>

    <div class="modal fade" id="infoModal" tabindex="-1" aria-labelledby="infoModalLabel" aria-hidden="true" ref="infoModal">
        <div class="modal-dialog modal-xl">
            <div class="modal-content text-dark">
                <div class="modal-header">
                    <h5 class="modal-title" id="infoModalLabel">Welcome to Redactle!</h5>
                    <button type="button" class="btn-close closeInfo" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Redactle is a daily browser game where the user tries to determine the subject of a random
                        obfuscated Wikipedia article, chosen from <a
                            href='https://en.wikipedia.org/wiki/Wikipedia:Vital_articles/Level/4'
                            target="_blank">Wikipedia's 10,000 Vital Articles (Level 4).</a></p>
                    <p>A new puzzle will be available every day at 00:00 UTC.</p>
                    <p>Originally created by <a href="https://www.twitter.com/jhntrnr" target="_blank">John Turner</a>
                    </p>
                    <p id="yesterday"></p>
                    <h5>How to Play</h5>
                    <ul>
                        <li>Type a word into the input box and press Enter or the Guess button.</li>
                        <li>All occurrences of that word will become unredacted in the article body.</li>
                        <li>To win, figure out the title or subject of the article.</li>
                    </ul>
                    <h5>Tips and Quirks</h5>
                    <ul>
                        <li>Each guess must be one word only (Guessing multiple words at a time will not work).</li>
                        <li><i>Most</i> Punctuation is automatically revealed in the article page. Some punctuation
                            occasionally escapes Redactle's filter and becomes redacted.</li>
                        <li>Guesses are case <i>insensitive</i>, and letters with diacritics (é, ü, etc) are considered
                            to not have those diacritics.</li>
                        <li>Shift+Enter will attempt to automatically pluralize or singularize your guess. There are
                            certain edge cases (e.g. guessing a nonsense word like "asdf") where this will submit
                            nonsense guesses.</li>
                        <li>You will likely encounter some formatting and punctuation quirks. These are a result of
                            stripping away certain characters and elements present in the original Wikipedia article
                            that don't play nicely with Redactle.</li>
                        <li>Many common words are automatically revealed for your convenience. The list includes most
                            English prepositions and articles. Guessing these words does not count toward your score.
                        </li>
                    </ul>
                    <h5>Does Redactle collect any user data?</h5>
                    <p>No. Redactle does not collect any information at all, it is all stored in the browser and is never
                        transmitted to the server or anywhere else.</p>
                    <p class="text-secondary">Version 1.0</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary closeInfo" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.top-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 56px;
}
</style>
