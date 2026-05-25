<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { enterFullscreen, isFullscreen, onFullscreenChange } from '$lib/pointerLock';

  // Delay before auto-advancing to the tracking page once fullscreen is active.
  const TRANSITION_DELAY_MS = 3000;

  let showWarning = $state(false);
  let transitionTimer: ReturnType<typeof setTimeout> | null = null;
  let unsubscribeFullscreen: (() => void) | null = null;

  function scheduleTransition() {
    if (transitionTimer !== null) return; // already scheduled
    transitionTimer = setTimeout(() => {
      // replaceState so the back button cannot return to this start page.
      goto(resolve('/track'), { replaceState: true });
    }, TRANSITION_DELAY_MS);
  }

  function handleEnterFullscreen() {
    enterFullscreen(document.documentElement).catch(() => {
      // Stay on the warning; the user can click the button again.
    });
  }

  function handleFullscreenChange() {
    if (isFullscreen()) {
      showWarning = false;
      scheduleTransition();
    }
  }

  onMount(() => {
    unsubscribeFullscreen = onFullscreenChange(handleFullscreenChange);
    if (isFullscreen()) {
      scheduleTransition();
    } else {
      showWarning = true;
    }
  });

  onDestroy(() => {
    if (transitionTimer !== null) clearTimeout(transitionTimer);
    unsubscribeFullscreen?.();
  });
</script>

<main class="start">
  {#if showWarning}
    <div class="overlay">
      <div class="popup">
        <p>이 도구는 전체화면에서 동작합니다.</p>
        <button onclick={handleEnterFullscreen}>전체화면으로 전환</button>
      </div>
    </div>
  {/if}
</main>

<style>
  .start {
    width: 100vw;
    height: 100vh;
    margin: 0;
    background: #111;
  }

  .overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
  }

  .popup {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    padding: 2rem;
    border-radius: 0.5rem;
    background: #fff;
    color: #111;
    text-align: center;
  }

  .popup button {
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    cursor: pointer;
  }
</style>
