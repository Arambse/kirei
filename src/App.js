import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getReviewItems, getAllGrammar, setReviewActive } from './db';
import './App.css';

function App() {
  const [reviews, setReviews] = useState(null);
  const [grammar, setGrammar] = useState(null);

  const history = useHistory();

  useEffect(() => {
    const getReviews = async () => {
      const grammar = await getAllGrammar();
      const items = grammar.filter(
        ({ nextReview, active }) => active && Date.now() > nextReview,
      );

      setReviews(items);
      setGrammar(grammar);
    };

    getReviews();
  }, []);

  if (!grammar) {
    return <div />;
  }

  const reviewsByChapter = grammar.reduce(
    (result, item) => ({
      ...result,
      [item['chapter']]: [...(result[item['chapter']] || []), item],
    }),
    {},
  );

  const onStartReviewClick = () => {
    history.push('/review');
  };

  const onReviewClick = async ({ id, active }) => {
    const updated = await setReviewActive(id, !active);
    const newGrammar = [...grammar].filter(({ id: gid }) => gid !== id);
    newGrammar.push(updated);

    const newItems = newGrammar.filter(
      ({ nextReview, active }) => active && Date.now() > nextReview,
    );

    setGrammar(newGrammar);
    setReviews(newItems);
  };

  return (
    <div>
      <button
        className="review-button mt-10"
        disabled={reviews.length === 0}
        onClick={onStartReviewClick}
      >
        {`${reviews.length}`}
      </button>
      <GrammarList grammar={reviewsByChapter} onReviewClick={onReviewClick} />
    </div>
  );
}

const GrammarList = ({ grammar, onReviewClick }) => {
  const chapters = Object.keys(grammar);

  return (
    <div className="GrammarList">
      {chapters.map((chapter) => {
        const sorted = [...grammar[chapter]].sort(
          (g1, g2) => g1.chapterOrder - g2.chapterOrder,
        );

        return (
          <div className="grammar-list-chapter">
            <Chapter chapter={chapter} />
            {sorted.map((g) => {
              return (
                <GrammarListItem
                  grammar={g}
                  onClick={(e) => onReviewClick(g)}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
const Chapter = ({ chapter }) => {
  return <div className="Chapter">{`Chapter ${chapter}`}</div>;
};

const GrammarListItem = ({ grammar: { title, level, active }, onClick }) => {
  return (
    <div className="GrammarListItem">
      <GrammarBadge title={title} active={active} onClick={onClick} />
      <GrammarProgress level={level} />
    </div>
  );
};

const GrammarBadge = ({ title, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`GrammarBadge japanese ${!active && 'bg-gray'}`}
    >
      {title}
    </div>
  );
};

const GrammarProgress = ({ level }) => {
  return (
    <div className="GrammarProgress">
      {Array.from(new Array(6)).map((v, i) => (
        <div
          className={i < level ? 'bg-green level-box' : 'bg-gray level-box'}
        />
      ))}
    </div>
  );
};
export default App;
