// KidneyDialogueGame.tsx
import React, { useState, useEffect } from "react";
import "./doctor.css";

// 🗂 Dialogue data for 12 patients
const dialogues = [
  {
    id: 1,
    prompt: "I take ibuprofen almost every day for my joint pain.",
    good: "Pain relief matters, but daily ibuprofen can strain your kidneys — let’s explore safer options.",
    bad: "Ibuprofen is effective for many people, so continuing daily may seem reasonable.",
    badExplanation:
      "Daily ibuprofen use can strain your kidneys over time, even if it relieves pain.",
    image: "patient1.png",
    bloodTest: {
      creatinine: "1.3 mg/dL",
      bun: "22 mg/dL",
      na: "138 mmol/L",
      k: "4.8 mmol/L",
      gfr: "75 mL/min/1.73m²",
    },
  },
  {
    id: 2,
    prompt: "I usually skip breakfast and just drink coffee.",
    good: "Coffee alone isn’t harmful, but skipping meals can stress your body and kidneys.",
    bad: "Plenty of people skip breakfast, so it probably won’t make a difference.",
    badExplanation:
      "Skipping meals regularly can stress your body and kidneys, even if caffeine keeps you awake.",
    image: "patient2.png",
    bloodTest: {
      creatinine: "1.0 mg/dL",
      bun: "18 mg/dL",
      na: "140 mmol/L",
      k: "4.2 mmol/L",
      gfr: "90 mL/min/1.73m²",
    },
  },
  {
    id: 13,
    prompt:
      "I’ve been feeling tired and my ankles are swollen. I want to get a blood test to check my kidneys.",
    good: "Your blood test shows your kidneys are struggling — it’s important we address this promptly.",
    bad: "Your results look fine, so there’s probably nothing to worry about.",
    badExplanation:
      "In reality, the results indicate impaired kidney function. Ignoring them could delay treatment and worsen your condition.",
    image: "patient13.png",
    bloodTest: {
      creatinine: "2.1 mg/dL", // high
      bun: "35 mg/dL", // high
      na: "146 mmol/L", // slightly high
      k: "5.6 mmol/L", // high
      gfr: "45 mL/min/1.73m²", // low, indicates stage 3 CKD
    },
  },
  {
    id: 3,
    prompt: "I drink energy drinks every afternoon to stay focused.",
    good: "Energy drinks can be tough on kidneys — let’s find a safer way to stay alert.",
    bad: "If they keep you focused, having one daily seems fine.",
    badExplanation:
      "Energy drinks contain high levels of sugar and additives that can negatively affect kidney function.",
    image: "patient3.png",
    bloodTest: {
      creatinine: "1.1 mg/dL",
      bun: "19 mg/dL",
      na: "142 mmol/L",
      k: "4.5 mmol/L",
      gfr: "85 mL/min/1.73m²",
    },
  },
  {
    id: 14,
    prompt:
      "I feel a bit tired lately, and my doctor suggested I check my kidney function with a blood test.",
    good: "Your blood test shows your kidneys are healthy — just keep up good habits to maintain them.",
    bad: "There might be something wrong with your kidneys — you should worry.",
    badExplanation:
      "The blood test actually shows normal kidney function. Assuming something is wrong could cause unnecessary anxiety.",
    image: "patient14.png",
    bloodTest: {
      creatinine: "0.9 mg/dL", // normal
      bun: "14 mg/dL", // normal
      na: "140 mmol/L", // normal
      k: "4.5 mmol/L", // normal
      gfr: "95 mL/min/1.73m²", // normal
    },
  },
  {
    id: 4,
    prompt: "I eat instant noodles almost every day — they’re cheap and easy.",
    good: "They’re convenient, but processed foods like noodles are high in sodium and can strain kidneys.",
    bad: "Many busy people rely on instant noodles, so it’s understandable to keep eating them.",
    badExplanation:
      "Processed foods like instant noodles are high in sodium, which can increase kidney workload.",
    image: "patient4.png",
    bloodTest: {
      creatinine: "1.2 mg/dL",
      bun: "21 mg/dL",
      na: "144 mmol/L",
      k: "4.6 mmol/L",
      gfr: "80 mL/min/1.73m²",
    },
  },
  {
    id: 5,
    prompt: "I don't drink much water — I just forget.",
    good: "Kidneys need steady hydration — setting a reminder could help you drink enough.",
    bad: "If you don’t feel thirsty, it might not seem important to drink more.",
    badExplanation:
      "Dehydration can reduce kidney efficiency and increase the risk of kidney stones over time.",
    image: "patient5.png",
    bloodTest: {
      creatinine: "1.4 mg/dL",
      bun: "24 mg/dL",
      na: "137 mmol/L",
      k: "4.9 mmol/L",
      gfr: "70 mL/min/1.73m²",
    },
  },
  {
    id: 6,
    prompt:
      "I take herbal supplements every day. They're natural, so they must be safe.",
    good: "Some herbs can be harmful to kidneys, even if they’re natural — it’s worth reviewing them.",
    bad: "Because they’re natural, most people assume they’re completely safe.",
    badExplanation:
      "Some herbal supplements may contain compounds that are toxic to kidneys, even if they’re natural.",
    image: "patient6.png",
    bloodTest: {
      creatinine: "1.0 mg/dL",
      bun: "17 mg/dL",
      na: "139 mmol/L",
      k: "4.3 mmol/L",
      gfr: "92 mL/min/1.73m²",
    },
  },
  {
    id: 7,
    prompt: "I haven't had a checkup in years. I feel fine though.",
    good: "Kidney issues are often silent — regular checkups can catch problems early.",
    bad: "If you feel healthy, skipping checkups might not feel risky.",
    badExplanation:
      "Kidney problems often develop silently; skipping checkups can delay detection and treatment.",
    image: "patient7.png",
    bloodTest: {
      creatinine: "1.3 mg/dL",
      bun: "23 mg/dL",
      na: "141 mmol/L",
      k: "4.7 mmol/L",
      gfr: "78 mL/min/1.73m²",
    },
  },
  {
    id: 8,
    prompt:
      "I eat a lot of salty snacks while gaming — chips, jerky, that kind of stuff.",
    good: "Salty snacks taste great, but too much salt over time can damage kidneys.",
    bad: "Snacking while gaming is normal, so it may not feel like a health concern.",
    badExplanation:
      "Excessive salt can raise blood pressure and overwork the kidneys, increasing the risk of damage.",
    image: "patient8.png",
    bloodTest: {
      creatinine: "1.1 mg/dL",
      bun: "20 mg/dL",
      na: "145 mmol/L",
      k: "4.4 mmol/L",
      gfr: "82 mL/min/1.73m²",
    },
  },
  {
    id: 9,
    prompt: "I get fast food for lunch most days. It's quick and convenient.",
    good: "Fast food is quick, but the high sodium and fat can stress kidneys long-term.",
    bad: "Since it’s convenient, many people assume it’s okay to eat often.",
    badExplanation:
      "Frequent fast food is high in sodium and unhealthy fats, which can gradually impair kidney function.",
    image: "patient9.png",
    bloodTest: {
      creatinine: "1.2 mg/dL",
      bun: "22 mg/dL",
      na: "143 mmol/L",
      k: "4.5 mmol/L",
      gfr: "79 mL/min/1.73m²",
    },
  },
  {
    id: 10,
    prompt:
      "I take a painkiller after every workout. My muscles hurt otherwise.",
    good: "Regular painkiller use can affect kidneys — let’s find safer recovery options.",
    bad: "Pain after workouts is common, so taking something daily might feel normal.",
    badExplanation:
      "Regular use of painkillers can harm kidney function, even if it reduces soreness temporarily.",
    image: "patient10.png",
    bloodTest: {
      creatinine: "1.3 mg/dL",
      bun: "21 mg/dL",
      na: "138 mmol/L",
      k: "4.8 mmol/L",
      gfr: "77 mL/min/1.73m²",
    },
  },
  {
    id: 11,
    prompt: "It takes me a long time to fall asleep.",
    good: "Poor sleep can strain your kidneys — improving sleep habits could help overall health.",
    bad: "Lots of people have trouble sleeping, so it may not seem like a big issue.",
    badExplanation:
      "Poor sleep affects overall health, including kidney function, and can worsen over time.",
    image: "patient11.png",
    bloodTest: {
      creatinine: "1.0 mg/dL",
      bun: "18 mg/dL",
      na: "140 mmol/L",
      k: "4.2 mmol/L",
      gfr: "90 mL/min/1.73m²",
    },
  },
  {
    id: 12,
    prompt: "I eat red meat almost every day.",
    good: "Too much red meat can overwork kidneys — mixing in other proteins could help.",
    bad: "Red meat is a common staple, so eating it every day doesn’t always feel risky.",
    badExplanation:
      "Consuming too much red meat increases protein load on the kidneys, which can be harmful over time.",
    image: "patient12.png",
    bloodTest: {
      creatinine: "1.4 mg/dL",
      bun: "24 mg/dL",
      na: "137 mmol/L",
      k: "4.9 mmol/L",
      gfr: "72 mL/min/1.73m²",
    },
  },
];

