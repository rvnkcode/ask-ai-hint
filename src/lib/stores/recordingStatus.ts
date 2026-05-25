import { writable } from 'svelte/store';

export interface LastRecording {
  filename: string;
  finishedAt: string;
}

// Lightweight metadata about the most recent recording, used to show a summary
// on the /done page. The recording itself is exported via file download, so no
// large data needs to cross page boundaries.
export const lastRecording = writable<LastRecording | null>(null);
