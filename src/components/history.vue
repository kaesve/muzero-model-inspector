<template>
    <ol :class="`${mode}-list`">
        <template v-if="mode == 'iterations'">
            <li class="iteration-item" v-for="(iter, i) in iterations" :key="i" @click.self="toggle(i)">
                Iteration {{i + 1}} ({{iter}})
                <history 
                    v-if="open.has(i)"
                    mode="episodes" :index="i"
                    :active="active"
                    @select-episode="selectEpisode($event, i)"
                />
            </li>
        </template>
        <template v-if="mode == 'episodes'">
            <li
                v-for="(episode, i) in episodes" :key="i"
                class="episode-item"
                :class="{ 'episode-item--active': episode == active }"
                @click="selectEpisode({ episode }, i)"
            >
                Episode {{i + 1}} ({{episode && episode.actions && episode.actions.length}})

            </li>
        </template>
    </ol>
</template>

<script>
export default {
    name: "history",
    props: [ "mode", "active", "index" ],
    data() {
        return {
            open: new Set()
        }
    },
    computed: {
        iterations() {
            if (this.mode == "iterations" && window.data) {
                return window.data.map((_, i) => window.data[i].length);
            }
        },
        episodes() {
            if (this.mode == "episodes" && window.data) {

                return window.data[this.index]; //.map((_, i) => i);
            }
        },
    },
    methods: {
        toggle(i) {
            if (!this.open.delete(i)) {
                this.open.add(i);
            }
            this.$forceUpdate();
        },
        selectEpisode(event, i) {
            if (this.episodes) {
                event.episodeIndex = i;
            } else if (this.iterations) {
                event.iterationIndex = i;
            }

            this.$emit("select-episode", event);
        }
    }
}
</script>

<style>

.iteration-item,
.episode-item {
    list-style: none;
    padding-left: 12px
}

.episode-item--active {
    background: yellow;
}

</style>