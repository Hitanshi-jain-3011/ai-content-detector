export const initialHistoryData = [
  {
    id: "scan-001",
    type: "Text",
    preview: "Artificial intelligence has rapidly transformed the educational landscape, offering students automated writing assistants...",
    fileName: "Essay_Intro_Draft.txt",
    aiProbability: 88,
    status: "high",
    date: "2026-09-17 19:30",
    details: {
      wordCount: 342,
      perplexity: 18.4,
      burstiness: 12.1,
      summary: "High concentration of uniform sentence lengths and repetitive transition phrases typical of LLM output."
    }
  },
  {
    id: "scan-002",
    type: "PDF",
    preview: "Quarterly Financial Analysis & Future Market Trends Q3 2026.pdf",
    fileName: "Quarterly_Financial_Report.pdf",
    aiProbability: 14,
    status: "low",
    date: "2026-09-17 18:15",
    details: {
      fileSize: "1.8 MB",
      pageCount: 12,
      summary: "Predominantly human-authored narrative with rich domain-specific idioms and varied sentence structures."
    }
  },
  {
    id: "scan-003",
    type: "Image",
    preview: "portrait_cyberpunk_neon_city.png",
    fileName: "portrait_cyberpunk_neon_city.png",
    aiProbability: 95,
    status: "high",
    date: "2026-09-17 16:45",
    details: {
      dimensions: "1024 x 1024",
      fileSize: "2.4 MB",
      summary: "Diffusion artifact clusters detected around high-frequency facial boundaries and specular highlights."
    }
  },
  {
    id: "scan-004",
    type: "DOCX",
    preview: "Literature Review on Quantum Machine Learning Algorithms.docx",
    fileName: "Literature_Review_Quantum.docx",
    aiProbability: 54,
    status: "medium",
    date: "2026-09-16 22:10",
    details: {
      fileSize: "450 KB",
      pageCount: 6,
      summary: "Mixed patterns detected. Introduction and abstract show synthetic hallmarks while methodology appears authored by a researcher."
    }
  },
  {
    id: "scan-005",
    type: "Text",
    preview: "I remember waking up on that brisk October morning with the scent of pine needles drifting through the cabin window...",
    fileName: "Personal_Memoir_Draft.txt",
    aiProbability: 6,
    status: "low",
    date: "2026-09-16 14:02",
    details: {
      wordCount: 520,
      perplexity: 89.2,
      burstiness: 47.6,
      summary: "Organic human syntax characterized by high burstiness, personal anecdotes, and natural stylistic idiosyncrasies."
    }
  }
];
