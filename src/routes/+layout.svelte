<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
  /* Every page fills the viewport, so reset the default body margin and disable
     page scrolling. This prevents scrollbars from the margin and from the
     virtual cursor briefly overflowing the viewport edges. */
  :global(html, body) {
    margin: 0;
    height: 100%;
    overflow: hidden;
  }
</style>
