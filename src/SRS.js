export const calcNextReviewData = ({ review, isCorrect }) => {
  const { level } = review;
  let newLevel;

  if (isCorrect) {
    newLevel = level + 1;
  } else {
    newLevel = level === 0 ? 0 : level - 1;
  }

  const newInterval = levels[newLevel].interval;
  const nextReview = Date.now() + hoursToMilli(newInterval);

  return { level: newLevel, nextReview };
};

const hoursToMilli = (h) => h * 60 * 60 * 1000;

const levels = {
  0: { interval: 0 },
  1: { interval: 3 },
  2: { interval: 24 * 0.5 },
  3: { interval: 24 * 1 },
  4: { interval: 24 * 2 },
  5: { interval: 24 * 5 },
  6: { interval: 24 * 15 },
};
