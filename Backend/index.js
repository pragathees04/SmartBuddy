import axios from 'axios';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Topic keyword classification
const topicKeywords = {
  Maths: ["probability", "math", "average", "percentage", "ratio", "logical", "reasoning", "series", "train", "speed", "distance", "equation"],
  Aptitude: ["problem", "logical", "pattern", "puzzle", "sequence", "train", "ratio", "speed", "percentage", "mathematical", "time", "distance", "work"],
  Programming: ["code", "algorithm", "variable", "loop", "function", "OOP", "Python", "Java", "API", "compile", "debug", "class", "object", "JavaScript"],
  communication: ["email", "language", "verbal", "nonverbal", "tone", "clarity", "expression", "communication", "team", "presentation", "listening", "interpersonal", "public speaking"],
  general: ["history", "geography", "science", "politics", "culture", "general", "knowledge", "current affairs", "events"],
  education: ["learning", "school", "teacher", "student", "curriculum", "study", "exam", "subject", "classroom", "pedagogy"],
};

function detectTopic(questionText) {
  const lowerText = questionText.toLowerCase();
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) return topic;
    }
  }
  return "general";
}

// 🧠 Summarize Notes
app.post('/api/summarize', async (req, res) => {
  const { notes } = req.body;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-sonnet-20240229',
        messages: [{ role: 'user', content: `Short Summary:\n${notes}` }],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Student-AI-Hackathon-App',
        },
      }
    );

    const summary = response.data.choices[0].message.content;
    res.json({ summary });
  } catch (error) {
    console.error('OpenRouter API error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate summary.' });
  }
});

// 📝 Generate Quiz
app.post('/api/generate-quiz', async (req, res) => {
  const { notes } = req.body;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-sonnet-20240229',
        messages: [
          {
            role: 'user',
            content: `Generate a quiz based on the following notes. Provide questions with multiple-choice options. Include the correct answer at the end of each question using the format: "Answer: a".

Notes:
${notes}

Format:
1. Sample question?
   a) Option 1
   b) Option 2
   c) Option 3
   d) Option 4
Answer: b

Only provide the quiz text.`,
          },
        ],
        max_tokens: 700,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Student-AI-Hackathon-App',
        },
      }
    );

    const rawQuiz = response.data.choices[0].message.content;
    res.json({ quizRaw: rawQuiz });
  } catch (error) {
    console.error('OpenRouter API error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate quiz.' });
  }
});

// 📊 Analyze Weak Topics
app.post('/api/analyze-weak-topics', (req, res) => {
  const { answers, quiz } = req.body;

  const topicStats = {};
  quiz.forEach((question, index) => {
    const topic = question.topic;
    const isWrong = answers[index] !== question.correctIndex;

    if (!topicStats[topic]) {
      topicStats[topic] = { wrongAnswers: 0, totalAnswers: 0 };
    }

    topicStats[topic].totalAnswers += 1;
    if (isWrong) topicStats[topic].wrongAnswers += 1;
  });

  const weakTopics = Object.entries(topicStats)
    .filter(([_, stats]) => (stats.wrongAnswers / stats.totalAnswers) * 100 > 60)
    .map(([topic]) => topic);

  res.json({ weakTopics });
});

// 🧠 Classify Topic by Keywords
app.post('/api/classify-topic', (req, res) => {
  const { question } = req.body;
  const topic = detectTopic(question);
  res.json({ topic });
});

// 🚀 NEW: Study Resources Generator for StudyPathPage
app.post('/api/get-study-resources', (req, res) => {
  const { topics } = req.body;

  const roadmapLibrary = {
    Programming: [
      "Solve 5 LeetCode easy problems",
      "Watch a crash course on algorithms (YouTube)",
      "Revise basic OOP concepts (inheritance, polymorphism)",
      "Build a small project (e.g., calculator app)",
      "Read 2 GeeksforGeeks articles on data structures",
    ],
    Maths: [
      "Revise key formulas (algebra, geometry)",
      "Solve 10 questions from RS Aggarwal",
      "Watch Khan Academy video on current topic",
      "Attempt 1 mock test",
    ],
    Aptitude: [
      "Solve logical reasoning puzzles",
      "Practice speed-distance-time problems",
      "Use Indiabix or SSS aptitude practice sets",
      "Watch quick tip videos for shortcuts",
    ],
    communication: [
      "Record yourself explaining a topic in 1 min",
      "Watch a TED Talk and take notes",
      "Practice active listening for 10 mins/day",
      "Write and review a formal email draft",
    ],
    general: [
      "Read top 5 current affairs of the day",
      "Watch an explainer video (e.g., UN, climate, tech)",
      "Take a GK quiz online",
    ],
    education: [
      "Review your recent class notes",
      "Make 5 flashcards on hard concepts",
      "Teach a concept to a peer or yourself",
    ],
  };

  const studyPaths = topics.map((topic) => ({
    topic,
    resources: roadmapLibrary[topic] || [
      "Review basics from textbooks",
      "Search YouTube for explanation videos",
      "Take a practice quiz",
    ],
  }));

  res.json(studyPaths);
});

// ✅ Start Server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
