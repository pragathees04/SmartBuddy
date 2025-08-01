import React, { useState, useEffect } from "react";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function SmartBuddyHome() {
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedSummary = localStorage.getItem("summary");
    if (savedSummary) setSummary(savedSummary);
  }, []);

  useEffect(() => {
    summary
      ? localStorage.setItem("summary", summary)
      : localStorage.removeItem("summary");
  }, [summary]);

  const handleSummarize = async () => {
    if (!notes.trim()) {
      toast.error("⚠ Please enter some notes first!", {
        className: "custom-toast",
      });
      return;
    }

    try {
      setIsSummarizing(true);
      toast.info("⏳ Generating summary...", {
        className: "custom-toast",
      });

      const response = await fetch("http://localhost:4000/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();
      setIsSummarizing(false);

      if (data.summary) {
        setSummary(data.summary);
        toast.success("✅ Summary generated!", {
          className: "custom-toast",
        });
      } else {
        toast.error("❌ Failed to get summary.", {
          className: "custom-toast",
        });
      }
    } catch (err) {
      console.error(err);
      setIsSummarizing(false);
      toast.error("⚠ Backend error.", { className: "custom-toast" });
    }
  };

  const handleQuiz = async () => {
    if (!notes.trim()) {
      toast.error("⚠ Please enter some notes first!", {
        className: "custom-toast",
      });
      return;
    }

    try {
      setIsGeneratingQuiz(true);
      toast.info("⏳ Generating quiz...", {
        className: "custom-toast",
      });

      const response = await fetch("http://localhost:4000/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();
      setIsGeneratingQuiz(false);

      if (data.quizRaw) {
        localStorage.setItem("quizRaw", data.quizRaw);
        toast.success("✅ Quiz generated!", {
          className: "custom-toast",
        });
        navigate("/quiz");
      } else {
        toast.error("❌ Failed to get quiz.", {
          className: "custom-toast",
        });
      }
    } catch (err) {
      console.error(err);
      setIsGeneratingQuiz(false);
      toast.error("⚠ Backend error.", { className: "custom-toast" });
    }
  };

  const handleClear = () => {
    setNotes("");
    setSummary("");
    localStorage.removeItem("summary");
    localStorage.removeItem("quizRaw");
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("✅ Reset complete!", { className: "custom-toast" });
  };

  // 👉 Render summary as intro + bullets
  const renderBulletSummary = () => {
    const lines = summary
      .split(/[\n•-]/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) return null;

    const firstLine = lines[0];
    const bullets = lines.slice(1);

    return (
      <>
        <p style={{ fontWeight: "600", marginBottom: "0.75rem" }}>{firstLine}</p>
        <ul style={{ paddingLeft: "1.5rem" }}>
          {bullets.map((point, index) => (
            <li key={index} style={{ marginBottom: "0.5rem" }}>
              {point}
            </li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <div className="App">
      <div className="content-wrapper">
        <h1>📚 SmartBuddy</h1>

        <textarea
          rows="10"
          placeholder="Paste your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="button-group">
          <button onClick={handleSummarize} disabled={isSummarizing}>
            {isSummarizing ? "Summarizing..." : "Summarize"}
          </button>
          <button onClick={handleQuiz} disabled={isGeneratingQuiz}>
            {isGeneratingQuiz ? "Generating Quiz..." : "Generate Quiz"}
          </button>
          <button onClick={handleClear}>Clear All</button>
        </div>

        {summary && (
          <div className="section-box">
            <h2>📄 Summary</h2>
            {renderBulletSummary()}
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default SmartBuddyHome;
