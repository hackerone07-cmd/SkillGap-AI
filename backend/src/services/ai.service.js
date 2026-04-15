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

    const prompt = `
Return ONLY valid JSON with the following structure:

{
  "jobTitle": "${jobTitle}",
  "matchScore": <number 0-100>,
  "technicalQuestions": [{ "question", "intention", "answer" }, ...],
  "behavioralQuestions": [{ "question", "intention", "answer" }, ...],
  "skillGap": [{ "skill", "severity": "low|medium|high", "type" }, ...],
  "preparationPlan": [{ "day": <number>, "focus", "tasks": [<string>, ...] }, ...]
}

REQUIREMENTS:
- Include EXACTLY the jobTitle: "${jobTitle}"
- matchScore must be a number between 0 and 100
- Return at least 10 technicalQuestions, 5 behavioralQuestions, 1 skillGap item, and 7 preparationPlan items
- Do NOT return arrays of strings; each item must be a proper object
- All string values must be non-empty

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Resume: ${resume}
Self Description: ${selfDescription}
`;

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

    const browser = await puppeteer.launch();
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

    const prompt = `
Generate a resume for the candidate in html format based on the following information. Focus on highlighting the candidate's strengths and tailoring the content to the job description.

Return ONLY the HTML content of the resume without any additional text or explanations.

Job Title: ${jobTitle}
Resume: ${resume}
Job Description: ${jobDescription}
Self Description: ${selfDescription}
You are an expert career assistant. Your task is to generate a concise, ATS-friendly one-page resume in clean HTML format make it one page only . Follow these guidelines:

- Tailor the resume to align with the job description while preserving the users authentic experience and skills.
- Highlight the most relevant technical skills, projects, and achievements.
- Use clear section headers: Contact Information, Summary, Skills, Projects/Experience, Education.
- Keep formatting simple and professional: semantic HTML tags (<header>, <section>, <ul>, <li>, <p>).
- Apply minimal inline CSS for spacing, font size, and bold headers (no external libraries).
- Ensure the resume fits on one page when converted to PDF.
- Optimize for ATS parsing (no tables, images, or complex layouts).
- Output only valid HTML code, ready for conversion into PDF via Puppeteer.

            `;

            
    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
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
