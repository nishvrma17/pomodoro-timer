import React, { useState, useEffect } from 'react';
import './App.css';
import pomodoroSound from './sounds/pomodoro-end.mp3';
import breakSound from './sounds/break-end.mp3';

const CircularProgress = ({ percentage, timeDisplay }) => {
  const radius = 80;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="progress-ring">
      <circle
        stroke="#eee"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#27ae60"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="progress-ring__circle"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="26px"
        fill="#2c3e50"
      >
        {timeDisplay}
      </text>
    </svg>
  );
};

const App = () => {
  const [customPomodoro, setCustomPomodoro] = useState(25);
  const [customShortBreak, setCustomShortBreak] = useState(5);
  const [customLongBreak, setCustomLongBreak] = useState(30);

  const [mode, setMode] = useState('Pomodoro');
  const [timeLeft, setTimeLeft] = useState(customPomodoro * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  const pomodoroAudio = new Audio(pomodoroSound);
  const breakAudio = new Audio(breakSound);

  useEffect(() => {
    let timer;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }

    if (isRunning && timeLeft === 0) {
      handleSessionEnd();
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleSessionEnd = () => {
    if (mode === 'Pomodoro') {
      pomodoroAudio.play();
      const nextCycle = cycleCount + 1;
      setCycleCount(nextCycle);
      if (nextCycle % 4 === 0) {
        startNewSession('Long Break');
      } else {
        startNewSession('Short Break');
      }
    } else {
      breakAudio.play();
      startNewSession('Pomodoro');
    }
  };

  const startNewSession = (newMode) => {
    if (newMode === 'Pomodoro') setTimeLeft(customPomodoro * 60);
    if (newMode === 'Short Break') setTimeLeft(customShortBreak * 60);
    if (newMode === 'Long Break') setTimeLeft(customLongBreak * 60);
    setMode(newMode);
    setIsRunning(true); // <- this line auto-starts the next timer
  };
  

  const handleStartPause = () => setIsRunning((prev) => !prev);
  const handleReset = () => {
    setIsRunning(false);
    setCycleCount(0);
    setMode('Pomodoro');
    setTimeLeft(customPomodoro * 60);
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress =
    mode === 'Pomodoro'
      ? ((customPomodoro * 60 - timeLeft) / (customPomodoro * 60)) * 100
      : mode === 'Short Break'
      ? ((customShortBreak * 60 - timeLeft) / (customShortBreak * 60)) * 100
      : ((customLongBreak * 60 - timeLeft) / (customLongBreak * 60)) * 100;

  return (
    <div className="App">
      <h1>{mode}</h1>
      <CircularProgress percentage={progress} timeDisplay={formatTime(timeLeft)} />
      <p>Pomodoro Sessions Completed: {cycleCount % 4}</p>

      <div className="buttons">
        <button onClick={handleStartPause}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>

      <div className="settings">
        <h3>Settings</h3>
        <label>
          Pomodoro (min):
          <input
            type="number"
            value={customPomodoro}
            onChange={(e) => setCustomPomodoro(Number(e.target.value))}
          />
        </label>
        <label>
          Short Break (min):
          <input
            type="number"
            value={customShortBreak}
            onChange={(e) => setCustomShortBreak(Number(e.target.value))}
          />
        </label>
        <label>
          Long Break (min):
          <input
            type="number"
            value={customLongBreak}
            onChange={(e) => setCustomLongBreak(Number(e.target.value))}
          />
        </label>
        <button
          onClick={() => {
            setIsRunning(false);
            setMode('Pomodoro');
            setCycleCount(0);
            setTimeLeft(customPomodoro * 60);
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default App;
