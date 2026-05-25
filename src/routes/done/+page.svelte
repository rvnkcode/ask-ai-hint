<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { lastRecording } from '$lib/stores/recordingStatus';
</script>

<main class="done">
  <h1>Download completed</h1>
  {#if $lastRecording}
    <p>Saved: {$lastRecording.filename}</p>
  {/if}
  <button onclick={() => goto(resolve('/'))}>Start new recording</button>
</main>

<style>
  .done {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    margin: 0;
    text-align: center;
  }

  .done button {
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    cursor: pointer;
  }
</style>
