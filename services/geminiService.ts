import { GoogleGenAI, Type } from "@google/genai";
// FIX: Corrected import path for types.
import { UserInfo, Suggestion, CoverLetterTone } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

const getApiErrorMessage = (error: any): string => {
  // Check for network connectivity first
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'Network Error: It seems you are offline. Please check your internet connection and try again.';
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('api key not valid')) {
      return 'Invalid API Key: The provided API key is not valid. Please ensure it is configured correctly in your environment.';
    }
    if (message.includes('429') || message.includes('rate limit')) {
      return 'Rate Limit Exceeded: You have sent too many requests in a short period. Please wait a moment before trying again.';
    }
    if (message.includes('content blocked')) {
      return 'Content Blocked: The request was blocked due to safety policies. Please modify your input and try again.';
    }
    if (message.includes('400') || message.includes('bad request')) {
      return 'Invalid Request: The AI service could not process your request. This may be due to a very long input or invalid formatting. Please review your information.';
    }
    if (message.includes('500')) {
      return 'AI Service Error: An unexpected internal error occurred with the AI service. Please try again in a few moments.';
    }
    if (message.includes('503') || message.includes('service unavailable')) {
      return 'AI Service Unavailable: The AI service is currently experiencing high traffic or is temporarily down. Please try again later.';
    }
    if (message.includes('fetcherror') || message.includes('network request failed')) {
      return 'Network Error: A network error occurred while trying to reach the AI service. Please check your connection.';
    }
  }
  
  // Generic fallback
  return 'An unexpected error occurred. Please check the console for more details and try again.';
};


const generateResumePrompt = (userInfo: UserInfo, jobDescription: string): string => {
    const sanitizeHtml = (html: string): string => {
        if (typeof document === 'undefined') return html; // for server-side or non-browser environments
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    const customSectionsText = userInfo.customSections.map(section => `
**${section.title.toUpperCase()}:**
${sanitizeHtml(section.content)}
`).join('');

    const refereesText = userInfo.referees.map(ref => `
  - ${ref.name}, ${ref.title} at ${ref.company} (${ref.email} | ${ref.phone})`).join('');

    let prompt = `**ROLE:** You are an expert career coach and resume writer.
**TASK:** Write a professional resume summary for a candidate applying for a specific job.
**OUTPUT FORMAT:** A single paragraph, 2-4 sentences long.

**INSTRUCTIONS:**
1.  **Analyze the Candidate Profile and Job Description:** Carefully review the provided candidate information and the target job description.
2.  **Identify Key Alignments:** Pinpoint the most critical skills, experiences, and qualifications from the candidate's profile that directly match the top requirements of the job description.
3.  **Incorporate Keywords:** Naturally weave in relevant keywords from the job description.
4.  **Craft a Compelling Narrative:** Synthesize the information into a powerful, concise summary. Start with a strong opening statement that highlights the candidate's core professional identity (e.g., "Results-driven Senior Software Engineer with...").
5.  **Use Action Verbs:** Employ strong, dynamic action verbs to describe accomplishments.
6.  **Maintain a Professional Tone:** The summary should be confident, professional, and tailored. Avoid jargon unless it's industry-standard and present in the job description.
7.  **Do NOT invent information.** Base the summary strictly on the details provided.

---
**CANDIDATE PROFILE:**
- **Name:** ${userInfo.name}
- **Existing Summary (for context):** ${userInfo.summary || 'N/A'}
- **Work Experience:**
${userInfo.experience.map(exp => {
    const yearsText = exp.years ? `, ${exp.years} years` : '';
    return `  - ${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate}${yearsText}): ${exp.description}`;
}).join('\n') || '  - No experience listed.'}
- **Education:**
${userInfo.education.map(edu => `  - ${edu.degree} from ${edu.school} (${edu.startDate} - ${edu.endDate})`).join('\n') || '  - No education listed.'}
- **Skills:** ${userInfo.skills || 'N/A'}
${userInfo.customSections.length > 0 ? `
**Custom Sections:**${customSectionsText}` : ''}
${userInfo.referees.length > 0 ? `
**Referees:**${refereesText}` : ''}

---
**TARGET JOB DESCRIPTION:**
${jobDescription}
---

**GENERATED PROFESSIONAL SUMMARY:**`;
    return prompt;
};

