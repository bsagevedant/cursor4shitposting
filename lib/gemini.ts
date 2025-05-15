import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key - using hardcoded API key
const getApiKey = (): string => {
  // Working API key for demonstration
  return "AIzaSyDx91LRh-gKMxhC4yxdJ6Jm-T2R3Ev-RnY";
};

// Initialize the Gemini model
export const initializeGemini = () => {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

// Generate post content based on parameters
export async function generatePost(
  postType: string, 
  toxicityLevel: number,
  topic: string | null,
  tones: string[]
): Promise<string> {
  const model = initializeGemini();

  // Map toxicity level (0-10) to descriptive terms
  const toxicityDescription = 
    toxicityLevel <= 3 ? "friendly and mild" :
    toxicityLevel <= 7 ? "moderate brainrot, somewhat edgy" :
    "extremely toxic, unfiltered hell";

  // Build the prompt based on the parameters
  let prompt = `Generate a hilarious Indian tech Twitter shitpost in the style of "${postType}".
  
The toxicity level is ${toxicityLevel}/10 (${toxicityDescription}).`;

  // Add topic if provided
  if (topic && topic.trim() !== "") {
    prompt += `\nThe topic should relate to: ${topic}.`;
  }

  // Add tones if selected
  if (tones.length > 0) {
    prompt += `\nThe tone should be: ${tones.join(", ")}.`;
  }
  
  prompt += `\n\nThis post is for Indian tech Twitter targeting startup bros, meme lords, VCs, GPT fanboys, solopreneurs, and CS undergrads.

Make sure to:
- Keep it under 280 characters (Twitter limit)
- Include relevant tech/startup slang
- Maybe add some emojis where appropriate
- Make it sound authentic to Indian tech Twitter
- Don't include hashtags unless they're part of the joke
- Don't include quotes or "Posted by @username" text`;

  // Generate content with the model
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text.trim();
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
} 