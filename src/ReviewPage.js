import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { updateReviewItem, getReviewItems } from './db';

import continueSvg from './continue.svg';
import GrammarReview from './GrammarReview';
import DetailedExplanation from './DetailedExplanation';

function ReviewPage() {
  const history = useHistory();
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(items[0]);
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const getReviews = async () => {
      const newItems = await getReviewItems();
      setItems(newItems);
      setItem(newItems[0]);
    };

    getReviews();
  }, []);

  if (!item) {
    return <div />;
  }

  const checkAnswer = (answers) => {
    let correct;
    const { parts } = item;

    parts.forEach((part, i) => {
      const answer = answers[i];

      if (typeof part === 'object') {
        if (part.includes(answer)) {
          correct = true;
        }
      } else if (part !== answer.toLowerCase()) {
        correct = false;
      }
    });

    return correct;
  };

  const onAnswersSubmit = (answers, item, setAnswers) => {
    if (!answered) {
      const isCorrect = checkAnswer(answers);
      setCorrect(isCorrect);
      setAnswered(true);
      updateReviewItem(item, isCorrect);
      return;
    }

    const newCurrent = current + 1;
    if (newCurrent > items.length - 1) {
      history.push('/review-end');
      return;
    }

    const newItem = items[newCurrent];
    setCurrent(newCurrent);
    setItem(newItem);
    setAnswered(false);
    return;
  };

  const { title, chapter } = item;

  return (
    <div>
      <header className="App-header">
        <div className="review-metadata">
          <span className="review-subtitle"> {`chapter ${chapter}`}</span>
        </div>
        <div className="review-title">{title}</div>
      </header>
      <div className="main" />
      <GrammarReview
        item={item}
        onAnswersSubmit={onAnswersSubmit}
        className={answered ? (correct ? `bg-green` : `bg-red`) : ''}
      />
      <DetailedExplanation item={item} />
    </div>
  );
}

export default ReviewPage;
