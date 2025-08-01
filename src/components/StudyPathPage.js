import React, { useState, useEffect } from "react";
import "./StudyPathPage.css";

const roadmapLibrary = {
  Programming: [
    "Practice 5 LeetCode easy problems",
    "Read 2 GeeksforGeeks articles on data structures",
    "Watch a YouTube crash course on algorithms",
    "Write 3 functions in your preferred language",
    "Take a mock coding interview"
  ],
  Maths: [
    "Review key formulas",
    "Solve 10 practice problems",
    "Watch a concept video on YouTube",
    "Read examples on BYJU’s or Khan Academy",
    "Take a short quiz"
  ],
  Aptitude: [
    "Solve 5 logical reasoning puzzles",
    "Practice ratio/proportion questions",
    "Take a mock aptitude test",
    "Review formulas and shortcuts",
    "Analyze your mistakes"
  ],
  communication: [
    "Practice public speaking for 5 mins",
    "Record and listen to yourself reading",
    "Review grammar basics",
    "Watch TED Talks for tone & clarity",
    "Do 1 mock interview"
  ],
  general: [
    "Read top 5 news headlines today",
    "Watch an explainer video on current affairs",
    "Revise general knowledge quiz",
    "Study one historic topic",
    "Explore a cultural documentary"
  ],
  education: [
    "Review classroom notes",
    "Watch a pedagogy video",
    "Summarize a recent topic",
    "Attempt a sample teaching plan",
    "Self-assess your learning methods"
  ]
};

const StudyPathPage = () => {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("weakTopics")) || {};
    const initialTopics = Object.keys(stored).map((topic) => ({
      name: topic,
      steps: roadmapLibrary[topic] || ["Review basics", "Practice problems", "Take quiz"],
      completed: new Array((roadmapLibrary[topic] || []).length).fill(false),
    }));
    setTopics(initialTopics);
  }, []);

  const toggleStep = (topicIndex, stepIndex) => {
    setTopics((prev) =>
      prev.map((topic, i) =>
        i === topicIndex
          ? {
              ...topic,
              completed: topic.completed.map((c, j) => (j === stepIndex ? !c : c)),
            }
          : topic
      )
    );
  };

  const removeTopic = (index) => {
    setTopics((prev) => prev.filter((_, i) => i !== index));
  };

  const addTopic = () => {
    if (!newTopic.trim()) return;
    setTopics((prev) => [
      ...prev,
      {
        name: newTopic,
        steps: roadmapLibrary[newTopic] || ["Review basics", "Practice problems", "Take quiz"],
        completed: new Array(3).fill(false),
      },
    ]);
    setNewTopic("");
  };

  return (
    <div className="study-path-page">
      <h1>🧠 Your Study Roadmap</h1>

      {topics.map((topic, i) => (
        <div key={i} className="topic-card">
          <div className="topic-header">
            <h2>{topic.name}</h2>
            <button className="remove-btn" onClick={() => removeTopic(i)}>🗑 Remove</button>
          </div>
          <ul>
            {topic.steps.map((step, j) => (
              <li key={j}>
                <label>
                  <input
                    type="checkbox"
                    checked={topic.completed[j]}
                    onChange={() => toggleStep(i, j)}
                  />
                  <span className={topic.completed[j] ? "checked" : ""}>{step}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="add-topic-form">
        <input
          type="text"
          placeholder="Add a new topic..."
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
        />
        <button onClick={addTopic}>➕ Add Topic</button>
      </div>
    </div>
  );
};

export default StudyPathPage;
