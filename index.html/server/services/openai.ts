import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function categorizeIssue(description: string, title: string): Promise<{
  category: string;
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that categorizes civic issues. Based on the title and description provided, categorize the issue into one of these categories: roads, sanitation, electricity, water, traffic, environment, other. Also provide a confidence score between 0 and 100. Respond with JSON in this format: { "category": "category_name", "confidence": number }`
        },
        {
          role: "user",
          content: `Title: ${title}\nDescription: ${description}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    const validCategories = ["roads", "sanitation", "electricity", "water", "traffic", "environment", "other"];
    const category = validCategories.includes(result.category) ? result.category : "other";
    const confidence = Math.max(0, Math.min(100, result.confidence || 50));

    return { category, confidence };
  } catch (error) {
    console.error("Failed to categorize issue:", error);
    return { category: "other", confidence: 0 };
  }
}

export async function generateIssueSummary(description: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that creates concise summaries of civic issues. Create a brief, clear summary in 1-2 sentences that captures the main problem."
        },
        {
          role: "user",
          content: description
        }
      ],
    });

    return response.choices[0].message.content || description;
  } catch (error) {
    console.error("Failed to generate summary:", error);
    return description;
  }
}