const generateCoverLetterPrompt = (userInfo: UserInfo, jobDescription: string, tone: CoverLetterTone, targetJobTitle: string): string => {
    const sanitizeHtml = (html: string): string => {
        if (typeof document === 'undefined') return html;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    const customSectionsText = userInfo.customSections.map(section => `
**${section.title.toUpperCase()}:**
${sanitizeHtml(section.content)}
`).join('');

    const refereesText = userInfo.referees.map(ref => `
  - ${ref.name}, ${ref.title} at ${ref.company} (${ref.email} | ${ref.phone})`).join('');
    
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let prompt = `**ROLE:** You are an elite career strategist and master storyteller, crafting bespoke cover letters that land interviews.
**TASK:** Write a professional, compelling, and highly personalized cover letter from the candidate to the hiring manager for the specified job.
**OUTPUT FORMAT:** A complete, modern professional cover letter, starting with the date.

**CRITICAL INSTRUCTIONS:**
1.  **START WITH THE DATE:** Begin the letter *directly* with today's date: "${formattedDate}".
2.  **NO HEADER INFO:** Do NOT include the candidate's name, address, or contact information at the top. The application template handles this.
3.  **TONE & STYLE:**
    *   Adopt a **${tone}** tone.
    *   **AVOID CLICHÉS:** Do not use generic phrases like "I am writing to express my interest," "team player," or "I believe I am the ideal candidate."
    *   **BE CONCISE:** The entire letter should be between 250-400 words. Keep paragraphs focused and around 3-5 sentences each.
4.  **STRUCTURE & CONTENT:**
    *   **Salutation:** Address the letter to "Hiring Manager" unless a specific name can be identified within the job description.
    *   **Opening (1st Paragraph):** Create a powerful hook. Immediately connect the candidate's top achievement or core strength to the company's primary need as stated in the job description. Mention the specific role you are applying for, using the "TARGET JOB TITLE" provided.
    *   **Body (1-2 Paragraphs):** This is the core narrative.
        *   **Identify the Company's Problem:** Analyze the job description to understand the key challenge or goal this role is meant to address.
        *   **Present the Candidate as the Solution:** Select 1-2 of the candidate's most relevant experiences or projects. Use the STAR method (Situation, Task, Action, Result) to tell a brief story about how they solved a similar problem.
        *   **QUANTIFY RESULTS:** Wherever possible, use metrics to demonstrate impact (e.g., "increased efficiency by 15%", "managed a $50k budget", "grew user engagement by 25%").
        *   **Company Connection:** Briefly mention something specific about the company that resonates with the candidate (e.g., a specific project, a stated value, or a recent achievement) and tie it to their own motivations.
    *   **Closing (Final Paragraph):** Reiterate excitement with a forward-looking statement. Confidently state how their key skill can directly benefit the company's upcoming challenges or goals. End with a clear, professional call to action, such as "I am eager to discuss how my expertise in [Specific Skill] can contribute to your team's success."
5.  **GROUNDING:** Base the letter STRICTLY on the details provided in the candidate profile and job description. Do NOT invent or exaggerate information.

---
**CANDIDATE PROFILE (for context):**
- **Name:** ${userInfo.name}
- **Existing Summary (for context):** ${userInfo.summary || 'N/A'}
- **Work Experience:**
${userInfo.experience.map(exp => {
    const yearsText = exp.years ? `, ${exp.years} years` : '';
    return `  - ${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate}${yearsText}): ${exp.description}`;
}).join('\n') || '  - No experience listed.'}
- **Education:**
${userInfo.education.map(edu => `  - ${edu.degree} from ${edu.school} (${edu.startDate} - ${edu.endDate})`).join('\n') || '  - No education listed.'}
- **Skills:** ${userInfo.skills || 'N/A'}
${userInfo.customSections.length > 0 ? `
**Custom Sections:**${customSectionsText}` : ''}
${userInfo.referees.length > 0 ? `
**Referees:**${refereesText}` : ''}

---
**TARGET JOB DESCRIPTION:**
${jobDescription}
---
**TARGET JOB TITLE:**
${targetJobTitle || 'The role mentioned in the job description'}
---

**GENERATED COVER LETTER:**`;
    return prompt;
};

