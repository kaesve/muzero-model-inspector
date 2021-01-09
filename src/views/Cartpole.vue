<template>
  <div class="app-view" :class="dragState"
    @dragenter.stop.prevent="dragEnter"
    @dragover.stop.prevent="dragOver"
    @drop.stop.prevent="drop"
  >
    <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
    <!-- <router-view/> -->

    <aside class="app-sidebar">
      <history v-if="demoData" mode="iterations" :active="selectedEpisode" @select-episode="selectEpisode" />
      <span v-else>Loading...</span>
    </aside>
    <div>
      <template v-if="selectedEpisode">
        <h2>{{episodeName}}</h2>
        <cartpole :state="lastState" />
        <label>t:</label>
        <input type="number" v-model="t" min="0" :max="selectedEpisode.observations.length - 1" />
        <input type="range" v-model="t" min="0" :max="selectedEpisode.observations.length - 1" />
        <dl>
          <dt>Search return:</dt> <dd><pre>{{selectedEpisode.search_returns[t]}}</pre></dd>
          <dt>Observed return:</dt> <dd><pre>{{selectedEpisode.observed_returns[t]}}</pre></dd>
          <dt>Action:</dt> <dd><pre>{{selectedEpisode.actions[t]}}</pre></dd>
          <dt>x:</dt> <dd><pre>{{ lastState[0] < 0 ? "" : " " }}{{lastState[0]}}</pre></dd>
          <dt>dx:</dt> <dd><pre>{{ lastState[1] < 0 ? "" : " " }}{{lastState[1]}}</pre></dd>
          <dt>a:</dt> <dd><pre>{{ lastState[2] < 0 ? "" : " " }}{{lastState[2]}}</pre></dd>
          <dt>da:</dt> <dd><pre>{{ lastState[3] < 0 ? "" : " " }}{{lastState[3]}}</pre></dd>
        </dl>
      </template>
    </div>
  </div>
</template>


<script>
// import demoData from "@/assets/checkpoint_59.pth.tar.examples.json";
import axios from "axios";

import History from '@/components/history.vue';
import Cartpole from '@/components/cartpole.vue';

window.data = null;

export default {
  components: { History, Cartpole },
  data() {
    return {
      demoData: null,
      selectedEpisode: null,
      episodeName: null,
      t: 0,
      dragState: ""
    }
  },
  mounted() {
    axios.get("/checkpoint_86.pth.tar.examples.json")
      .then(res => {
        this.demoData = 1;
        window.data = res.data;
      });
  },
  computed:{
    lastState() {
      if (!this.selectedEpisode) return;

      return this.selectedEpisode.observations[this.t][0][0];
    }
  },
  methods: {
    selectEpisode(event) {
      this.t = 0;
      this.selectedEpisode = event.episode;
      this.episodeName = `Iteration ${event.iterationIndex + 1}, Episode ${event.episodeIndex + 1}`
    },
    dragEnter(e) {
      console.log("enter", e);
      console.log(e.dataTransfer);
    },
    drop(e) {
      console.log("enter", e);
      console.log(e.dataTransfer);

      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        console.log(e.dataTransfer.files);
        let f = e.dataTransfer.files[0];
        if (f.name.endsWith(".examples.json")) {
          this.demoData = 0;
          this.selectedEpisode = null;
          let reader = new FileReader()
          reader.onload = (loadEvent => {
            window.data = JSON.parse(loadEvent.target.result);
            this.demoData = 1;
            this.iterations = window.data.map((e, i) => i + 1);
            // console.log(history);
          });
          reader.onerror = err => {
            console.error(err)
          }
          reader.readAsText(f);
        }
      }
    },
    dragOver(e) {
      // console.log("over", e);
    },
  }
}
</script>