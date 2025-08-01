import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ConceptGapAnalysisPage.css"; // Keep your existing styles

export default function ConceptGapAnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { weakConcepts = [], score = 0, total = 0 } = location.state || {};
  const [studyPaths, setStudyPaths] = useState([]);
  const [studyPathCreated, setStudyPathCreated] = useState(false);

  // Capitalize weak topics
  const capitalizedWeakConcepts = weakConcepts.map((topic) => {
    return topic.charAt(0).toUpperCase() + topic.slice(1);
  });

  // ✅ Save weak topics to localStorage for StudyPathPage
  useEffect(() => {
    const weakTopicCounts = capitalizedWeakConcepts.reduce((acc, topic) => {
      acc[topic] = 1; // You can increase this value based on how often user failed
      return acc;
    }, {});
    localStorage.setItem("weakTopics", JSON.stringify(weakTopicCounts));
  }, [capitalizedWeakConcepts]);

  // Fetch study resources from backend
  const fetchStudyResources = async () => {
    try {
      const response = await axios.post("http://localhost:4000/api/get-study-resources", {
        topics: capitalizedWeakConcepts,
      });
      setStudyPaths(response.data);
      setStudyPathCreated(true);
    } catch (error) {
      console.error("Error fetching study resources:", error);
    }
  };

  // Route to Study Path page with full resource data
  const routeToStudyPath = () => {
    navigate("/study-path", { state: { studyPaths } });
  };

  return (
    <div className="concept-gap-analysis-container">
      <h1>Concept Gap Analysis</h1>
      <p>Your weak areas have been identified. Would you like to create a study path for any of them?</p>

      {capitalizedWeakConcepts.length === 0 ? (
        <p>No weak areas identified. Great job!</p>
      ) : (
        <div>
          <h3>Weak Areas:</h3>
          <ul>
            {capitalizedWeakConcepts.map((topic, index) => (
              <li key={index}>{topic}</li>
            ))}
          </ul>
        </div>
      )}

      <p>Your score: {score} / {total}</p>

      {!studyPathCreated && (
        <button onClick={fetchStudyResources}>Create Study Path</button>
      )}

      <button onClick={() => navigate("/quiz-complete")}>Back to Quiz Results</button>

      <button onClick={routeToStudyPath}>Go to Study Path</button>

      {studyPathCreated && studyPaths.length > 0 && (
        <div>
          <h3>Your Personalized Study Path:</h3>
          {studyPaths.map((studyPath, index) => (
            <div key={index} className="study-path">
              <h4>{studyPath.topic} Study Path:</h4>
              <ul>
                {studyPath.resources.map((resource, idx) => (
                  <li key={idx}>{resource}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
