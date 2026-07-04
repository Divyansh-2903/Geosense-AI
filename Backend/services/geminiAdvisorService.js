const path = require('path');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const useVertexAI = process.env.USE_VERTEX_AI === 'true';
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
let ai = null;

if (useVertexAI) {
    const project = process.env.GCP_PROJECT || 'vedax009';
    const location = process.env.GCP_LOCATION || 'us-central1';
    
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    }
    
    ai = new GoogleGenAI({
        vertexai: true,
        project: project,
        location: location
    });
    console.log(`✅ Gemini Advisor initialized with Vertex AI (Model: ${modelName}, Region: ${location})`);
} else {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_key_here') {
        ai = new GoogleGenAI({
            apiKey: apiKey
        });
        console.log(`✅ Gemini Advisor initialized with Google AI Studio (Model: ${modelName})`);
    } else {
        console.warn(`⚠️ Gemini Advisor API key not configured.`);
    }
}

async function getFarmAdvice(analysis) {
    if (!ai) {
        return "⚠️ **Gemini API key is not configured.** Please set a valid `GEMINI_API_KEY` in your `.env` file to enable dynamic AI agricultural advisor recommendations.";
    }

    const prompt = `
You are Agri-Sense, a state-of-the-art agricultural AI advisor.
Analyze the following farm remote sensing and weather statistics:
${JSON.stringify(analysis, null, 2)}

Provide a structured agricultural assessment report using Markdown. Organize it with clear section headers, bullet points, and practical action items:

### 🌟 Overall Farm Health Assessment
Provide a concise overview of the current status based on the NDVI (Vegetation Index) and Crop Health Score.

### 🌾 Crop Condition & Growth Phase
Analyze the current growth stage (${analysis.growthStage}) and provide management advice tailored to this phase.

### 🐛 Disease Risk & Prevention
Comment on the ${analysis.diseaseRisk} risk level. Suggest proactive preventative treatments.

### 💧 Smart Irrigation Advice
Based on the NDWI (Moisture Index), water deficit, the next irrigation schedule suggestion (${analysis.irrigationRecommendation}), and the structured water requirement (${analysis.agronomy?.waterRequirementLitres || 'N/A'} litres), detail exactly how much water is needed and when.

### 🧪 Fertilizer & Soil Management
Provide specialized recommendations for the suggested fertilizers (${analysis.fertilizer || 'None'}) and the structured fertilizer quantity plan (${analysis.agronomy?.fertilizerPlan?.recommendation || 'N/A'}).

### Priority Action Window
Use the structured urgency score (${analysis.agronomy?.urgencyScore ?? 'N/A'}/100) and action window (${analysis.agronomy?.actionWindow || 'N/A'}) to state what the farmer should do first.

### 📈 Outlook (Yield & Revenue)
Analyze the yield prediction (${analysis.yieldPrediction} tons/hectare) and expected revenue (${analysis.revenuePrediction ? '$' + analysis.revenuePrediction : 'N/A'}). Provide suggestions to maximize quality and value.

Keep the advice action-oriented, simple, and scientific.
`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt
        });

        return response.text;
    } catch (error) {
        console.error("Gemini Advisor Service Error:", error);
        return `### Fallback advice\n- **Crop**: ${analysis.crop}\n- **Health Status**: ${analysis.healthScore}/100\n- **Next Steps**: Maintain standard watering schedules. Monitor fields for signs of stress, particularly since disease risk is marked as **${analysis.diseaseRisk || 'Moderate'}**.`;
    }
}

async function getChatAdvice(analysis, chatHistory, userMessage) {
    if (!ai) {
        return "I apologize, but my Gemini AI advisor module is currently in offline mode (API key not configured). Please check your `.env` settings.";
    }

    // Prepare system instructions and message context
    const contents = [
        {
            role: 'user',
            parts: [{
                text: `You are Agri-Sense, a friendly and professional agricultural AI consultant. 
You are discussing a farm report with a grower. Here is the farm report data:
${JSON.stringify(analysis, null, 2)}

Answer the grower's questions concisely, focusing on practical farming science and local agronomic practices. Format your replies in clean Markdown.`
            }]
        }
    ];

    // Add conversation history
    chatHistory.forEach(msg => {
        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        });
    });

    // Add current user message
    contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
    });

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Chat Advice Error:", error);
        return "I encountered an issue processing that query. Please try asking again shortly.";
    }
}

module.exports = getFarmAdvice;
module.exports.getChatAdvice = getChatAdvice;
