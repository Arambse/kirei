import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { updateReviewItem, getReviewItems } from './db';

import continueSvg from './continue.svg';
import GrammarPatternReview from './GrammarPatternReview';
import GrammarMeaningReview from './GrammarMeaningReview';

import DetailedExplanation from './DetailedExplanation';

const shuffleArray = (array) => {
  const newArr = array.map((item) => item);
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const siblingReviewType = (key) => {
  const [id, type] = key.split('_');
  const newType = type === 'meaning' ? 'pattern' : 'meaning';
  return `${id}_${newType}`;
};

const randomIncorrectReview = (reviews) => {
  return Object.keys(reviews).find((r) => !reviews[r]);
};

const finishedReviews = (reviews) => {
  return !Object.keys(reviews).some((r) => !reviews[r]);
};

function ReviewPage() {
  const history = useHistory();
  const [items, setItems] = useState({});
  const [itemId, setItemId] = useState('');
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState({});

  const [correct, setCorrect] = useState(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const getReviews = async () => {
      const newItems = await getReviewItems();
      const totalReviews = Object.keys(newItems).reduce((res, id) => {
        return { ...res, [`${id}_pattern`]: false, [`${id}_meaning`]: false };
      }, {});

      setItems(newItems);
      setReviews(totalReviews);
      setReview(Object.keys(totalReviews)[0]);
      setItemId(Object.keys(newItems)[0]);
    };

    getReviews();
  }, []);

  if (!itemId) {
    return <div />;
  }

  const { title, chapter } = items[itemId];
  const reviewType = review.split('_')[1];

  const itemIdFromReview = (review) => {
    const reviewId = review.split('_')[0];
    return Object.keys(items).find((id) => id === reviewId);
  };

  const checkMeaning = (answer) => {
    const { translation } = items[itemId];
    return translation.some((t) => t.toLowerCase() === answer);
  };

  const checkPattern = (answers) => {
    let correct = false;
    const { parts } = items[itemId];
    parts.forEach((part, i) => {
      const answer = answers[i];

      if (typeof part === 'object') {
        if (part.includes(answer)) {
          correct = true;
        }
      } else if (answer && part === answer.toLowerCase()) {
        correct = true;
      }
    });

    return correct;
  };

  const checkAnswer = (answers) => {
    if (reviewType === 'pattern') {
      return checkPattern(answers);
    }

    if (reviewType === 'meaning') {
      return checkMeaning(answers[0]);
    }
  };

  const onAnswersSubmit = (answers) => {
    if (correct === null) {
      const isCorrect = checkAnswer(answers);
      setCorrect(isCorrect);

      if (!isCorrect) {
        updateReviewItem(items[itemId], false);
      } else {
        const itemOtherReviewAnswer = reviews[siblingReviewType(review)];
        if (itemOtherReviewAnswer) {
          updateReviewItem(items[itemId], true);
        }
      }

      setCorrect(isCorrect);
      setReviews({ ...reviews, [review]: isCorrect });
      return;
    }

    const isFinishedReviews = finishedReviews(reviews);
    if (isFinishedReviews) {
      history.push('/review-end');
      return;
    }

    const newReview = randomIncorrectReview(reviews);
    const newItem = itemIdFromReview(newReview);

    setItemId(newItem);
    setReview(newReview);
    setCorrect(null);
    return;
  };

  return (
    <div className="ReviewPage">
      <header className="App-header">
        <div className="review-metadata">
          <span className="review-subtitle"> {`chapter ${chapter}`}</span>
        </div>
        <div className="review-title">{title}</div>
      </header>
      <div className="main" />
      <GrammarReview
        type={reviewType}
        item={items[itemId]}
        onAnswersSubmit={onAnswersSubmit}
        correct={correct}
      />
      <DetailedExplanation item={items[itemId]} />
    </div>
  );
}

const GrammarReview = ({ type, item, onAnswersSubmit, correct }) => {
  return type === 'pattern' ? (
    <div>
      <GrammarReviewTitlePattern />
      <GrammarPatternReview
        item={item}
        onAnswersSubmit={onAnswersSubmit}
        correct={correct}
      />
    </div>
  ) : (
    <div>
      <GrammarReviewTitleMeaning />
      <GrammarMeaningReview
        item={item}
        onAnswersSubmit={onAnswersSubmit}
        correct={correct}
      />
    </div>
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
