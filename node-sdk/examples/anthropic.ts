// examples/anthropic.ts — test the Anthropic integration with costrace

import * as dotenv from "dotenv";
import * as path from "path";
import * as costrace from "../src/index.js";

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

costrace.init(process.env.COSTRACE_API_KEY!);

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

console.log("Making real Anthropic calls...");
console.log("These will be tracked by Costrace!\n");

async function main() {
    const models = [
        "claude-haiku-4-5-20251001",
        "claude-sonnet-4-20250514",
        "claude-3-haiku-20240307",
    ];

    for (const model of models) {
        try {
            const response = await client.messages.create({
                model,
                max_tokens: 1024,
                messages: [
                    {
                        role: "user",
                        content: 'Say "Hello from Costrace!" and write a 300 word story.',
                    },
                ],
            });

            console.log(`Model: ${model}`);
            console.log(
                `Response: ${response.content[0].type === "text" ? response.content[0].text : ""}`
            );
            console.log("\nUsage:");
            console.log(`  Input tokens:  ${response.usage.input_tokens}`);
            console.log(`  Output tokens: ${response.usage.output_tokens}`);
            console.log(
                `  Total tokens:  ${response.usage.input_tokens + response.usage.output_tokens}`
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
