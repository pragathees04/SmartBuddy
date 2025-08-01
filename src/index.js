import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import LandingPage from "./components/LandingPage";
import QuizPage from "./components/QuizPage";
import QuizCompletePage from "./components/QuizCompletePage";
import ConceptGapAnalysisPage from "./components/ConceptGapAnalysisPage";
import StudyPathPage from "./components/StudyPathPage"; // ✅ import added

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/assistant" element={<App />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/quiz-complete" element={<QuizCompletePage />} />
      <Route path="/gap-analysis" element={<ConceptGapAnalysisPage />} />
      <Route path="/study-path" element={<StudyPathPage />} /> {/* ✅ new route */}
    </Routes>
  </BrowserRouter>
);
