const { GoogleGenAI } = require("@google/genai");
const { ethers } = require("ethers");
require("dotenv").config();

const MODEL_CHAIN = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3-flash-preview"
];

async function queryGeminiVisionPricer(prompt, imageData = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const triedModels = [];

  for (const modelName of MODEL_CHAIN) {
    try {
      console.log(`[Vision Pricer] Attempting inference with model: ${modelName}...`);
      triedModels.push(modelName);

      const contents = imageData
        ? [
            {
              text: prompt
            },
            {
              inlineData: {
                mimeType: "image/png",
                data: imageData
              }
            }
          ]
        : prompt;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: "You are the EdgeScout Vision Pricer Oracle for Ry Hawthorne '_404/LostLayer' (#4041) on Optimism OP Stack. Analyze market valuation, floor prices, and enforce the 80% bid ceiling (MAX_BID_CEILING_BPS = 8000). Always output clean structured data.",
          responseMimeType: "application/json"
        }
      });

      console.log(`[Vision Pricer] Successfully received response from ${modelName} ✅`);
      return {
        success: true,
        modelUsed: modelName,
        text: response.text,
        fallbackPath: triedModels
      };
    } catch (error) {
      console.warn(`[Vision Pricer] Model ${modelName} failed (${error.message}). Trying next fallback...`);
    }
  }

  throw new Error(`CRITICAL: All models in the Gemini model chain failed (${MODEL_CHAIN.join(" -> ")}).`);
}

async function runVisionPricerOracleSync() {
  const prompt = `Analyze live marketplace floor prices for Ry Hawthorne '_404/LostLayer' on Optimism. Return JSON with:
  {
    "floorPriceETH": 3.40,
    "maxBidETH": 2.72,
    "discountPercentage": 20.0,
    "maxBidCeilingBps": 8000,
    "confidenceScore": 0.96,
    "reasoning": "Live floor at 3.40 ETH on Optimism. 80% ceiling yields 2.72 ETH max target bid."
  }`;
  const aiResult = await queryGeminiVisionPricer(prompt);
  console.log("[Oracle Result]:", aiResult);
  return aiResult;
}

if (require.main === module) {
  runVisionPricerOracleSync().catch(console.error);
}

module.exports = { queryGeminiVisionPricer, runVisionPricerOracleSync, MODEL_CHAIN };
