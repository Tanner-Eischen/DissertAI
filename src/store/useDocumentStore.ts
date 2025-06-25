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
  updateTitle: (title: string) => void;
  refreshDocuments: () => void;
  onDocumentListRefresh?: () => void;
  setDocumentListRefreshCallback: (callback: () => void) => void;
};

export const useDocumentStore = create<Store>((set, get) => ({
  currentDoc: null,
  onDocumentListRefresh: undefined,
  setDoc: (doc) => set({ currentDoc: doc }),
  updateContent: (text) =>
    set((s) =>
      s.currentDoc ? { currentDoc: { ...s.currentDoc, content: text } } : {}
    ),
  updateTitle: (title) =>
    set((s) =>
      s.currentDoc ? { currentDoc: { ...s.currentDoc, title } } : {}
    ),
  refreshDocuments: () => {
    const { onDocumentListRefresh } = get();
    if (onDocumentListRefresh) {
      onDocumentListRefresh();
    }
  },
  setDocumentListRefreshCallback: (callback) => set({ onDocumentListRefresh: callback }),
}));
