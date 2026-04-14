import dotenv from "dotenv";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

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
        model: "gemini-3-flash-preview",
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

export default generateAiInterviewReport;
