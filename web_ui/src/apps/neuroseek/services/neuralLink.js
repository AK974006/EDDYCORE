/**
 * NEUROSEEK NEURAL LINK SERVICE
 * Handles communication with external intelligence providers (OpenRouter).
 */

const PERMANENT_KEY = ""; // Removed for security

export const queryNeuralNetwork = async (query, apiKey) => {
    const activeKey = apiKey || PERMANENT_KEY;

    if (!activeKey) {
        throw new Error("Access Denied: Neural Link Key Missing.");
    }

    // Configuration
    const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
    const MODEL = "mistralai/mistral-7b-instruct:free";

    try {
        const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${activeKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.href,
                "X-Title": "NeuroSeek",
            },
            body: JSON.stringify({
                "model": MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are NeuroSeek, a highly advanced serial intelligence engine. Your inputs are search queries. Provide a comprehensive, technical, and data-rich answer. Format output with clear headers and bullet points where applicable."
                    },
                    { "role": "user", "content": query }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Neural Link Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        // Validation
        if (data.error) {
            throw new Error(data.error.message || "Unknown External Error");
        }

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            // Fallback or specific error
            return "Neural Link established, but no data stream was returned.";
        }

        return content;

    } catch (error) {
        console.error("[NEURAL_LINK_FAILURE]", error);
        throw error; // Re-throw to be handled by UI
    }
};
