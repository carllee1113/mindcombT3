import { API_CONFIG } from '../config/apiConfig';
import { handleError } from './errorHandler';

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
  const prompt = `Theme: "${mainTheme}", Topic: "${nodeContent}". Generate ${numSubtopics} concise, innovative subtopics. Format: {"subtopics": ["key phrase 1", "key phrase 2", ...]}. Keep each subtopic under 5 words.`;

  try {
    const response = await fetch(`${API_CONFIG.OPENROUTER.BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_CONFIG.OPENROUTER.API_KEY}`,
        "HTTP-Referer": API_CONFIG.OPENROUTER.REFERER,
        "X-Title": API_CONFIG.OPENROUTER.TITLE,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = new Error(`API request failed with status ${response.status}`) as ElaborationError;
      error.status = response.status;
      error.details = await response.json().catch(() => undefined);
      throw error;
    }

    const completion = await response.json();
    
    try {
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from API');
      }

      // Clean the response string before parsing
      const cleanContent = content.replace(/```json|\```/g, '').trim();
      const parsedResponse = JSON.parse(cleanContent);
      
      if (!Array.isArray(parsedResponse.subtopics)) {
        throw new Error('Invalid response format: subtopics is not an array');
      }

      return { subtopics: parsedResponse.subtopics };
    } catch (parseError) {
      console.error('Response parsing error:', completion.choices[0]?.message?.content);
      throw new Error('Failed to parse API response');
    }
  } catch (error) {
    handleError(error, 'Failed to generate elaboration');
    throw error;
  }
}