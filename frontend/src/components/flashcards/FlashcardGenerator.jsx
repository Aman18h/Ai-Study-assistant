import { useState } from "react";

const cards = [
  {
    id: 1,
    question: "What is virtual memory?",
    answer:
      "Virtual memory is a memory management technique that allows a computer to use secondary storage as an extension of RAM.",
  },
  {
    id: 2,
    question: "What is paging?",
    answer:
      "Paging divides logical memory into fixed-size pages and physical memory into fixed-size frames.",
  },
  {
    id: 3,
    question: "What is a page fault?",
    answer:
      "A page fault occurs when a process accesses a page that is not currently present in physical memory.",
  },
  {
    id: 4,
    question: "What is a TLB?",
    answer:
      "The Translation Lookaside Buffer stores recently used page-table entries to make address translation faster.",
  },
  {
    id: 5,
    question: "What is demand paging?",
    answer:
      "Demand paging loads a page into physical memory only when the process actually needs it.",
  },
];

function FlashcardGenerator({ document, onExit }) {
  const [numberOfCards, setNumberOfCards] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const selectedCards = cards.slice(
    0,
    Math.min(numberOfCards, cards.length)
  );

  const currentCard = selectedCards[currentIndex];

  const handleGenerate = () => {
    console.log("GENERATE CLICKED");

    setCurrentIndex(0);
    setFlipped(false);
    setStarted(true);
  };

  const nextCard = () => {
    if (currentIndex < selectedCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFlipped(false);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setFlipped(false);
    }
  };

  if (started) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <button
          onClick={() => setStarted(false)}
          className="mb-6 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
        >
          ← Back to generator
        </button>

        <h1 className="text-3xl font-semibold text-[var(--ink)]">
          Flashcards 🃏
        </h1>

        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Card {currentIndex + 1} of {selectedCards.length}
        </p>

        <button
          onClick={() => setFlipped((prev) => !prev)}
          className="mt-8 min-h-[320px] w-full rounded-2xl border border-[var(--line)] bg-white p-10 text-left shadow-sm transition hover:shadow-md"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-soft)]">
            {flipped ? "Answer" : "Question"}
          </span>

          <div className="flex min-h-[220px] items-center justify-center text-center">
            <p className="text-xl font-medium leading-relaxed text-[var(--ink)]">
              {flipped ? currentCard.answer : currentCard.question}
            </p>
          </div>

          <p className="text-center text-xs text-[var(--ink-soft)]">
            Click the card to{" "}
            {flipped ? "see the question" : "reveal the answer"}
          </p>
        </button>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={previousCard}
            disabled={currentIndex === 0}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm disabled:opacity-30"
          >
            ← Previous
          </button>

          <span className="text-sm text-[var(--ink-soft)]">
            {Math.round(
              ((currentIndex + 1) / selectedCards.length) * 100
            )}
            %
          </span>

          <button
            onClick={nextCard}
            disabled={currentIndex === selectedCards.length - 1}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8">
        <button
          onClick={onExit}
          className="mb-6 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
        >
          ← Back to chat
        </button>

        <div className="mb-3 text-4xl">🃏</div>

        <h1 className="text-3xl font-semibold text-[var(--ink)]">
          Generate Flashcards
        </h1>

        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Turn your study material into interactive flashcards.
        </p>

        <p className="mt-4 rounded-lg bg-black/[0.03] px-4 py-3 text-sm text-[var(--ink-soft)]">
          Document:{" "}
          <span className="font-medium text-[var(--ink)]">
            {document?.title}
          </span>
        </p>
      </div>

      <div className="space-y-6 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--ink)]">
            Number of cards
          </label>

          <select
            value={numberOfCards}
            onChange={(e) => setNumberOfCards(Number(e.target.value))}
            className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
          >
            <option value={5}>5 cards</option>
            <option value={10}>10 cards</option>
            <option value={15}>15 cards</option>
            <option value={20}>20 cards</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--ink)]">
            Difficulty
          </label>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white hover:bg-[var(--accent-strong)]"
        >
          ✨ Generate Flashcards
        </button>
      </div>
    </div>
  );
}

export default FlashcardGenerator;
