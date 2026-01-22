
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI SDK using the API key strictly from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIResponse = async (prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: `You are the JDL Entrepreneurship Center Assistant at VSU. 
        Your goal is to help students, faculty, and local entrepreneurs navigate the center's resources.
        Resources include:
        1. 1-on-1 Mentorship with entrepreneurs-in-residence.
        2. Co-working space booking.
        3. High-end equipment like 3D printers and CNC machines.
        4. Specialized workshops (Marketing, Finance, Legal).
        5. Pitch deck reviews.
        
        Keep your tone professional, encouraging, and supportive of student innovation.
        If someone asks about booking, guide them to the booking form.
        Explain that the JDL center is located at Virginia State University and focuses on fostering a vibrant entrepreneurial ecosystem.`,
        temperature: 0.7,
      }
    });
    
    // Use the .text property as a getter as specified in the Google GenAI SDK documentation
    return response.text || "I'm sorry, I couldn't process that. How else can I help with your startup goals?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The assistant is currently unavailable. Please try again later.";
  }
};