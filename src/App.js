import React, { useState } from "react";
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
    localStorage.removeItem("quizRaw");
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("✅ Reset complete!", { className: "custom-toast" });
  };

  // ✨ Format summary with headings + bullets
  const renderStructuredSummary = () => {
    const blocks = summary
      .split(/\n(?=\w.+?:)/) // match lines like "Title:", "Plot:" etc
      .map((b) => b.trim())
      .filter(Boolean);

    return (
      <div style={{ lineHeight: "1.6" }}>
        {blocks.map((block, i) => {
          const lines = block.split("\n").filter(Boolean);
          const heading = lines[0].replace(/:$/, "");
          const bullets = lines.slice(1);

          return (
            <div key={i} style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ color: "#ab71ff", marginBottom: "0.5rem" }}>{heading}</h4>
              <ul style={{ paddingLeft: "1.5rem" }}>
                {bullets.map((point, idx) => (
                  <li key={idx} style={{ marginBottom: "0.4rem" }}>
                    {point.replace(/^[-•]\s/, "")}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
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
            {renderStructuredSummary()}
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default SmartBuddyHome;