import dotenv from "dotenv";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import puppeteer from "puppeteer";
import { zodToJsonSchema } from "zod-to-json-schema";


dotenv.config();

function getAiClient() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GOOGLE_GEMINI_API_KEY is missing");
    }

    return new GoogleGenAI({ apiKey });
}

const interviewReportSchema = z.object({
    jobTitle: z.string().min(1),

    matchScore: z.number().min(0).max(100),

    technicalQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string(),
        })
    ).min(3),

    behavioralQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string(),
        })
    ).min(3),

    skillGap: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum(["low", "medium", "high"]),
            type: z.string(),
        })
    ).min(1),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string()),
        })
    ).min(3),
});

const DEFAULT_INTENTION = "Assess practical experience and decision-making.";
const DEFAULT_ANSWER = "Share a concrete example with context, actions, and outcome.";
const DEFAULT_TASK = "Review the topic and prepare one concrete example.";

function parseAiJson(rawText) {
    const text = String(rawText ?? "").trim();

    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

        if (!match?.[1]) {
            throw new Error("Invalid JSON from AI");
        }

        return JSON.parse(match[1]);
    }
}

function text(value, fallback) {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function list(value) {
    return Array.isArray(value) ? value : [];
}

function padToMin(items, min, createItem) {
    while (items.length < min) {
        items.push(createItem(items.length));
    }

    return items;
}

function normalizeQuestion(item, index, label) {
    if (typeof item === "string") {
        return {
            question: item,
            intention: DEFAULT_INTENTION,
            answer: DEFAULT_ANSWER,
        };
    }

    return {
        question: text(item?.question, `${label} question ${index + 1}`),
        intention: text(item?.intention, DEFAULT_INTENTION),
        answer: text(item?.answer, DEFAULT_ANSWER),
    };
}

function normalizeInterviewReport(data = {}) {
    const technicalQuestions = list(data.technicalQuestions).map((item, index) =>
        normalizeQuestion(item, index, "Technical")
    );

    const behavioralQuestions = list(data.behavioralQuestions).map((item, index) =>
        normalizeQuestion(item, index, "Behavioral")
    );

    const skillGap = list(data.skillGap).map((item, index) => ({
        skill: text(typeof item === "string" ? item : item?.skill, `Skill gap ${index + 1}`),
        severity: ["low", "medium", "high"].includes(item?.severity) ? item.severity : "medium",
        type: text(item?.type, "Technical"),
    }));

    const preparationPlan = list(data.preparationPlan).map((item, index) => {
        if (typeof item === "string") {
            return {
                day: index + 1,
                focus: item,
                tasks: [item],
            };
        }

        const tasks = list(item?.tasks)
            .filter(task => typeof task === "string" && task.trim())
            .map(task => task.trim());

        return {
            day: typeof item?.day === "number" ? item.day : index + 1,
            focus: text(item?.focus, `Preparation focus ${index + 1}`),
            tasks: tasks.length ? tasks : [DEFAULT_TASK],
        };
    });

    padToMin(technicalQuestions, 3, index => normalizeQuestion({}, index, "Technical"));
    padToMin(behavioralQuestions, 3, index => normalizeQuestion({}, index, "Behavioral"));

    if (skillGap.length === 0) {
        skillGap.push({
            skill: "System Design",
            severity: "medium",
            type: "Technical",
        });
    }

    padToMin(preparationPlan, 3, index => ({
        day: index + 1,
        focus: `Preparation focus ${index + 1}`,
        tasks: [DEFAULT_TASK],
    }));

    return {
        ...data,
        jobTitle: text(data.jobTitle, "Unspecified Position"),
        matchScore:
            typeof data.matchScore === "number" && data.matchScore >= 0 && data.matchScore <= 100
                ? data.matchScore
                : 70,
        technicalQuestions,
        behavioralQuestions,
        skillGap,
        preparationPlan,
    };
}

async function generateAiInterviewReport({ jobTitle, resume, jobDescription, selfDescription }) {
    const ai = getAiClient();
const prompt = `You are an expert technical interviewer and career coach with deep knowledge of hiring processes across the tech industry.

## TASK
Analyze the candidate's profile against the job description and generate a comprehensive interview preparation package. Return ONLY valid JSON — no markdown, no code fences, no explanations.

## INPUTS
- Job Title: ${jobTitle}
- Job Description: ${jobDescription}
- Candidate Resume: ${resume}
- Candidate Self-Description: ${selfDescription}

## OUTPUT SCHEMA
Return a single JSON object with this EXACT structure — no additional fields:

{
  "jobTitle": "${jobTitle}",
  "matchScore": <integer 0–100>,

  "technicalQuestions": [
    {
      "question": "<specific, role-relevant technical question>",
      "intention": "<what the interviewer is testing with this question>",
      "answer": "<detailed model answer: explain the concept, walk through the approach, include examples or pseudocode where helpful>"
    }
  ],

  "behavioralQuestions": [
    {
      "question": "<STAR-format behavioral question>",
      "intention": "<what trait or competency this tests>",
      "answer": "<model answer using STAR structure: Situation → Task → Action → Result>"
    }
  ],

  "skillGap": [
    {
      "skill": "<missing or weak skill name>",
      "severity": "low|medium|high",
      "type": "<technical|soft|domain>"
    }
  ],

  "preparationPlan": [
    {
      "day": <number>,
      "focus": "<main theme for the day>",
      "tasks": ["<specific actionable task with time estimate>", ...]
    }
  ]
}

## CONTENT REQUIREMENTS

### matchScore
- Score 0–100 based on overlap of required skills, experience level, domain knowledge, and job title alignment
- Be honest: a junior candidate applying for a senior role should score 30–50, not 80+

### technicalQuestions — generate EXACTLY 12
- Cover: core CS fundamentals, role-specific tools/frameworks, system design (if senior), and at least 2 questions targeting gaps between the resume and job description
- Vary difficulty across easy, medium, and hard
- Answers must be thorough: step-by-step reasoning, real-world context, and inline examples where applicable

### behavioralQuestions — generate EXACTLY 6
- Map each question to one competency: leadership, conflict resolution, ownership, adaptability, communication, or problem-solving
- STAR answers must feel realistic and specific — avoid vague or generic responses

### skillGap
- Identify ALL meaningful gaps between the resume and job description
- Minimum 3 items — include every real gap found
- severity rules:
  - "high"   → required skill is completely missing from the resume
  - "medium" → skill is partially present or mentioned briefly
  - "low"    → skill exists but needs deepening or updating
- type must be one of: "technical", "soft", or "domain"

### preparationPlan
- Length: 7 days if matchScore ≥ 70 | 10 days if matchScore 50–69 | 14 days if matchScore < 50
- Day 1: self-assessment + review job description + identify top 3 weak areas
- Final day: full mock interview simulation + confidence review + rest
- Each day must have 3–5 tasks with realistic time estimates (e.g. "Practice 3 LeetCode medium graph problems (90 min)")
- Structure must build logically: fundamentals → role-specific skills → interview practice → mock rounds

## STRICT OUTPUT RULES
- Start with { and end with } — no text before or after
- Every field in the schema must be present
- No extra fields beyond what is defined in the schema
- All string values must be non-empty
- No trailing commas
- Must be parseable by JSON.parse()`;

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: prompt,
    });

    const parsed = parseAiJson(response.text);
    const data = normalizeInterviewReport(parsed);

    const validated = interviewReportSchema.safeParse(data);
    console.log("FINAL DATA BEFORE VALIDATION:", JSON.stringify(data, null, 2));

    if (!validated.success) {
        console.error("AI validation errors:", validated.error.flatten());
        throw new Error("Invalid AI structure");
    }

    return validated.data;
}


