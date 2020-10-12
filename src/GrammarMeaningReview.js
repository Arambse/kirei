import React, { useState } from 'react';

import Answers from './Answers';
import { FaChevronRight } from 'react-icons/fa';

function GrammarMeaningReview({ onAnswersSubmit, correct }) {
  const [answer, setAnswer] = useState(null);

  const onSubmit = (e) => {
    e.preventDefault();
    onAnswersSubmit([answer]);
  };

  const onAnswerChange = (e) => {
    const {
      target: { value },
    } = e;

    setAnswer(value);
  };

  const wrapperClassName =
    correct !== null
      ? correct
        ? 'review-correct-answer'
        : 'review-incorrect-answer'
      : '';

  const inputClass = correct !== null ? 'text-white text-shadow-black' : '';
  const svgClass = correct !== null ? 'fill-white filter-shadow-black' : '';

  return (
    <form className={`${wrapperClassName} inputs`} onSubmit={onSubmit}>
      <div className="answers">
        <input
          name="meaning"
          autoFocus={true}
          value={answer}
          onChange={onAnswerChange}
          style={{ width: '30%' }}
          className={inputClass}
        />
        <button type="submit" hidden />
      </div>
      <FaChevronRight className={`continue-icon ${svgClass}`} alt="logo" />{' '}
    </form>
  );
}

export default GrammarMeaningReview;
