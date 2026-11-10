import Groq from 'groq-sdk';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

if (!apiKey) {
  console.warn('Groq API Key (VITE_GROQ_API_KEY) is missing. AI features will fail until added.');
}

export const groq = new Groq({
  apiKey: apiKey || 'placeholder-key',
  dangerouslyAllowBrowser: true // Required for React client-side execution
});

export const GROQ_MODELS = {
  PRIMARY: 'openai/gpt-oss-120b', // For high-quality generation, synthesis and analytics
  FAST: 'openai/gpt-oss-20b',       // For streamed hints and rapid completions
};
