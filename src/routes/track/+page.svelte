<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { createRecorder, type Recorder } from '$lib/recorder';
  import {
    enterFullscreen,
    enterPointerLock,
    exitCaptureMode,
    getViewportCenter,
    isLocked,
    onLockChange
  } from '$lib/pointerLock';
  import { hitTestAt } from '$lib/hitTest';
  import { downloadJson } from '$lib/download';
  import { lastRecording } from '$lib/stores/recordingStatus';
  import type { StoppedBy } from '$lib/types';

  let recorder: Recorder | null = null;
  let showResumeOverlay = $state(false);
  // True while we intentionally tear down (stop button), so the lock-change
  // handler doesn't mistake our own exit for an ESC press.
  let isStopping = false;

  let leftBtn: HTMLButtonElement;
  let rightBtn: HTMLButtonElement;
  let hintBtn: HTMLButtonElement;
  let cursorEl: HTMLDivElement;

  let unsubscribeLock: (() => void) | null = null;

  function renderCursor() {
    if (!recorder) return;
    const { x, y } = recorder.getPosition();
    cursorEl.style.transform = `translate(${x}px, ${y}px)`;
  }

  function onMouseMove(e: MouseEvent) {
    recorder?.handleMove(e.movementX, e.movementY);
    renderCursor();
  }

  function onMouseDown() {
    if (!recorder || !isLocked()) return;
    const { x, y } = recorder.getPosition();
    const hit = hitTestAt(x, y, { left: leftBtn, right: rightBtn, hint: hintBtn });
    if (hit === 'left' || hit === 'right') stop(hit);
    // hit === 'hint' → placeholder, no-op
  }

  function stop(stoppedBy: StoppedBy) {
    if (!recorder) return;
    isStopping = true;
    const data = recorder.stop(stoppedBy);
    exitCaptureMode();
    const filename = `mouse-${stoppedBy}-${Date.now()}.json`;
    downloadJson(data, filename);
    lastRecording.set({ filename, finishedAt: new Date().toISOString() });
    goto(resolve('/done'));
  }

  async function resume() {
    await enterFullscreen(document.documentElement);
    await enterPointerLock(document.documentElement);
    recorder?.markEvent('lockResumed');
  }

  async function handleLockChange() {
    // Ignore lock acquisition and our own intentional teardown.
    if (isLocked() || isStopping || !recorder) return;

    // ESC released the lock (and fullscreen). Recording keeps running.
    recorder.markEvent('escPressed');
    alert('ESC가 눌렸습니다. 확인을 누르면 추적 환경에 다시 진입합니다.');
    try {
      await resume();
    } catch {
      // alert's OK click may not count as user activation; fall back to an
      // explicit click overlay, which is always a valid gesture.
      showResumeOverlay = true;
    }
  }

  async function handleResumeClick() {
    try {
      await resume();
      showResumeOverlay = false;
    } catch {
      // Keep the overlay up so the user can try again.
    }
  }

  onMount(() => {
    const { centerX, centerY, viewportWidth, viewportHeight } = getViewportCenter();
    recorder = createRecorder({ centerX, centerY, viewportWidth, viewportHeight });
    recorder.start();
    renderCursor();

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    unsubscribeLock = onLockChange(handleLockChange);

    // Auto pointer lock (no fallback by design). NOTE: navigation is not a user
    // gesture, so some browsers (e.g. Chrome) may reject this silently.
    enterPointerLock(document.documentElement).catch(() => {});
  });

  onDestroy(() => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mousedown', onMouseDown);
    unsubscribeLock?.();
    exitCaptureMode();
  });
</script>

<div class="stage">
  <button bind:this={leftBtn} class="corner top-left">Left</button>
  <button bind:this={rightBtn} class="corner top-right">Right</button>
  <button bind:this={hintBtn} class="corner bottom-center">Hint</button>

  <div bind:this={cursorEl} class="cursor">
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <polygon
        points="0,0 0,16 4,12 7,18.5 9.5,17.5 6.5,11 12,11"
        fill="#fff"
        stroke="#000"
        stroke-width="1.2"
        stroke-linejoin="round"
      />
    </svg>
  </div>

  {#if showResumeOverlay}
    <button class="resume-overlay" onclick={handleResumeClick}>Click anywhere to resume</button>
  {/if}
</div>

<style>
  .stage {
    position: fixed;
    inset: 0;
    cursor: none;
    background: #111;
  }

  .corner {
    position: fixed;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
  }

  .top-left {
    top: 1rem;
    left: 1rem;
  }

  .top-right {
    top: 1rem;
    right: 1rem;
  }

  .bottom-center {
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }

  .cursor {
    /* The SVG tip sits at (0,0), so it lands exactly on the virtual position. */
    position: fixed;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    pointer-events: none;
    will-change: transform;
  }

  .resume-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    font-size: 1.25rem;
    cursor: pointer;
  }
</style>
