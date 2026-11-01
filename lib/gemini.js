import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Same model the rest of the app uses.
export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
