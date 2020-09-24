import React, { useState } from 'react';

import Answers from './Answers';
import continueSvg from './continue.svg';

function GrammarReview({ onAnswersSubmit, item, className }) {
  const { title, sentence, sentence2, id, parts } = item;
  const [answers, setAnswers] = useState(
    Array.from({ length: parts.length }, (v, i) => ''),
  );

  const onSubmit = (e) => {
    e.preventDefault();
    setAnswers(Array.from({ length: parts.length }, (v, i) => ''));
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

  return (
    <form className={`${className} inputs`} onSubmit={onSubmit}>
      <div className="answers">
        <Answers
          itemId={id}
          parts={parts}
          answers={answers}
          onAnswerChange={onAnswerChange}
        />
        <button type="submit" hidden />
      </div>
      <img src={continueSvg} className="continue-icon" alt="logo" />
    </form>
  );
}

export default GrammarReview;