// Guidebook
const guidebook = [
  {
    title: "Sleep & Kidney Health",
    content:
      "Poor sleep affects overall health, including kidney function, and can worsen over time.",
  },
  {
    title: "Hydration",
    content:
      "Adequate water intake is essential. Dehydration reduces kidney efficiency and increases the risk of stones.",
  },
  {
    title: "Red Meat Consumption",
    content:
      "Eating too much red meat increases protein load on kidneys, which can be harmful if consumed daily.",
  },
  {
    title: "Energy Drinks",
    content:
      "Energy drinks are high in sugar and additives, which can negatively affect kidney function if consumed daily.",
  },
  {
    title: "Fast Food",
    content:
      "Frequent fast food is high in sodium and unhealthy fats, which can impair kidney function gradually.",
  },
  {
    title: "Painkillers & Kidney Health",
    content:
      "Daily use of NSAIDs like ibuprofen can strain kidneys. Consider safer alternatives such as acetaminophen or topical treatments.",
  },
  {
    title: "Salt & Snacks",
    content:
      "Excessive salt intake can raise blood pressure and overwork the kidneys, increasing risk of damage.",
  },
  {
    title: "Processed & Instant Foods",
    content:
      "Instant noodles and other processed foods are high in sodium, which increases kidney workload over time.",
  },
  {
    title: "Skipping Meals",
    content:
      "Regularly skipping meals can stress your body and kidneys. Maintaining a balanced diet supports kidney function.",
  },
  {
    title: "Herbal Supplements",
    content:
      "Some herbal supplements may contain compounds that are toxic to kidneys, even if they’re natural.",
  },
  {
    title: "Regular Checkups",
    content:
      "Kidney problems often develop silently. Regular checkups help catch issues early.",
  },
  {
    title: "Painkillers After Workouts",
    content:
      "Regular use of painkillers can harm kidney function, even if it reduces muscle soreness temporarily.",
  },
];

