import { GoogleGenAI } from "@google/genai";
import { BookingSummary } from "../types";

// Always use named parameter and process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEventPlan = async (booking: BookingSummary): Promise<string> => {
  if (!process.env.API_KEY) return "請設定 API Key 以啟用 AI 助理功能。";

  const servicesList = booking.selections
    .map(s => {
       // Find vendor name for context (simplified logic, usually we pass the full object)
       return `${s.category}`;
    })
    .join(', ');

  const location = booking.userRequest.isLocationUndecided
    ? '地點未定'
    : `${booking.userRequest.city}${booking.userRequest.district}`;

  const prompt = `
    你是一位專業的活動策劃顧問。請根據以下活動資訊，生成一份活動流程建議 (Run-down) 以及給主辦方的溫馨提醒。
    
    活動資訊：
    - 主辦人：${booking.userRequest.name}
    - 日期：${booking.userRequest.date}
    - 時間：${booking.userRequest.startTime} 到 ${booking.userRequest.endTime} (共 ${booking.durationHours} 小時)
    - 地點：${location}
    - 預定服務項目：${servicesList}

    請輸出格式：
    1. **活動亮點摘要**
    2. **建議流程表** (以時間點列出，例如 14:00 - 14:15 開場)
    3. **給主辦方的準備清單** (針對已選服務的特別提醒)
    
    請使用繁體中文，語氣專業且熱情。
  `;

  try {
    // Correct method: Use gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Correct extraction: Direct property access
    return response.text || "無法生成建議。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 暫時無法提供服務，請稍後再試。";
  }
};