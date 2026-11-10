import { groq, GROQ_MODELS } from '../lib/groq';
import type { GeneratedCard, WeakSpotAnalysisResponse, QuizEvaluation, ConceptMapData } from '../types/ai.types';

export const aiService = {
  /**
   * Generates a set of flashcards from text contents using Llama-3.3-70b-versatile.
   */
  async generateCards(content: string, count: number): Promise<GeneratedCard[]> {
    try {
      const response = await groq.chat.completions.create({
        model: GROQ_MODELS.PRIMARY,
        messages: [
          {
            role: 'system',
            content: `You are a flashcard generation expert. Given the content provided by the user, generate exactly ${count} high-quality flashcards. 
            You MUST return a JSON object with a single key "cards" containing a list of flashcard objects.
            Format: { "cards": [{"question": "...", "answer": "..."}] }
            Rules:
            1. Questions should test conceptual understanding rather than simple vocabulary memorization.
            2. Answers must be concise and clear (1 to 3 sentences).
            3. Do not generate duplicate questions.
            4. Respond ONLY with valid JSON conforming to the format.`
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const textResponse = response.choices[0]?.message?.content;
      if (!textResponse) throw new Error('Empty response received from Groq AI.');

      const parsed = JSON.parse(textResponse);
      if (!parsed.cards || !Array.isArray(parsed.cards)) {
        throw new Error('Groq AI returned JSON in an incorrect format.');
      }

      return parsed.cards as GeneratedCard[];
    } catch (err: any) {
      console.error('Groq Card Generation API error:', err);
      // Handle rate limits (429) specifically
      if (err?.status === 429) {
        throw new Error('AI is busy, try again in a moment.');
      }
      throw err;
    }
  },

  /**
   * Streams a single-sentence hint nudge for a question using Llama-3.1-8b-instant.
   * Calls the callback with each incoming text fragment.
   */
  async generateHint(
    question: string,
    onChunk: (text: string) => void
  ): Promise<string> {
    try {
      const stream = await groq.chat.completions.create({
        model: GROQ_MODELS.FAST,
        messages: [
          {
            role: 'system',
            content: `You are a helpful study guide. Provide a single-sentence hint or nudge to help the student recall the answer to their flashcard question. 
            CRITICAL: Do NOT reveal the actual answer under any circumstances. Nudge their memory by asking a guiding question or pointing to a related concept.`
          },
          {
            role: 'user',
            content: `Here is the question the student is stuck on: "${question}"`
          }
        ],
        stream: true,
      });

      let fullText = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullText += content;
          onChunk(content);
        }
      }

      return fullText;
    } catch (err: any) {
      console.error('Groq Hint Stream API error:', err);
      throw err;
    }
  },

  /**
   * Performs semantic analysis of failed reviews to identify weak spots using Llama-3.3-70b-versatile.
   */
  async suggestWeakSpots(
    failedReviews: { question: string; answer: string }[]
  ): Promise<WeakSpotAnalysisResponse> {
    try {
      const promptContent = failedReviews
        .map((r, i) => `${i + 1}. Q: "${r.question}" | A: "${r.answer}"`)
        .join('\n');

      const response = await groq.chat.completions.create({
        model: GROQ_MODELS.PRIMARY,
        messages: [
          {
            role: 'system',
            content: `You are an educational psychologist analyzing a student's study performance.
            Given the list of questions the student keeps getting wrong, identify the top 3 knowledge gaps and suggest concrete study recommendations.
            You MUST return a JSON object conforming to this structure:
            {
              "gaps": [
                {
                  "topic": "Topic Name",
                  "description": "Explanation of what concept the user is struggling to grasp.",
                  "recommendation": "Actionable advice on what they should study to fix this gap."
                }
              ]
            }
            Ensure you return exactly 3 items in the "gaps" array if possible. Return only JSON.`
          },
          {
            role: 'user',
            content: `Here are the flashcards the user failed to answer correctly:\n${promptContent}`
          }
        ],
        temperature: 0.4,
        response_format: { type: "json_object" }
      });

      const textResponse = response.choices[0]?.message?.content;
      if (!textResponse) throw new Error('Empty response received from Groq AI.');

      return JSON.parse(textResponse) as WeakSpotAnalysisResponse;
    } catch (err: any) {
      console.error('Groq Weak Spot Analysis API error:', err);
      throw err;
    }
  },

  /**
   * Evaluates a student's typed response against the reference answer.
   */
  async evaluateAnswer(
    question: string,
    correctAnswer: string,
    userAnswer: string
  ): Promise<QuizEvaluation> {
    try {
      const response = await groq.chat.completions.create({
        model: GROQ_MODELS.PRIMARY,
        messages: [
          {
            role: 'system',
            content: `You are an educational evaluator. Given a question, the correct reference answer, and the student's typed answer, evaluate the student's response.
            Be constructive, encouraging, and precise.
            You MUST return a JSON object with this structure:
            {
              "score": 85, // Integer from 0 to 100 indicating conceptual match percentage
              "strengths": ["Itemized point of what they correctly recalled..."],
              "weaknesses": ["Itemized point of key details they missed or got wrong..."],
              "feedback": "Encouraging explanation of the differences and what to focus on."
            }
            Do not include any text other than the JSON object.`
          },
          {
            role: 'user',
            content: `Question: "${question}"
            Reference Answer: "${correctAnswer}"
            Student's Typed Answer: "${userAnswer}"`
          }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      const textResponse = response.choices[0]?.message?.content;
      if (!textResponse) throw new Error('Empty response received from Groq AI.');

      return JSON.parse(textResponse) as QuizEvaluation;
    } catch (err: any) {
      console.error('Groq Answer Evaluation API error:', err);
      throw err;
    }
  },

  /**
   * Generates a visual concept map structure explaining the concept of a card.
   */
  async generateConceptMap(
    question: string,
    answer: string
  ): Promise<ConceptMapData> {
    try {
      const response = await groq.chat.completions.create({
        model: GROQ_MODELS.PRIMARY,
        messages: [
          {
            role: 'system',
            content: `You are a learning visualizer. Given a flashcard question and its answer, create a visual concept map (mind map/flowchart) in JSON format that links the main ideas.
            The map must have a single central node (the root concept) and 3 to 5 connected child nodes representing subconcepts or explanations.
            Use a variety of colors ('indigo', 'violet', 'emerald', 'amber', 'rose', 'sky') for different nodes.
            You MUST return a JSON object conforming to this structure:
            {
              "title": "Short title of the concept map",
              "nodes": [
                { "id": "unique-id", "label": "Short Node Label (2-4 words)", "color": "color-name", "description": "Brief explanation of this node (1 sentence)" }
              ],
              "edges": [
                { "from": "node-id-1", "to": "node-id-2", "label": "link relationship (1-2 words, e.g. 'defines', 'creates', 'implements')" }
              ]
            }
            Ensure the first node in the array is the central (root) node.
            Ensure nodes are properly connected. Keep labels concise. Do not include any text other than the JSON object.`
          },
          {
            role: 'user',
            content: `Question: "${question}"\nAnswer: "${answer}"`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const textResponse = response.choices[0]?.message?.content;
      if (!textResponse) throw new Error('Empty response received from Groq AI.');

      return JSON.parse(textResponse) as ConceptMapData;
    } catch (err: any) {
      console.error('Groq Concept Map API error:', err);
      throw err;
    }
  }
};