// Blood test normal ranges
const bloodGuidelines = {
  creatinine: "0.6 - 1.2 mg/dL",
  bun: "7 - 20 mg/dL",
  na: "135 - 145 mmol/L",
  k: "3.5 - 5.0 mmol/L",
  gfr: ">90 mL/min/1.73m²",
};

const KidneyDialogueGame: React.FC = () => {
  const [lives, setLives] = useState(2); // ❤️ 2 kidneys
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [shuffledChoices, setShuffledChoices] = useState<
    { text: string; isGood: boolean }[]
  >([]);
  const [showGuidebook, setShowGuidebook] = useState(false);
  const [showBloodTest, setShowBloodTest] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const current = dialogues[currentIndex];

  // Shuffle good/bad choices
  useEffect(() => {
    if (!gameOver && !gameWon) {
      const choices = [
        { text: current.good, isGood: true },
        { text: current.bad, isGood: false },
      ];
      setShuffledChoices(choices.sort(() => Math.random() - 0.5));
    }
  }, [currentIndex, gameOver, gameWon]);

  const handleChoice = (isGood: boolean, index: number) => {
    if (gameOver || gameWon) return;

    setFeedback(isGood ? "✅ Good choice!" : current.badExplanation);
    setClickedIndex(index);

    if (!isGood) {
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
        }
        return newLives;
      });
    }

    setTimeout(() => {
      if (!gameOver && lives > 0) {
        setFeedback("");
        setClickedIndex(null);

        if (currentIndex + 1 < dialogues.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setGameWon(true); // ✅ Reached the end
        }

        setShowBloodTest(false);
      }
    }, 2500);
  };

  const restartGame = () => {
    setLives(2);
    setCurrentIndex(0);
    setFeedback("");
    setClickedIndex(null);
    setShowGuidebook(false);
    setShowBloodTest(false);
    setGameOver(false);
    setGameWon(false);
  };

  // 🛑 Game Over Screen
  if (gameOver) {
    return (
      <div className="game-over-screen">
        <h1>💀 Game Over!</h1>
        <p>You couldn’t instruct properly...</p>
        <button onClick={restartGame}>🔄 Play Again</button>
      </div>
    );
  }

  // 🎉 Win Screen
  if (gameWon) {
    return (
      <div className="game-win-screen">
        <h1>🎉 You Win!</h1>
        <p>You managed to give proper instructions to patients!</p>
        <p>
          Remaining Lifeline: {"🩺".repeat(lives)}
          {"💔".repeat(2 - lives)}
        </p>
        <button onClick={restartGame}>🔄 Play Again</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <img src="room.png" alt="Room" className="room-bg" />
      <div className="patient-layer">
        <img
          src={current.image}
          alt="Patient"
          className="patient-img"
          style={{
            position: "relative",
            width: "400px",
            height: "auto",
            left: "-20px",
            top: "120px",
            transform: "scale(1)",
          }}
        />
      </div>

      <div className="dialogue-box">
        {/* ❤️ Lives Display */}
        <p className="lives-text">
          Lifeline: {"🩺".repeat(lives)} {"💔".repeat(2 - lives)}
        </p>

        <div className="response-buttons">
          {shuffledChoices.map((choice, idx) => (
            <div key={idx} className="button-with-feedback">
              <button onClick={() => handleChoice(choice.isGood, idx)}>
                {choice.text}
              </button>
              {clickedIndex === idx && feedback && (
                <span className="inline-feedback">{feedback}</span>
              )}
            </div>
          ))}
        </div>

        <div className="tools-panel">
          <button
            className="tool-button"
            onClick={() => setShowGuidebook(!showGuidebook)}
          >
            📖 Guidebook
          </button>
          <button
            className="tool-button"
            onClick={() => setShowBloodTest(!showBloodTest)}
          >
            🧪 Blood Test
          </button>
        </div>

        {showGuidebook && (
          <div className="guidebook-panel">
            <h2>📖 Kidney Health Guidebook</h2>
            <ul>
              {guidebook.map((entry, i) => (
                <li key={i}>
                  <strong>{entry.title}:</strong> {entry.content}
                </li>
              ))}
            </ul>
          </div>
        )}

        {showBloodTest && (
          <div className="guidebook-panel">
            <h2>🧪 Blood Test Result</h2>
            <p>
              <strong>Acceptable Range:</strong> <br />
              Creatinine {bloodGuidelines.creatinine} <br />
              BUN {bloodGuidelines.bun}
              <br /> Na {bloodGuidelines.na} <br /> K {bloodGuidelines.k} <br />{" "}
              GFR {bloodGuidelines.gfr}
            </p>
            <ul>
              <br />
              <strong>Test Result:</strong> <br />
              Creatinine: {current.bloodTest.creatinine}
              <br />
              BUN: {current.bloodTest.bun}
              <br />
              Na: {current.bloodTest.na}
              <br />
              K: {current.bloodTest.k}
              <br />
              GFR: {current.bloodTest.gfr}
              <br />
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default KidneyDialogueGame;
