"use server";

import { GoogleGenAI } from "@google/genai";

// Initialize the SDK using your secure environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getLiveKenyanEvent() {
  try {
    // 1. Fetch raw data. 
    // In production, replace this string with a fetch() call to a local Kenyan event API or RSS feed.
    // For now, we are feeding it real upcoming event data for Nairobi.
    const rawEventData = `
      Upcoming Event: International Conference on Science, Technology, Engineering and Management (ICSTEM)
      Location: Nairobi, Kenya
      Date: 09 Aug 2026
      Details: Explore leading Technology conferences in Nairobi 2026, bringing together global professionals to explore next-generation solutions, with opportunities for research presentation, networking, and invitation letters.
    `;

    // 2. Instruct Gemini to extract and format the data as strict JSON
    const prompt = `
      You are an expert data extractor. I will provide raw text about a tech event in Kenya.
      Extract the details and return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.
      
      The JSON object must have these exact keys:
      - slug (a URL-safe string based on the title)
      - title (the name of the event)
      - date (format: Month Day)
      - time (guess a standard time like "9:00 AM (EAT)" if missing)
      - blurb (A compelling 1-sentence summary, max 100 characters)

      Raw Data:
      ${rawEventData}
    `;

    // 3. Call the Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    // 4. Parse the AI's text response into a JavaScript object
    const rawText = response.text || "";
    const cleanJsonString = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanJsonString);

  } catch (error) {
    console.error("Failed to process event with Gemini:", error);
    
    // Fallback in case the API call fails or rate limits
    return {
      slug: "africa-hackon-2026",
      title: "Africa Hackon CyberSecurity Summit",
      date: "Aug 13",
      time: "9:00 AM (EAT)",
      blurb: "Join the premier cybersecurity event in Nairobi to network and learn."
    };
  }
}