export const generateResumeSummary = async (
    userInfo: UserInfo, 
    jobDescription: string
): Promise<string> => {
    try {
        const prompt = generateResumePrompt(userInfo, jobDescription);
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        // FIX: The response object has a `text` property to directly access the generated text.
        return response.text;
    } catch (error) {
        console.error("Error generating resume summary:", error);
        throw new Error(getApiErrorMessage(error));
    }
};

export const generateCoverLetter = async (
    userInfo: UserInfo, 
    jobDescription: string,
    tone: CoverLetterTone,
    targetJobTitle: string
): Promise<string> => {
    try {
        const prompt = generateCoverLetterPrompt(userInfo, jobDescription, tone, targetJobTitle);
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        // FIX: The response object has a `text` property to directly access the generated text.
        return response.text;
    } catch (error) {
        console.error("Error generating cover letter:", error);
        throw new Error(getApiErrorMessage(error));
    }
};

const proofreadSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            originalText: {
                type: Type.STRING,
                description: 'The exact text segment from the original input that contains the error.',
            },
            suggestion: {
                type: Type.STRING,
                description: 'The corrected version of the text segment.',
            },
            explanation: {
                type: Type.STRING,
                description: 'A brief, user-friendly explanation of why the change was suggested (e.g., "Spelling error", "Grammar correction").',
            },
            startIndex: {
                type: Type.INTEGER,
                description: 'The starting character index of the originalText in the full input text.',
            },
            endIndex: {
                type: Type.INTEGER,
                description: 'The ending character index (exclusive) of the originalText in the full input text.',
            },
        },
        required: ['originalText', 'suggestion', 'explanation', 'startIndex', 'endIndex'],
    },
};

const generateProofreadPrompt = (text: string): string => {
    return `**ROLE:** You are an expert English proofreader and editor.
**TASK:** Analyze the following text for grammatical errors, spelling mistakes, punctuation issues, and awkward phrasing.
**OUTPUT FORMAT:** Respond with a JSON array of suggestion objects that strictly adheres to the provided schema.

**CRITICAL INSTRUCTIONS:**
1.  **Identify All Errors:** Be comprehensive in your analysis.
2.  **Provide Clear Suggestions:** Offer direct replacements for the incorrect text.
3.  **Explain the Rationale:** Briefly explain each correction.
4.  **Accurate Indexing:** The \`startIndex\` and \`endIndex\` MUST correspond exactly to the slice of the original text. \`text.slice(startIndex, endIndex)\` must equal \`originalText\`.
5.  **No Commentary:** Do not add any introductory text, explanations, or summaries outside of the JSON structure. Your entire output must be the JSON array itself.
6.  **Empty Array for No Errors:** If you find no errors, return an empty array: \`[]\`.

---
**TEXT TO PROOFREAD:**
${text}
---

**JSON OUTPUT:`;
};

export const proofreadText = async (
    text: string
): Promise<Suggestion[]> => {
    if (!text || text.trim() === '') {
        return [];
    }
    try {
        const prompt = generateProofreadPrompt(text);
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: proofreadSchema,
            },
        });
        
        // FIX: The response object has a `text` property to directly access the generated text.
        const jsonStr = response.text.trim();
        const suggestions = JSON.parse(jsonStr);

        // Add a unique ID to each suggestion for React keys
        return suggestions.map((s: any, index: number) => ({ ...s, id: `${s.startIndex}-${index}` }));
    } catch (error) {
        console.error("Error proofreading text:", error);
        throw new Error(getApiErrorMessage(error));
    }
};

const keywordsSchema = {
    type: Type.OBJECT,
    properties: {
      keywords: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: "A single important skill or keyword, such as 'Project Management' or 'React.js'."
        },
      },
    },
    required: ['keywords'],
};

