<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
  <!--<InputToken />
  <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
  -->
  <RepositoryList />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import RepositoryList from "./components/RepositoryList.vue";

export default defineComponent({
  name: "App",
  components: {
    RepositoryList,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 0px;
}
</style>
// text-align: center;
