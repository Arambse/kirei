import React, { useState } from 'react';

function Answers({ itemId, parts, answers, onAnswerChange, className }) {
  return (
    <div>
      {parts.map((part, index) => {
        return (
          <input
            key={itemId + index}
            name={itemId + index}
            autoFocus={index === 0}
            value={answers[index]}
            onChange={(e) => onAnswerChange(e, index)}
            className={`${index !== parts.length - 1 && 'mr-5'}`}
            className={className}
          />
        );
      })}
    </div>
  );
}

export default Answers;