async function generatePdfFromHtml(htmlContent){
    if (typeof htmlContent !== "string" || !htmlContent.trim()) {
        throw new Error("Resume HTML was empty");
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: process.env.NODE_ENV === "production"
            ? ["--no-sandbox", "--disable-setuid-sandbox"]
            : [],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4",margin:{top:"15mm",bottom:"15mm",left:"10mm",right:"10mm"} });
    await browser.close();
    return pdfBuffer;
}

function extractResumeHtml(response) {
    const rawText = typeof response?.text === "string" ? response.text.trim() : "";

    if (rawText.startsWith("<")) {
        return rawText;
    }

    let parsedJson = null;

    try {
        parsedJson = rawText ? JSON.parse(rawText) : null;
    } catch {
        parsedJson = null;
    }

    if (typeof parsedJson?.html === "string" && parsedJson.html.trim()) {
        return parsedJson.html.trim();
    }

    if (typeof parsedJson?.resume_html === "string" && parsedJson.resume_html.trim()) {
        return parsedJson.resume_html.trim();
    }

    if (typeof response?.parsed?.html === "string" && response.parsed.html.trim()) {
        return response.parsed.html.trim();
    }

    if (typeof response?.parsed?.resume_html === "string" && response.parsed.resume_html.trim()) {
        return response.parsed.resume_html.trim();
    }

    throw new Error(`AI did not return valid resume HTML. Raw response: ${rawText || "[empty]"}`);
}

async function generateResumePdf({ jobTitle,resume, jobDescription, selfDescription }) {

  const resumePdfSchema = z.object({
     html: z.string().min(1),
    });




    const ai = getAiClient();

    const prompt =`You are an expert resume writer and career coach specializing in ATS-optimized resumes.

## TASK
Generate a tailored, one-page resume in clean HTML for the candidate below. The output must be valid HTML only — no markdown, no explanations, no code fences.

## INPUTS
- Job Title: ${jobTitle}
- Target Job Description: ${jobDescription}
- Candidate's Existing Resume: ${resume}
- Candidate's Self-Description: ${selfDescription}

## RESUME STRUCTURE (use exactly in this order)
1. **Contact Information** — name, email, phone, LinkedIn/GitHub (if provided)
2. **Professional Summary** — 2–3 sentences tailored to the job; lead with years of experience and top strengths
3. **Technical Skills** — grouped by category (e.g., Languages, Frameworks, Tools); keyword-match the job description
4. **Experience / Projects** — reverse chronological; each entry has: title, company/context, dates, and 2–4 bullet points using strong action verbs + measurable outcomes (e.g., "Reduced load time by 40%")
5. **Education** — degree, institution, graduation year

## HTML & STYLING RULES
- Use semantic tags: <header>, <section>, <h1>, <h2>, <h3>, <ul>, <li>, <p>
- Apply ONLY inline CSS — no <style> blocks, no external libraries, no frameworks
- Font: font-family: Arial, sans-serif; base font-size: 11px; line-height: 1.4
- Margins: keep <body> margin to 20px max on all sides to preserve one-page fit
- Section headers: bold, font-size 13px, border-bottom: 1px solid #333, margin-bottom: 4px
- Color: black text on white background only (ATS-safe)
- NO tables, NO images, NO icons, NO multi-column layouts, NO floats

## ATS OPTIMIZATION RULES
- Mirror exact keywords and phrases from the job description (skills, tools, job titles)
- Avoid headers the ATS won't recognize — use only the section names listed above
- Do not use symbols like ★, ✓, or custom bullet characters — use standard <li> bullets
- Spell out abbreviations at least once (e.g., "Application Programming Interface (API)")

## ONE-PAGE PDF CONSTRAINT
- Total content must fit within a standard A4/Letter page when rendered at 96dpi via Puppeteer
- If content is too long: trim older/less-relevant experience, shorten bullet points, reduce margins
- Never truncate contact info, the summary, or education

## OUTPUT FORMAT
Return ONLY the raw HTML starting with <!DOCTYPE html> and ending with </html>.
Do not include any text before or after the HTML.`;

            
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config:{
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    });

const htmlContent = extractResumeHtml(response);
const validated = resumePdfSchema.safeParse({ html: htmlContent });

if (!validated.success) {
    console.error("Resume PDF validation errors:", validated.error.flatten());
    throw new Error("Invalid resume HTML generated by AI");
}

const pdfBuffer = await generatePdfFromHtml(validated.data.html)

return pdfBuffer;
}

export { generateAiInterviewReport, generateResumePdf };
