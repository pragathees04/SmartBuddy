import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landingpage.css';
import robotGif from './Anima Bot.gif';

function LandingPage() {
  const navigate = useNavigate();
  const [animateOut, setAnimateOut] = useState(false);

  const handleStart = () => {
    setAnimateOut(true);
    setTimeout(() => {
      navigate('/assistant');
    }, 1000); // Match duration with CSS animation
  };

  return (
    <div className="landing-container">
      <img
        src={robotGif}
        alt="Robot animation"
        className={`robot-animation ${animateOut ? 'bounce-out' : ''}`}
      />
      <h1>Welcome to SmartBuddy</h1>
      <p>Your intelligent note summarizer and quiz assistant.</p>
      <button onClick={handleStart}>Get Started</button>
    </div>
  );
}

export default LandingPage;
