import { create } from 'zustand';

type Doc = {
  id: string;
  title: string;
  content: string;
};

type Store = {
  currentDoc: Doc | null;
  setDoc: (doc: Doc) => void;
  updateContent: (text: string) => void;
};

export const useDocumentStore = create<Store>((set) => ({
  currentDoc: null,
  setDoc: (doc) => set({ currentDoc: doc }),
  updateContent: (text) =>
    set((s) =>
      s.currentDoc ? { currentDoc: { ...s.currentDoc, content: text } } : {}
    ),
}));
