import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { updateReviewItem, getReviewItems } from './db';

import continueSvg from './continue.svg';
import GrammarReview from './GrammarReview';
import DetailedExplanation from './DetailedExplanation';

const shuffleArray = (array) => {
  const newArr = array.map((item) => item);
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

function ReviewPage() {
  const history = useHistory();
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(items[0]);
  const [review, setReview] = useState(null);
  const [reviews, setReviews] = useState(null);

  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const getReviews = async () => {
      const newItems = await getReviewItems();
      const totalReviews = newItems
        .map(({ id }) => {
          return [[id, 'meaning'], [id, 'pattern']];
        })
        .reduce((res, arr) => {
          return [...res, ...arr];
        }, []);

      const shuffledReviews = shuffleArray(totalReviews);

      setItems(newItems);
      setReviews(shuffledReviews);
      setReview(shuffledReviews[0]);
      setItem(newItems.find(({ id }) => id === shuffledReviews[0][0]));
    };

    getReviews();
  }, []);

  if (!item) {
    return <div />;
  }

  const itemFromReview = (review) => {
    return items.find(({ id }) => id === review[0]);
  };

  const checkAnswer = (answers) => {
    let correct;
    const { parts } = item;

    parts.forEach((part, i) => {
      const answer = answers[i];

      if (typeof part === 'object') {
        if (part.includes(answer)) {
          correct = true;
        }
      } else if (!answer || part !== answer.toLowerCase()) {
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
    if (newCurrent > reviews.length - 1) {
      history.push('/review-end');
      return;
    }

    const newReview = reviews[newCurrent];

    setCurrent(newCurrent);
    setItem(itemFromReview(newReview));
    setReview(newReview);
    setAnswered(false);
    return;
  };

  const { title, chapter } = item;
  const reviewType = review[1];

  return (
    <div>
      <header className="App-header">
        <div className="review-metadata">
          <span className="review-subtitle"> {`chapter ${chapter}`}</span>
        </div>
        <div className="review-title">{title}</div>
      </header>
      <div className="main" />
      <GrammarReviewTitle type={reviewType} />
      <GrammarReview
        item={item}
        onAnswersSubmit={onAnswersSubmit}
        className={answered ? (correct ? `bg-green` : `bg-red`) : ''}
      />
      <DetailedExplanation item={item} />
    </div>
  );
}

const GrammarReviewTitle = ({ type }) => {
  return type === 'pattern' ? (
    <GrammarReviewTitlePattern />
  ) : (
    <GrammarReviewTitleMeaning />
  );
};

const GrammarReviewTitlePattern = () => {
  return (
    <div className="GrammarReviewTitlePattern">
      <span>Grammar </span>
      <strong>Pattern</strong>
    </div>
  );
};

const GrammarReviewTitleMeaning = () => {
  return (
    <div className="GrammarReviewTitleMeaning">
      <span>Grammar </span>
      <strong>Meaning</strong>
    </div>
  );
};
export default ReviewPage;