export const extractKeywordsFromJobDescription = async (
    jobDescription: string
): Promise<string[]> => {
    if (!jobDescription.trim()) return [];
    try {
        const prompt = `**ROLE:** You are an expert recruiter and talent analyst.
**TASK:** Analyze the following job description and extract the top 8 most important hard skills (e.g., software, technical abilities) and soft skills (e.g., communication, leadership).
**OUTPUT FORMAT:** Respond with a JSON object containing a "keywords" array of strings. Do not include any explanation or introductory text.

---
**JOB DESCRIPTION TO ANALYZE:**
${jobDescription}
---

**JSON OUTPUT:**`;
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: keywordsSchema,
            },
        });
        
        // FIX: The response object has a `text` property to directly access the generated text.
        const result = JSON.parse(response.text);
        return result.keywords || [];
    } catch (error) {
        console.error("Error extracting keywords:", error);
        throw new Error(getApiErrorMessage(error));
    }
};

const improveDescriptionSchema = {
    type: Type.OBJECT,
    properties: {
      suggestions: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: "An improved, achievement-oriented version of the work description."
        },
      },
    },
    required: ['suggestions'],
};

export const improveWorkDescription = async (
    description: string, 
    role: string, 
    company: string
): Promise<string[]> => {
    if (!description.trim()) return [];
    try {
        const prompt = `**ROLE:** You are an expert resume writer and career coach.
**TASK:** Rewrite the following work experience description to be more powerful and achievement-oriented. Provide 2-3 alternative suggestions.
**OUTPUT FORMAT:** Respond with a JSON object containing a "suggestions" array of strings. Do not include any explanation or introductory text.

**INSTRUCTIONS:**
1.  **Use Strong Action Verbs:** Start bullet points with verbs like "Orchestrated," "Engineered," "Maximized," "Implemented."
2.  **Quantify Achievements:** Incorporate metrics and numbers wherever possible. (e.g., "Increased sales by 20%," "Reduced server costs by $5k/month"). If no numbers are provided, suggest places where they could be added.
3.  **Focus on Impact:** Emphasize the results and value brought to the company, not just the daily duties.
4.  **Use the STAR Method (Situation, Task, Action, Result):** Frame the description around this structure implicitly.

---
**CONTEXT:**
- **Company:** ${company}
- **Role:** ${role}

**ORIGINAL DESCRIPTION TO IMPROVE:**
${description}
---

**JSON OUTPUT:**`;
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: improveDescriptionSchema,
            },
        });
        // FIX: The response object has a `text` property to directly access the generated text.
        const result = JSON.parse(response.text);
        return result.suggestions || [];
    } catch (error) {
        console.error("Error improving work description:", error);
        throw new Error(getApiErrorMessage(error));
    }
};

const skillsSchema = {
    type: Type.OBJECT,
    properties: {
      skills: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: "A single relevant skill."
        },
      },
    },
    required: ['skills'],
};

export const suggestSkills = async (
    userInfo: UserInfo, 
    jobDescription: string
): Promise<string[]> => {
    if (!jobDescription.trim()) return [];
    try {
        const prompt = `**ROLE:** You are an expert career coach and talent analyst.
**TASK:** Based on the candidate's existing experience and the target job description, suggest 5-10 additional relevant skills they might have but haven't listed. Focus on both technical (hard) and interpersonal (soft) skills that bridge the gap between their profile and the job requirements.
**OUTPUT FORMAT:** Respond with a JSON object containing a "skills" array of strings. Do not include any explanation or introductory text. Do not suggest skills that are already listed.

---
**CANDIDATE PROFILE:**
- **Role/Experience:**
${userInfo.experience.map(exp => `  - ${exp.role} at ${exp.company}: ${exp.description}`).join('\n')}
- **Listed Skills:** ${userInfo.skills}

---
**TARGET JOB DESCRIPTION:**
${jobDescription}
---

**JSON OUTPUT:**`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: skillsSchema,
            },
        });
        // FIX: The response object has a `text` property to directly access the generated text.
        const result = JSON.parse(response.text);
        return result.skills || [];
    } catch (error) {
        console.error("Error suggesting skills:", error);
        throw new Error(getApiErrorMessage(error));
    }
};