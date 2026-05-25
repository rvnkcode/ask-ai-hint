import type { Frame, RecorderEvent, RecorderEventType, RecordingData, StoppedBy } from './types';

const FRAME_RATE_TARGET = 60;

interface RecorderConfig {
  centerX: number;
  centerY: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface Recorder {
  start(): void;
  stop(stoppedBy: StoppedBy): RecordingData;
  markEvent(type: RecorderEventType): void;
  getPosition(): { x: number; y: number };
  handleMove(movementX: number, movementY: number): void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Creates a cursor recorder that accumulates pointer-lock movement deltas into
 * a virtual cursor and samples its position at the display refresh rate (~60fps
 * via requestAnimationFrame).
 *
 * Immutability policy (project rule): the hot path mutates internal arrays for
 * efficiency, but `stop()` returns a frozen, copied snapshot so external
 * consumers never receive mutable references.
 */
export function createRecorder(config: RecorderConfig): Recorder {
  const { centerX, centerY, viewportWidth, viewportHeight } = config;

  let virtualX = centerX;
  let virtualY = centerY;
  const frames: Frame[] = [];
  const events: RecorderEvent[] = [];
  let startTime: number | null = null;
  let startedAtIso = '';
  let rafId: number | null = null;

  function handleMove(movementX: number, movementY: number): void {
    virtualX = clamp(virtualX + movementX, 0, viewportWidth);
    virtualY = clamp(virtualY + movementY, 0, viewportHeight);
  }

  function getPosition(): { x: number; y: number } {
    return { x: virtualX, y: virtualY };
  }

  function tick(now: number): void {
    frames.push(
      Object.freeze({
        t: now - (startTime as number),
        x: virtualX,
        y: virtualY,
        xNorm: virtualX / viewportWidth,
        yNorm: virtualY / viewportHeight
      })
    );
    rafId = requestAnimationFrame(tick);
  }

  function start(): void {
    startTime = performance.now();
    startedAtIso = new Date().toISOString();
    rafId = requestAnimationFrame(tick);
  }

  function markEvent(type: RecorderEventType): void {
    if (startTime === null) return;
    events.push({ t: performance.now() - startTime, type });
  }

  function stop(stoppedBy: StoppedBy): RecordingData {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    const durationMs = startTime === null ? 0 : performance.now() - startTime;

    return Object.freeze({
      meta: Object.freeze({
        startedAt: startedAtIso,
        endedAt: new Date().toISOString(),
        durationMs,
        frameRateTarget: FRAME_RATE_TARGET,
        viewportWidth,
        viewportHeight,
        devicePixelRatio: window.devicePixelRatio,
        centerX,
        centerY,
        stoppedBy
      }),
      frames: Object.freeze([...frames]),
      events: Object.freeze([...events])
    });
  }

  return { start, stop, markEvent, getPosition, handleMove };
}
