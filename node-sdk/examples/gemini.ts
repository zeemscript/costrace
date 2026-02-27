// examples/gemini.ts — test the Gemini integration with costrace

import * as dotenv from "dotenv";
import * as path from "path";
import * as costrace from "../src/index.js";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

costrace.init(process.env.COSTRACE_API_KEY!);

import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

console.log("Making real Gemini calls...");
console.log("These will be tracked by Costrace!\n");

async function main() {
  const models = ["gemini-2.0-flash", "gemini-1.5-flash"];

  for (const model of models) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: 'Say "Hello from Costrace!" and write a 300 word story.',
      });

      console.log(`Model: ${model}`);
      console.log(`Response: ${response.text}`);
      console.log("\nUsage:");
      console.log(
        `  Input tokens:  ${response.usageMetadata?.promptTokenCount}`,
      );
      console.log(
        `  Output tokens: ${response.usageMetadata?.candidatesTokenCount}`,
      );
      console.log(
        `  Total tokens:  ${response.usageMetadata?.totalTokenCount}`,
      );
      console.log("\n" + "=".repeat(80) + "\n");
    } catch (err) {
      console.error(`Error with model ${model}:`, err);
    }
  }

  // Wait for fire-and-forget traces to be sent before exiting
  await new Promise((r) => setTimeout(r, 2000));
}

main();
