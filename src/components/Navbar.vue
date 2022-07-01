<script setup lang="ts">

import { Modal } from 'bootstrap';
import { ref, watch, onMounted } from 'vue';

import { loadTodaysGame, loadGameById, gameState } from '../store';

const infoModal = ref<HTMLDivElement>();
let im: Modal | null = null;

onMounted(() => {
    im = new Modal(infoModal.value!);
});

function openInfoModal() {
    im?.show();
}

const jumpId = ref(gameState.id);
watch(() => gameState.id, v => jumpId.value = v);

function jump(id : number) {
    loadGameById(gameState.version, id);
}
</script>

<template>
    <nav class="top-nav navbar navbar-dark navbar-expand-lg bg-dark">
        <div class="container-fluid">
            <span class="navbar-brand me-4">Redactle Extended</span>
            <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="offcanvas offcanvas-end bg-dark" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title" id="offcanvasNavbarLabel">Redactle Extended</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link mx-2" href="#" id="infoBtn" @click.prevent="openInfoModal">Info</a>
                        </li>
                        <!-- <li class="nav-item dropdown">
                            <a class="nav-link mx-2 dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Edition: {{gameState.version}}
                            </a>
                            <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="navbarDropdown">
                                <li><a class="dropdown-item" href="#" @click.prevent="loadTodaysGame('standard')">Standard</a></li>
                                <li><a class="dropdown-item" href="#" @click.prevent="loadTodaysGame('gaming')">Gaming</a></li>
                            </ul>
                        </li> -->
                        <li class="nav-item">
                            <a class="nav-link mx-2" href="https://www.redactle.com/" target="_blank">Original Redactle</a>
                        </li>
                    </ul>
                    <form class="ms-auto d-flex align-items-center" @submit.prevent="jump(jumpId)">
                        <span class="game-label mx-2">Game #</span>
                        <div class="input-group input-group-sm">
                            <button class="btn btn-outline-secondary" type="button" @click="jump(gameState.id - 1)">&lt;</button>
                            <input class="form-control" type="number" placeholder="Game #" aria-label="Game #" v-model="jumpId">
                            <button class="btn btn-outline-secondary" type="button" @click="jump(gameState.id + 1)">&gt;</button>
                            <button class="btn btn-outline-secondary" type="button" @click="loadTodaysGame(gameState.version)">Today</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </nav>

    <div class="modal fade" id="infoModal" tabindex="-1" aria-labelledby="infoModalLabel" aria-hidden="true" ref="infoModal">
        <div class="modal-dialog modal-xl">
            <div class="modal-content bg-dark text-light border">
                <div class="modal-header">
                    <h5 class="modal-title" id="infoModalLabel">Welcome to Redactle Extended!</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>
                        Redactle is a daily browser game where the user tries to determine the subject of a random obfuscated Wikipedia article, chosen from
                        <a href='https://en.wikipedia.org/wiki/Wikipedia:Vital_articles/Level/4' target="_blank">Wikipedia's 10,000 Vital Articles (Level 4).</a>
                        A new puzzle will be available every day at 00:00 UTC.
                    </p>
                    <p>
                        Redactle was originally created by <a href="https://www.twitter.com/jhntrnr" target="_blank">John Turner</a>.
                        Redactle Extended was created by <a href="https://logic-and-trick.com" target="_blank">Logic &amp; Trick</a>.
                        Source code available on <a href="https://github.com/LogicAndTrick/redactle-extended" target="_blank">GitHub</a>.
                    </p>
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
                        <li>You will likely encounter some formatting and punctuation quirks. These are a result of
                            stripping away certain characters and elements present in the original Wikipedia article
                            that don't play nicely with Redactle.</li>
                        <li>Many common words are automatically revealed for your convenience. The list includes most
                            English prepositions and articles. Guessing these words does not count toward your score.
                        </li>
                    </ul>
                    <h5>Does Redactle Extended collect any user data?</h5>
                    <p>
                        No. Redactle Extended does not collect any user information at all, it is all stored in the browser and is never
                        transmitted to the server or anywhere else. We don't use any analytics or tracking platforms.
                    </p>
                    <p>
                        Like all hosting providers, our server has Apache logging turned on. This will collect IP addresses, browser type, time stamps, and referring site.
                        We do not use the logs for any analytics purposes, nor do we store them long term. Logs are automatically deleted after 3 days.
                    </p>
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

    .game-label {
        color: rgba(255, 255, 255, 0.55);
        white-space: nowrap;
    }

    .input-group {
        width: auto;
    }

    .form-control {
        width: 4rem !important;
        text-align: center;
    }
}
</style>
