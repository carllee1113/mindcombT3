import { API_CONFIG } from '../config/apiConfig';

export interface ElaborationResponse {
  subtopics: string[];
}

export interface ElaborationError extends Error {
  status?: number;
  details?: unknown;
}

export async function generateElaboration(
  nodeContent: string, 
  mainTheme: string, 
  numSubtopics: number = 4
): Promise<ElaborationResponse> {
  const prompt = `Given the main theme "${mainTheme}" and the topic "${nodeContent}", generate ${numSubtopics} innovative subtopics. Format each subtopic as a concise phrase (max 5 words). Each subtopic should be unique and directly related to both the theme and topic. Return the subtopics as a numbered list. No prunctuation, no example, no conslusion, no summary, no repeated words, no numberings. `;

  try {
    const response = await fetch(`${API_CONFIG.OPENROUTER.BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_CONFIG.OPENROUTER.API_KEY}`,
        "HTTP-Referer": API_CONFIG.OPENROUTER.SITE_URL,
        "X-Title": API_CONFIG.OPENROUTER.SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response format');
    }

    const content = data.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response content');
    }
    
    const subtopics = content.split('\n').filter(Boolean);
    if (!subtopics.length) {
      throw new Error('No valid subtopics generated');
    }

    return { subtopics };
  } catch (error) {
    console.error('Elaboration error:', error);
    throw new Error('Failed to generate elaboration');
  }
}