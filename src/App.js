import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getReviewItems } from './db';
import './App.css';

function App() {
  const [reviews, setReviews] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const getReviews = async () => {
      const items = await getReviewItems();
      setReviews(items);
    };

    getReviews();
  }, []);

  if (!reviews) {
    return <div />;
  }

  const onReviewClick = () => {
    history.push('/review');
  };

  return (
    <div>
      <span>{`Review: ${reviews.length}`}</span>
      <button disabled={reviews.length === 0} onClick={onReviewClick}>
        Review
      </button>
    </div>
  );
}

export default App;
