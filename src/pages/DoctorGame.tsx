import React, { useState, useEffect } from "react";
import "./doctor.css";

// 🗂️ Modular dialogue data
const dialogues = [
  {
    id: 1,
    prompt: "I take ibuprofen almost every day for my joint pain.",
    good: "Pain relief matters, but daily ibuprofen can strain your kidneys — let’s explore safer options.",
    bad: "Ibuprofen is effective for many people, so continuing daily may seem reasonable.",
    image: "patient1.png",
  },
  {
    id: 2,
    prompt: "I usually skip breakfast and just drink coffee.",
    good: "Coffee alone isn’t harmful, but skipping meals can stress your body and kidneys.",
    bad: "Plenty of people skip breakfast, so it probably won’t make a difference.",
    image: "patient2.png",
  },
  {
    id: 3,
    prompt: "I drink energy drinks every afternoon to stay focused.",
    good: "Energy drinks can be tough on kidneys — let’s find a safer way to stay alert.",
    bad: "If they keep you focused, having one daily seems fine.",
    image: "patient3.png",
  },
  {
    id: 4,
    prompt: "I eat instant noodles almost every day — they’re cheap and easy.",
    good: "They’re convenient, but processed foods like noodles are high in sodium and can strain kidneys.",
    bad: "Many busy people rely on instant noodles, so it’s understandable to keep eating them.",
    image: "patient4.png",
  },
  {
    id: 5,
    prompt: "I don't drink much water — I just forget.",
    good: "Kidneys need steady hydration — setting a reminder could help you drink enough.",
    bad: "If you don’t feel thirsty, it might not seem important to drink more.",
    image: "patient5.png",
  },
  {
    id: 6,
    prompt:
      "I take herbal supplements every day. They're natural, so they must be safe.",
    good: "Some herbs can be harmful to kidneys, even if they’re natural — it’s worth reviewing them.",
    bad: "Because they’re natural, most people assume they’re completely safe.",
    image: "patient6.png",
  },
  {
    id: 7,
    prompt: "I haven't had a checkup in years. I feel fine though.",
    good: "Kidney issues are often silent — regular checkups can catch problems early.",
    bad: "If you feel healthy, skipping checkups might not feel risky.",
    image: "patient7.png",
  },
  {
    id: 8,
    prompt:
      "I eat a lot of salty snacks while gaming — chips, jerky, that kind of stuff.",
    good: "Salty snacks taste great, but too much salt over time can damage kidneys.",
    bad: "Snacking while gaming is normal, so it may not feel like a health concern.",
    image: "patient8.png",
  },
  {
    id: 9,
    prompt: "I get fast food for lunch most days. It's quick and convenient.",
    good: "Fast food is quick, but the high sodium and fat can stress kidneys long-term.",
    bad: "Since it’s convenient, many people assume it’s okay to eat often.",
    image: "patient9.png",
  },
  {
    id: 10,
    prompt:
      "I take a painkiller after every workout. My muscles hurt otherwise.",
    good: "Regular painkiller use can affect kidneys — let’s find safer recovery options.",
    bad: "Pain after workouts is common, so taking something daily might feel normal.",
    image: "patient10.png",
  },
  {
    id: 11,
    prompt: "It takes me a long time to fall asleep.",
    good: "Poor sleep can strain your kidneys — improving sleep habits could help overall health.",
    bad: "Lots of people have trouble sleeping, so it may not seem like a big issue.",
    image: "patient11.png",
  },
  {
    id: 12,
    prompt: "I eat red meat almost every day.",
    good: "Too much red meat can overwork kidneys — mixing in other proteins could help.",
    bad: "Red meat is a common staple, so eating it every day doesn’t always feel risky.",
    image: "patient12.png",
  },
];

const KidneyDialogueGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [shuffledChoices, setShuffledChoices] = useState<
    { text: string; isGood: boolean }[]
  >([]);

  const current = dialogues[currentIndex];

  // Shuffle good/bad choices whenever patient changes
  useEffect(() => {
    const choices = [
      { text: current.good, isGood: true },
      { text: current.bad, isGood: false },
    ];
    setShuffledChoices(choices.sort(() => Math.random() - 0.5));
  }, [currentIndex]);

  const handleChoice = (isGood: boolean, index: number) => {
    const delta = isGood ? 10 : -10;
    setScore((prev) => prev + delta);
    setFeedback(
      isGood ? "✅ Good choice!" : "⚠️ That could harm kidney health.",
    );
    setClickedIndex(index);

    setTimeout(() => {
      setFeedback("");
      setClickedIndex(null);
      setCurrentIndex((prev) => (prev + 1 < dialogues.length ? prev + 1 : 0));
    }, 1500);
  };

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
        <p className="score-text">
          <strong>Score:</strong> {score}
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
      </div>
    </div>
  );
};

export default KidneyDialogueGame;
