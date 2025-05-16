import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment variables
function getApiKey(): string {
  // TEMPORARY: Use a hardcoded API key for testing
  return "AIzaSyDWzNkXzzh9z8JTTJqSznkTn_Lh-6oUjBk"; // Replace with your actual API key
  
  // In client components, we need to use NEXT_PUBLIC_* prefixed env vars
  // const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  // if (!apiKey) {
  //   console.error('NEXT_PUBLIC_GEMINI_API_KEY is not defined in environment variables');
  //   throw new Error('Missing Gemini API key. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.');
  // }
  
  // return apiKey;
}

// Test if the Gemini API key is working
export async function testGeminiApiKey(): Promise<boolean> {
  try {
    const apiKey = getApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Simple test prompt
    const result = await model.generateContent("Say hello.");
    return result && result.response ? true : false;
  } catch (error) {
    console.error('Gemini API key test failed:', error);
    return false;
  }
}

// Initialize the Gemini model
export const initializeGemini = () => {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-pro" });
};

// Generate post content based on parameters
export async function generatePost(
  postType: string,
  toxicityLevel: number,
  topic: string | null,
  tones: string[]
): Promise<string> {
  try {
    console.log("Generating post with Gemini API...");
    const apiKey = getApiKey();
    console.log("API key obtained:", apiKey ? "Key exists" : "Key missing");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Map toxicity level (0-10) to descriptive terms
    const toxicityDescription = 
      toxicityLevel <= 3 ? "friendly and mild" :
      toxicityLevel <= 7 ? "moderate brainrot, somewhat edgy" :
      "extremely toxic, unfiltered hell";

    // Build the prompt based on the parameters
    let prompt = `Generate a viral Twitter/X post in the style of modern viral Indian tech Twitter posts.
    
Post type: ${postType}
${topic ? `Topic: ${topic}` : ''}
Toxicity level (0-10): ${toxicityLevel} 
${tones.length > 0 ? `Tone: ${tones.join(', ')}` : ''}

Make it sound authentic, with the right amount of emojis and hashtags. Keep it within 280 characters. Don't use any placeholders. Make it feel real.

The post should embody the essence of Indian tech Twitter culture and slang, with references to startups, coding, tech companies, buzzwords, and career advice.`;

    console.log("Prompt prepared:", prompt);

    // Generate content with the model
    const result = await model.generateContent(prompt);
    console.log("Response received from Gemini API");
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating post with Gemini:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    throw new Error('Failed to generate content. Please try again later.');
  }
} 