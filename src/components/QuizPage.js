import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./QuizPage.css";
import axios from "axios";

export default function QuizPage() {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("quizRaw");
    if (!raw) {
      navigate("/assistant");
      return;
    }
    parseQuiz(raw);
  }, [navigate]);

  const parseQuiz = async (raw) => {
    const lines = raw.split("\n").map(line => line.trim()).filter(Boolean);
    const parsed = [];
    let currentQuestion = null;

    for (const line of lines) {
      if (/^\d+\./.test(line)) {
        if (
          currentQuestion &&
          currentQuestion.question &&
          currentQuestion.options.length >= 2 &&
          currentQuestion.correctIndex !== null
        ) {
          parsed.push(currentQuestion);
        }

        const topic = await classifyTopic(line);
        currentQuestion = {
          question: line.replace(/^\d+\.\s*/, ""),
          topic,
          options: [],
          correctIndex: null,
        };
      } else if (/^[a-dA-D]\)/.test(line)) {
        currentQuestion?.options.push(line.replace(/^[a-dA-D]\)\s*/, ""));
      } else if (/^Answer:/i.test(line)) {
        const match = line.match(/^Answer:\s*([a-dA-D])/);
        if (match) {
          currentQuestion.correctIndex = match[1].toLowerCase().charCodeAt(0) - 97;
        }
      }
    }

    if (
      currentQuestion &&
      currentQuestion.question &&
      currentQuestion.options.length >= 2 &&
      currentQuestion.correctIndex !== null
    ) {
      parsed.push(currentQuestion);
    }

    setQuiz(parsed);
    setLoading(false);
  };

  const classifyTopic = async (questionText) => {
    try {
      const response = await axios.post("http://localhost:4000/api/classify-topic", {
        question: questionText,
      });
      return response.data.topic;
    } catch (error) {
      console.error("Error classifying topic:", error);
      return "General Knowledge";
    }
  };

  const handleAnswer = (qIndex, oIndex) => {
    if (userAnswers[qIndex] !== undefined) return;

    const isCorrect = quiz[qIndex].correctIndex === oIndex;
    const updatedAnswers = { ...userAnswers, [qIndex]: oIndex };
    setUserAnswers(updatedAnswers);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (Object.keys(updatedAnswers).length === quiz.length) {
      const finalScore = Object.entries(updatedAnswers).reduce((acc, [i, answer]) => {
        return acc + (quiz[i].correctIndex === answer ? 1 : 0);
      }, 0);

      setTimeout(() => {
        axios
          .post("http://localhost:4000/api/analyze-weak-topics", {
            answers: updatedAnswers,
            quiz,
          })
          .then((response) => {
            const weakConcepts = response.data.weakTopics.map((topic) => {
              return topic.charAt(0).toUpperCase() + topic.slice(1);
            });

            navigate("/gap-analysis", {
              state: {
                weakConcepts,
                score: finalScore,
                total: quiz.length,
              },
            });
          })
          .catch((error) => {
            console.error("Error analyzing weak topics:", error);
          });
      }, 1000);
    }
  };

  if (loading) {
    return <div className="loading">Loading quiz...</div>;
  }

  return (
    <div className="quiz-page">
      <h1>🧠 Quiz Time</h1>
      <p>Score: {score} / {quiz.length}</p>

      {quiz.map((q, qIndex) => (
        <div className="quiz-question" key={qIndex}>
          <p><strong>Q{qIndex + 1}. {q.question}</strong></p>
          <ul className="options-list">
            {q.options.map((opt, oIndex) => {
              const selected = userAnswers[qIndex] === oIndex;
              const correct = q.correctIndex === oIndex;
              let className = "";

              if (userAnswers[qIndex] !== undefined) {
                if (selected && correct) className = "correct";
                else if (selected) className = "wrong";
                else if (correct) className = "correct";
              }

              return (
                <li
                  key={oIndex}
                  className={className}
                  onClick={() => handleAnswer(qIndex, oIndex)}
                >
                  {opt}
                </li>
              );
            })}
          </ul>

          {userAnswers[qIndex] !== undefined && (
            <p className="result-msg">
              {userAnswers[qIndex] === q.correctIndex
                ? "✅ Correct!"
                : `❌ Wrong. Correct: ${q.options[q.correctIndex]}`}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
