import dotenv from "dotenv";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import puppeteer from "puppeteer";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ApiError } from "../utils/ApiError.js";


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

function parseJsonString(value) {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();

    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
        return null;
    }

    try {
        return JSON.parse(trimmed);
    } catch {
        return null;
    }
}

function extractNestedErrorDetails(error) {
    const parsedMessage = parseJsonString(error?.message);
    const providerError = parsedMessage?.error ?? error?.error ?? error;

    return {
        code: providerError?.code ?? error?.statusCode,
        status: providerError?.status ?? error?.status,
        message: providerError?.message ?? error?.message,
    };
}

function normalizeAiProviderError(error, actionLabel = "complete this request") {
    const details = extractNestedErrorDetails(error);
    const combinedText = `${details.status || ""} ${details.message || ""}`.toLowerCase();

    const isBusyError =
        details.code === 429 ||
        details.code === 503 ||
        combinedText.includes("unavailable") ||
        combinedText.includes("high demand") ||
        combinedText.includes("busy") ||
        combinedText.includes("temporarily") ||
        combinedText.includes("resource exhausted");

    if (isBusyError) {
        throw new ApiError(
            503,
            `The AI assistant is a little busy right now, so we couldn't ${actionLabel}. Please try again in a moment.`
        );
    }

    throw new ApiError(
        500,
        `We couldn't ${actionLabel} right now. Please try again shortly.`
    );
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

    try {
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
    } catch (error) {
        normalizeAiProviderError(error, "generate your interview plan");
    }
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

    const prompt =`You are a professional resume writer with 15+ years of experience crafting ATS-optimized resumes that pass automated screening and impress human recruiters.

## TASK
Generate a tailored, one-page resume in clean HTML for the candidate below.
Output must be valid HTML only — no markdown, no explanations, no code fences, no commentary.

## INPUTS
- Job Title: ${jobTitle}
- Target Job Description: ${jobDescription}
- Candidate's Existing Resume: ${resume}
- Candidate's Self-Description: ${selfDescription}

## RESUME STRUCTURE (follow this order exactly)
1. Contact Information — full name, email, phone, LinkedIn URL, GitHub URL (only include what is provided)
2. Professional Summary — 2–3 sentences; open with years of experience + top 2 strengths; close with value proposition tied directly to the job title
3. Technical Skills — grouped by category (Languages, Frameworks, Tools, Databases, Cloud, etc.); include every keyword from the job description that the candidate legitimately has
4. Work Experience / Projects — reverse chronological; for each entry include: job title, company name, location, start–end dates (Month YYYY), and 2–4 bullet points
5. Education — degree name, major, institution, graduation year (Month YYYY)

## LANGUAGE & GRAMMAR RULES  ← fixes Spelling & Grammar issues
- Use American English spelling throughout (e.g. "optimized" not "optimised")
- Every sentence must be grammatically complete and correctly punctuated
- Bullet points must NOT end with a period — keep them parallel in structure
- Use past tense for all previous roles; use present tense only for current role
- Proofread mentally: no double spaces, no orphaned commas, no broken phrases
- Never use first-person pronouns (I, me, my, we) anywhere in the resume

## REPETITION RULES  ← fixes Repetition issue
- Each action verb may appear AT MOST ONCE across all bullet points — vary verbs throughout
- Do not repeat the same skill, tool, or technology in both the Skills section and bullet points unless it adds essential context
- Do not use the same sentence structure more than twice in a row across bullet points
- Banned overused words: "responsible for", "worked on", "helped", "assisted", "utilized", "leveraged" — replace with specific action verbs (built, architected, reduced, automated, shipped, integrated, etc.)

## ATS PARSE RATE RULES  ← fixes ATS Parse Rate issue
- Use ONLY standard section labels: "Contact Information", "Professional Summary", "Technical Skills", "Work Experience", "Education"
- All text must be in standard HTML text nodes — no text inside CSS, attributes, or pseudo-elements
- No special Unicode characters, smart quotes (" "), em dashes (—), or non-ASCII symbols — use plain ASCII only (", -, |)
- Do not embed text in background-image, content CSS properties, or aria-label attributes
- Every <a> href must be a valid, complete URL if links are included

## TAILORING RULES  ← fixes Tailoring score
- Extract the top 8–10 required skills/tools from the job description and ensure ALL of them appear verbatim in the resume (in Skills section or bullet points) if the candidate has them
- Match the seniority language of the job description (e.g. if it says "lead", use "led" in bullets)
- The Professional Summary must mention the exact job title: ${jobTitle}
- At least 3 bullet points across Work Experience must directly reflect responsibilities listed in the job description
- If the job description emphasizes a specific domain (e.g. fintech, healthcare, e-commerce), reflect that domain context in the summary or bullets

## QUANTIFICATION RULES
- At least 50% of bullet points must include a measurable result: percentage, time saved, users served, revenue impact, performance improvement, team size, etc.
- Format numbers consistently: use % for percentages, use K/M for large numbers (e.g. "10K users", "$2M pipeline")
- If the candidate's resume lacks metrics, infer reasonable estimates based on context — do not fabricate specifics, but frame scope (e.g. "across a team of 5 engineers" or "serving 50K+ monthly users")

## HTML & STYLING RULES
- Semantic tags only: <header>, <section>, <h1>, <h2>, <h3>, <ul>, <li>, <p>, <span>, <strong>
- Inline CSS only — no <style> blocks, no <link> tags, no external libraries
- font-family: Arial, sans-serif | base font-size: 11px | line-height: 1.4 | color: #000
- <body> margin: 18px | padding: 0 | background: #fff
- Section <h2>: font-size: 13px | font-weight: bold | border-bottom: 1px solid #333 | margin: 8px 0 4px 0 | text-transform: uppercase | letter-spacing: 0.5px
- Bullet <li>: margin: 2px 0 | padding-left: 4px
- NO tables, NO images, NO SVG, NO icons, NO floats, NO flexbox, NO grid, NO multi-column layouts
- NO <br> tags for spacing — use margin instead

## ONE-PAGE CONSTRAINT
- Content must fit a standard A4 page (794px × 1123px) at 96dpi when rendered by Puppeteer
- If content is too long: remove roles older than 10 years, trim bullets to 1 line each, reduce section spacing to margin: 4px 0
- Never cut: name, contact details, summary, or education

## FINAL SELF-CHECK (apply before outputting)
Before writing the HTML, mentally verify:
1. All job description keywords are present ✓
2. No action verb is repeated more than once ✓
3. No spelling errors or grammatical mistakes ✓
4. At least half the bullets have a quantified result ✓
5. No special characters or non-ASCII symbols ✓
6. Section headers match ATS-standard names exactly ✓

## OUTPUT FORMAT
Return ONLY raw HTML starting with <!DOCTYPE html> and ending with </html>.
Absolutely no text, comment, or character before <!DOCTYPE or after </html>.`;

            
    let response;

    try {
        response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config:{
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(resumePdfSchema),
            }
        });
    } catch (error) {
        normalizeAiProviderError(error, "generate the resume PDF");
    }

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
