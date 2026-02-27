// examples/openai.ts — test the OpenAI integration with costrace

import * as dotenv from "dotenv";
import * as path from "path";
import * as costrace from "../src/index.js";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

costrace.init(process.env.COSTRACE_API_KEY!);

import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

console.log("Making real OpenAI calls...");
console.log("These will be tracked by Costrace!\n");

async function main() {
  const models = ["gpt-5-mini", "gpt-4o-mini", "gpt-3.5-turbo"];

  for (const model of models) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content: 'Say "Hello from Costrace!" and a 100 words story.',
          },
        ],
      });

      console.log(`Model: ${model}`);
      console.log(`Response: ${response.choices[0].message.content}`);
      console.log("\nUsage:");
      console.log(`  Input tokens:  ${response.usage?.prompt_tokens}`);
      console.log(`  Output tokens: ${response.usage?.completion_tokens}`);
      console.log(`  Total tokens:  ${response.usage?.total_tokens}`);
      console.log("\n" + "=".repeat(80) + "\n");
    } catch (err) {
      console.error(`Error with model ${model}:`, err);
    }
  }

  // Wait for fire-and-forget traces to be sent before exiting
  await new Promise((r) => setTimeout(r, 2000));
}

main();
