<template>

  <div class="app">

    <router-view />
  </div>


</template>

<style lang="scss">

*, *:before, *:after {
  padding: 0; margin: 0;
}

html, body {
  height: 100%;
}

.app {
  display: grid;
  height: 100%;
  grid-template-areas: 
    "nav"
    "main";

  justify-items: stretch;
}

.app-view {
  display: grid;
  grid-template-areas:
    "sidebar view";
  height: 100%;
}

.app-sidebar {
  overflow: auto;
  height: 100%;
}

canvas {
  display: block;
}

dl {
  display: grid;
  grid-template-columns: auto 1fr;
}
</style>

<script>

export default {

}
</script>
