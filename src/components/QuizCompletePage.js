import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./QuizCompletePage.css";
const QuizCompletePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { score = 0, total = 0 } = location.state || {};

  const handleBack = () => {
    navigate("/"); // Navigate to the Home page
  };

  const handleViewGapAnalysis = () => {
    navigate("/gap-analysis", {
      state: {
        score,
        total,
      }
    }); // Navigate to Concept Gap Analysis page
  };

  return (
    <div className="quiz-complete-page">
      <h1>🎉 Quiz Completed!</h1>
      <p>
        You scored <strong>{score}</strong> out of <strong>{total}</strong>
      </p>

      <button onClick={handleBack}>Go Back to Home</button>
      <button onClick={handleViewGapAnalysis}>View Concept Gap Analysis</button>
    </div>
  );
};

export default QuizCompletePage;
