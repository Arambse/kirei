import React from 'react';

function DetailedExplanation({ item }) {
  const { sentence, sentence2, translation, explanation, title } = item;
  return (
    <div className="review-details">
      <div className="review-details-translation">
        <div className="title">Translation</div>
        {translation.map((t, i) => (
          <div key={t}>{`${t}${i !== translation.length - 1 ? ';' : ''}`}</div>
        ))}
      </div>
      <div className="review-details-sentences text-sm">
        <div className="title">Explanation</div>
        <div className="text-center mb-5">{explanation}</div>
        <div className="title">Sentences</div>
        <ExampleSentence text={`1. ${sentence}`} />
        <ExampleSentence text={`2. ${sentence2}`} />
      </div>
    </div>
  );

  function ExampleSentence({ text, grammar }) {
    const reg = /\(([^)]+)\)/g;
    const matches = [...text.matchAll(reg)];
    const parts = text.split(reg).filter((p) => p);
    const hightlighted = [];

    matches.forEach((match) => {
      const start = match.index;
      const length = match[1].length;
      hightlighted.push(text.substring(start + 1, start + length + 1));
    });

    return (
      <div className="japanese">
        {parts.map((p) => {
          return (
            <span
              className={hightlighted.includes(p) ? 'highlighted' : ''}
              key={p}
            >
              {p}
            </span>
          );
        })}
      </div>
    );
  }
}

export default DetailedExplanation;
