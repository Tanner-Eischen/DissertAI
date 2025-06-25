// ai.ts placeholder
export const aiService = {
  async synthesizeAbstract(documentId: string, text: string) {
    const res = await fetch(`https://rjkunveqbiltuhetakmm.supabase.co/functions/v1/optimize-thesis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, text }),
    });
    if (!res.ok) throw new Error('Thesis optimization failed');
    const contentType = res.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    return await res.json();
  } else {
    return await res.text(); // <-- handles Markdown or plain text
  }
},


  async generateArgumentMap(documentId: string, text: string) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: 'You are an expert at analyzing arguments and creating argument maps. Analyze the following text and create a well-formatted, structured analysis of the main arguments, supporting evidence, and logical connections. Use clear headings, bullet points, and organize the content for easy reading.'
          }, {
            role: 'user',
            content: text
          }]
        })
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`OpenAI API error: ${errorData}`);
      }

      const data = await res.json();
      // Extract the content from the chat completion response
      const content = data.choices[0].message.content;
      // Return the content directly as text instead of trying to parse as JSON
      return content;
    } catch (error) {
      console.error('Argument mapper error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate argument map');
    }
},


  async suggestCitations(documentId: string, text: string) {
    const res = await fetch(`https://rjkunveqbiltuhetakmm.supabase.co/functions/v1/citation-annotator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, text }),
    });
    if (!res.ok) throw new Error('Citation annotation failed');
   const contentType = res.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    return await res.json();
  } else {
    return await res.text(); // <-- handles Markdown or plain text
  }
},

  

  async runVirtualReview(documentId: string, text: string) {
    const res = await fetch(`https://rjkunveqbiltuhetakmm.supabase.co/functions/v1/virtual-reviewer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, text }),
    });
      if (!res.ok) throw new Error('Reviewer feedback failed');

  const contentType = res.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    return await res.json();
  } else {
    return await res.text(); // <-- handles Markdown or plain text
  }
},

  async generateAbstract(documentId: string, text: string) {
    const res = await fetch(`https://rjkunveqbiltuhetakmm.supabase.co/functions/v1/abstract-synthesizer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, text }),
    });
    if (!res.ok) throw new Error('Abstract generation failed');
    const contentType = res.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    return await res.json();
  } else {
    return await res.text(); // <-- handles Markdown or plain text
  }
},



};
// Re-export Sapling service for backward compatibility (keeping Harper names)
export { checkSpelling, harperService } from './harper';
export type { HarperError as GrammarError } from './harper';

