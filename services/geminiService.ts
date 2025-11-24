import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getNonnaCommentary = async (score: number, wave: number, victory: boolean): Promise<string> => {
  const client = getClient();
  if (!client) {
    return "Mamma mia! No API key found. Just imagine I am yelling at you in Italian!";
  }

  const mood = victory ? "proud but still critical" : "disappointed and dramatic";
  const context = victory 
    ? `The player won wave ${wave} with ${score} points.` 
    : `The player lost at wave ${wave} with only ${score} points.`;

  const prompt = `
    You are Nonna, a stereotypical, dramatic, and passionate Italian grandmother.
    ${context}
    Give the player a short (max 2 sentences) commentary on their performance in "Pasta Invaders".
    Use Italian interjections like "Mamma mia!", "Che disastro!", "Bravissimo!".
    Mood: ${mood}.
    If the score is low, roast their cooking skills. If high, say they might earn a meatball.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Mamma mia! I am speechless.";
  } catch (error) {
    console.error("Gemini error:", error);
    return "Eh, the internet... it is broken like your pasta.";
  }
};