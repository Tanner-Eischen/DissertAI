


export type ToolName =
  | 'spellcheck'
  | 'argument-mapper'
  | 'citation-annotator'
  | 'optimize-thesis'
  | 'virtual-reviewer'
  | 'abstract-synthesizer';

export const TOOLS: { name: ToolName; label: string }[] = [
//   { name: 'spellcheck', label: 'Spell Check' },
  { name: 'argument-mapper', label: 'Argument Graph' },
  { name: 'citation-annotator', label: 'Citation Fixer' },
  { name: 'optimize-thesis', label: 'Thesis Optimizer' },
  { name: 'virtual-reviewer', label: 'Reviewer' },
  { name: 'abstract-synthesizer', label: 'Abstract' },
];

