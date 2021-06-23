<template>
<form class="hidden md:block max-w-6xl mx-auto mb-16">
  <div class="input-token">
      Github Token: <input type="password"
        class="h-full block bg-transparent relative left-10 border-none
      outline-none"
        placeholder="Enter github token"
        @input="handleInputChange"
      />
  </div>
</form>
</template>

<script lang="ts">
import { defineComponent } from "vue";

// eslint-disable-next-line @typescript-eslint/ban-types
export const debounce = (func: Function, delay: number) => {
  let timer: number;

  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(this: object) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    clearTimeout(timer);
    timer = window.setTimeout(() => func.apply(context, args), delay);
  };
};

export default defineComponent({
  name: "SearchBar",
  setup(props, context) {
    const handleInputChange = debounce((evt: Event) => {
      const element = evt.target as HTMLInputElement;
    console.log('the github token is set to', element.value);
      context.emit("githubToken", element.value);
    }, 300);

    return {
      handleInputChange
    };
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
