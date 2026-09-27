import { useEffect, useState } from "react";
import {
    generateFlashcards,
    getFlashcards,
} from "../../services/api";

function FlashcardGenerator({ document, onExit }) {
    const documentId = document?.id;

    const [numberOfCards, setNumberOfCards] = useState(5);
    const [difficulty, setDifficulty] = useState("medium");

    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    const [loading, setLoading] = useState(false);
    const [loadingExisting, setLoadingExisting] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadCards = async () => {
            // IMPORTANT:
            // Completely reset state whenever the document changes.
            setCards([]);
            setCurrentIndex(0);
            setFlipped(false);
            setError("");
            setLoadingExisting(true);

            if (!documentId) {
                setLoadingExisting(false);
                return;
            }

            try {
                const response = await getFlashcards(documentId);

                if (cancelled) return;

                const returnedDocumentId =
                    response.data?.flashcards?.[0]?.document;

                const loadedCards =
                    response.data?.flashcards || [];

                // Safety check: never display cards belonging
                // to another document.
                const cardsForThisDocument = loadedCards.filter(
                    (card) =>
                        Number(card.document) === Number(documentId)
                );

                // If the API somehow returns cards for another
                // document, reject them instead of displaying them.
                if (
                    returnedDocumentId !== undefined &&
                    Number(returnedDocumentId) !== Number(documentId)
                ) {
                    setCards([]);
                    setError(
                        "Flashcards returned for the wrong document."
                    );
                    return;
                }

                setCards(cardsForThisDocument);
            } catch (err) {
                if (cancelled) return;

                console.error(
                    "Failed to load flashcards:",
                    err
                );

                setError(
                    err.response?.data?.error ||
                    "Could not load flashcards."
                );
            } finally {
                if (!cancelled) {
                    setLoadingExisting(false);
                }
            }
        };

        loadCards();

        return () => {
            cancelled = true;
        };
    }, [documentId]);

    const handleGenerate = async () => {
        if (!documentId) {
            setError("No document selected.");
            return;
        }

        setLoading(true);
        setError("");

        // Clear old cards immediately.
        setCards([]);
        setCurrentIndex(0);
        setFlipped(false);

        try {
            const response = await generateFlashcards(
                documentId,
                numberOfCards,
                difficulty
            );

            const generatedCards =
                response.data?.flashcards || [];

            const cardsForThisDocument = generatedCards.filter(
                (card) =>
                    Number(card.document) === Number(documentId)
            );

            if (!cardsForThisDocument.length) {
                throw new Error(
                    "No flashcards were generated for this document."
                );
            }

            setCards(cardsForThisDocument);
            setCurrentIndex(0);
            setFlipped(false);
        } catch (err) {
            console.error(
                "Flashcard generation failed:",
                err
            );

            setError(
                err.response?.data?.details ||
                err.response?.data?.error ||
                err.message ||
                "Failed to generate flashcards."
            );
        } finally {
            setLoading(false);
        }
    };

    const currentCard = cards[currentIndex];

    const nextCard = () => {
        if (currentIndex < cards.length - 1) {
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

    const startNewGeneration = () => {
        setCards([]);
        setCurrentIndex(0);
        setFlipped(false);
        setError("");
    };

    if (loadingExisting) {
        return (
            <div className="mx-auto max-w-2xl px-6 py-12">
                <button
                    onClick={onExit}
                    className="mb-6 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
                >
                    ← Back to chat
                </button>

                <div className="rounded-2xl border border-[var(--line)] bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-[var(--ink-soft)]">
                        Loading flashcards...
                    </p>
                </div>
            </div>
        );
    }

    if (cards.length > 0 && currentCard) {
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
                        Flashcards
                    </h1>

                    <p className="mt-2 text-sm text-[var(--ink-soft)]">
                        {document?.title}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <p className="mb-3 text-sm text-[var(--ink-soft)]">
                    Card {currentIndex + 1} of {cards.length}
                </p>

                <button
                    onClick={() => setFlipped((prev) => !prev)}
                    className="min-h-[320px] w-full rounded-2xl border border-[var(--line)] bg-white p-10 text-left shadow-sm transition hover:shadow-md"
                >
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-soft)]">
                        {flipped ? "Answer" : "Question"}
                    </span>

                    <div className="flex min-h-[220px] items-center justify-center text-center">
                        <p className="text-xl font-medium leading-relaxed text-[var(--ink)]">
                            {flipped
                                ? currentCard.answer
                                : currentCard.question}
                        </p>
                    </div>

                    <p className="text-center text-xs text-[var(--ink-soft)]">
                        Click the card to{" "}
                        {flipped
                            ? "see the question"
                            : "reveal the answer"}
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
                            ((currentIndex + 1) /
                                cards.length) *
                                100
                        )}
                        %
                    </span>

                    <button
                        onClick={nextCard}
                        disabled={
                            currentIndex === cards.length - 1
                        }
                        className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm disabled:opacity-30"
                    >
                        Next →
                    </button>
                </div>

                <button
                    onClick={startNewGeneration}
                    className="mt-8 w-full rounded-lg border border-[var(--line)] px-4 py-3 text-sm text-[var(--ink)] hover:bg-black/[0.03]"
                >
                    Generate Another Set
                </button>
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
                    Turn your study material into AI-generated
                    interactive flashcards.
                </p>

                <p className="mt-4 rounded-lg bg-black/[0.03] px-4 py-3 text-sm text-[var(--ink-soft)]">
                    Document:{" "}
                    <span className="font-medium text-[var(--ink)]">
                        {document?.title}
                    </span>
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="space-y-6 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--ink)]">
                        Number of cards
                    </label>

                    <select
                        value={numberOfCards}
                        onChange={(e) =>
                            setNumberOfCards(
                                Number(e.target.value)
                            )
                        }
                        disabled={loading}
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
                        onChange={(e) =>
                            setDifficulty(e.target.value)
                        }
                        disabled={loading}
                        className="w-full rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading
                        ? "✨ Generating with AI..."
                        : "✨ Generate Flashcards"}
                </button>
            </div>
        </div>
    );
}

export default FlashcardGenerator;
