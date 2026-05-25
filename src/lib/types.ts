// Shared data model for mouse-cursor recordings.
// Kept framework-agnostic so recorder/download/store can all reuse it.

export type StoppedBy = 'left' | 'right';

export type RecorderEventType = 'escPressed' | 'lockResumed';

/** A single sampled cursor position. `t` is ms since recording start. */
export interface Frame {
  t: number;
  x: number;
  y: number;
  xNorm: number;
  yNorm: number;
}

/** A non-frame event on the timeline (e.g. ESC pressed, lock resumed). */
export interface RecorderEvent {
  t: number;
  type: RecorderEventType;
}

export interface RecordingMeta {
  startedAt: string;
  endedAt: string;
  durationMs: number;
  frameRateTarget: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  centerX: number;
  centerY: number;
  stoppedBy: StoppedBy;
}

export interface RecordingData {
  meta: RecordingMeta;
  frames: readonly Frame[];
  events: readonly RecorderEvent[];
}
