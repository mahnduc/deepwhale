import { keyApi } from "@/app/dashboard/settings/api-key/_api/key.api";

interface ResolvedEntity {
  vi: string;
  en: string;
}

interface QueryExpansionResponse {
  corrected_query: string;
  resolved_entity: ResolvedEntity;
  brainstorm: string[];
  vietnamese_keywords: string[];
  english_keywords: string[];
}

export async function queryExpand(query: string): Promise<string> {
  if (!query?.trim()) return "";

  const URL = "https://api.groq.com/openai/v1/chat/completions";

  try {
    const apiKey = await keyApi.getKey(1);

    if (!apiKey) {
      console.error("Groq Error: API Key rỗng!");
      return query;
    }

    const prompt = `
You are an expert multilingual search query expansion engine specialized in Vietnamese and English.
You handle ALL topics: animals, science, technology, history, medicine, food, culture, law, finance, sports, and more.

Follow these steps STRICTLY and IN ORDER:

STEP 1 — SPELL CHECK & CORRECTION:
- Detect language (Vietnamese or English).
- Fix typos, misspellings, wrong or missing Vietnamese diacritics.
- Output as "corrected_query".

STEP 2 — ENTITY RESOLUTION:
- Before brainstorming, identify what the query is truly referring to — resolve any colloquial, abbreviated, folk names, acronyms, or shorthand to their full standard form in both Vietnamese and English, then brainstorm based on that resolved identity, not the raw input words.
- Apply to ALL domains, for example:
  · Animals:     "cánh cụt" → chim cánh cụt → penguin
  · Medicine:    "tiểu đường" → bệnh đái tháo đường → diabetes mellitus
  · Technology:  "AI" → trí tuệ nhân tạo → artificial intelligence
  · Finance:     "chứng khoán" → thị trường chứng khoán → stock market
  · Food:        "phở" → phở bò/gà → Vietnamese noodle soup (pho)
  · Law:         "dân sự" → luật dân sự → civil law
  · Geography:   "SG" → Thành phố Hồ Chí Minh → Ho Chi Minh City
- If the query is already a full standard term, resolve it as-is.
- Output as "resolved_entity": { "vi": "...", "en": "..." }

STEP 3 — BRAINSTORM:
- Use the resolved entity from Step 2 (NOT the raw input) as the subject.
- Think broadly about the topic: definitions, subtypes, causes, effects, history, usage, related concepts, notable examples, controversies, current trends.
- List 5–8 short phrases. Use Vietnamese if input was Vietnamese.
- Output as "brainstorm": [...]

STEP 4 — VIETNAMESE KEYWORDS:
- Generate 5–8 Vietnamese keyword phrases.
- Must include the full standard Vietnamese name from Step 2.
- Include synonyms, related terms, and academic/technical terminology.
- Output as "vietnamese_keywords": [...]

STEP 5 — ENGLISH KEYWORDS:
- Generate 5–8 English keyword phrases.
- Must include the English name from Step 2.
- Add academic, scientific, or industry-standard terms, related subtopics, and descriptive keywords.
- Output as "english_keywords": [...]

Return ONLY valid JSON in this exact format:
{
  "corrected_query": "...",
  "resolved_entity": { "vi": "...", "en": "..." },
  "brainstorm": ["...", "..."],
  "vietnamese_keywords": ["...", "..."],
  "english_keywords": ["...", "..."]
}

Rules:
- No markdown, no explanation, no extra text outside JSON.
- All arrays must be non-empty.
- Max 8 items per array.
- english_keywords MUST contain the "en" value from resolved_entity.

Input query:
${query}
`;

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are a JSON API. You only output valid JSON with no extra text, no markdown, no explanation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        response_format: {
          type: "json_object",
        },
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Groq Error:", errorData);
      return query;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim() ?? "";

    let parsed: QueryExpansionResponse;

    try {
      parsed = JSON.parse(content) as QueryExpansionResponse;
    } catch (e) {
      console.warn("Không parse được JSON:", content);
      return query;
    }

    const correctedQuery = parsed.corrected_query?.trim() || query;
    const resolvedEntity = parsed.resolved_entity ?? { vi: "", en: "" };
    const brainstorm = Array.isArray(parsed.brainstorm) ? parsed.brainstorm : [];
    const vietnameseKeywords = Array.isArray(parsed.vietnamese_keywords)
      ? parsed.vietnamese_keywords
      : [];
    const englishKeywords = Array.isArray(parsed.english_keywords)
      ? parsed.english_keywords
      : [];

    const entityTerms = [resolvedEntity.vi, resolvedEntity.en].filter(Boolean);

    const mergedTerms = [
      query,
      correctedQuery,
      ...entityTerms,
      ...vietnameseKeywords,
      ...englishKeywords,
    ]
      .map((s) => s.trim())
      .filter(Boolean);

    const uniqueTerms = [...new Set(mergedTerms)];
    const expandedQuery = uniqueTerms.join(" ");

    return expandedQuery;
  } catch (error) {
    console.error("Lỗi query expansion, fallback về query gốc:", error);
    return query;
  }
}