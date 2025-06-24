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
    const res = await fetch(`https://rjkunveqbiltuhetakmm.supabase.co/functions/v1/argument-mapper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, text }),
    });
    if (!res.ok) throw new Error('Argument map failed');
   const contentType = res.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    return await res.json();
  } else {
    return await res.text(); // <-- handles Markdown or plain text
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
export async function checkSpelling(docId: string, text: string) {
  const res = await fetch(`https://rjkunveqbiltuhetakmm.supabase.co/functions/v1/check-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId: docId, text }),
  });

  if (!res.ok) throw new Error('Spellcheck failed');
   const contentType = res.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    return await res.json();
  } else {
    return await res.text(); // <-- handles Markdown or plain text
  }
}

