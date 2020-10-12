import React, { useState } from 'react';

import Answers from './Answers';
import { FaChevronRight } from 'react-icons/fa';

function GrammarPatternReview({ onAnswersSubmit, item, correct }) {
  const { title, sentence, sentence2, id, parts } = item;
  const [answers, setAnswers] = useState(
    Array.from({ length: parts.length }, (v, i) => ''),
  );

  const onSubmit = (e) => {
    e.preventDefault();
    // setAnswers(Array.from({ length: parts.length }, (v, i) => ''));
    onAnswersSubmit(answers, item);
  };

  const onAnswerChange = (e, index) => {
    const {
      target: { value },
    } = e;

    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const wrapperClassName =
    correct !== null
      ? correct
        ? 'review-correct-answer'
        : 'review-incorrect-answer'
      : '';

  const svgClass = correct !== null ? 'fill-white filter-shadow-black' : '';
  const inputClass = correct !== null ? 'text-white text-shadow-black' : '';

  return (
    <form className={`${wrapperClassName} inputs`} onSubmit={onSubmit}>
      <div className="answers">
        <Answers
          itemId={id}
          parts={parts}
          answers={answers}
          onAnswerChange={onAnswerChange}
          className={inputClass}
        />
        <button type="submit" hidden />
      </div>
      <FaChevronRight className={`continue-icon ${svgClass}`} alt="logo" />
    </form>
  );
}

export default GrammarPatternReview;
