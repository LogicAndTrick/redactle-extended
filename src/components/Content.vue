<script setup lang="ts">

import { ref, computed, watch, onMounted, onUpdated, onUnmounted } from 'vue';

import { gameState } from '../store';

const element = ref<HTMLElement>();

onMounted(() => {
    element.value?.replaceChildren(gameState.element);
});

onUpdated(() => {
});


const accuracy = computed(() => {
    const total = gameState.guesses.length;
    if (total <= 0) return 'N/A';
    const hit = gameState.guesses.filter(x => x.hits > 0).length;
    return Math.round((hit / total) * 10000) / 100 + '%';
});

function share() {
    const shareText = "I solved today's"
        + (gameState.version == 'standard' ? '' : ' ' + gameState.version)
        + " Redactle Extended (#" + gameState.id + ") in "
        + gameState.guesses.length
        + " guesses with an accuracy of " + accuracy.value
        + ". Played at http://redactle.logic-and-trick.com/" + (gameState.version == 'standard' ? '' : '#/' + gameState.version);
    navigator.clipboard.writeText(shareText);
    alert("Results copied to clipboard. Thanks for playing!");
}

</script>

<template>
    <div class="article-container overflow-auto">
        <section v-if="gameState.solved">
                <h3>Congratulations, you solved Redactle Extended {{gameState.version == 'standard' ? '' : `(${gameState.version})`}} #{{gameState.id}}!</h3>
                <ul>
                    <li>The answer was: {{gameState.processedArticle?.title}}</li>
                    <li>You solved it in {{gameState.guesses.length}} guesses</li>
                    <li>Your accuracy was {{accuracy}}</li>
                </ul>
                <p>
                    <a href="#" v-on:click.prevent="share">Share your results</a>
                </p>
        </section>
        <article ref="element">
        </article>
    </div>
</template>

<style lang="scss">
.article-container {
    position: fixed;
    top: 56px;
    left: 0;
    bottom: 56px;
    right: 30vw;
    padding: 1rem;

    @media (max-width: 991.98px) {
        bottom: calc(25vh + 56px);
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
