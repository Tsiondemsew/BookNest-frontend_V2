import { create } from 'zustand';
import type { Reader } from '@repo/types';

export interface ReaderState {
  reader: Reader | null;
  setReader: (reader: Reader | null) => void;
  clearReader: () => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
  reader: null,
  setReader: (reader) => set({ reader }),
  clearReader: () => set({ reader: null }),
}));

