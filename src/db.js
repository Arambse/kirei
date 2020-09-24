import { calcNextReviewData } from './SRS';

export const initGrammar = () => {
  const request = window.indexedDB.open('Grammar', 6);

  request.onsuccess = (e) => {
    const db = e.target.result;

    const grammarStore = db
      .transaction(['Grammar'], 'readwrite')
      .objectStore('Grammar');

    Object.keys(grammarPoints).forEach((id) => {
      const req = grammarStore.get(id);
      req.onsuccess = ({ target: { result } }) => {
        if (!result) {
          grammarStore.put({ ...grammarPoints[id], nextReview: Date.now() });
        }
      };
    });
  };

  request.onerror = (e) => {
    console.log('[onerror]', request.error);
  };

  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    const { objectStoreNames } = db;

    if (!objectStoreNames.contains('Grammar')) {
      var objectStore = db.createObjectStore('Grammar', {
        keyPath: 'id',
      });
    }
  };
};

export const getReviewItems = async () => {
  const request = window.indexedDB.open('Grammar', 6);
  return new Promise((res, rej) => {
    request.onsuccess = (e) => {
      const db = e.target.result;

      const grammarStore = db
        .transaction(['Grammar'], 'readwrite')
        .objectStore('Grammar');

      const grammarRequest = grammarStore.getAll();
      grammarRequest.onsuccess = (e) => {
        const grammar = e.target.result;
        const toReview = grammar.filter(
          ({ nextReview }) => Date.now() > nextReview,
        );

        res(toReview);
      };
      grammarRequest.onerror = (e) => {
        console.log('[onerror]', grammarRequest.error);
      };
    };

    request.onerror = (e) => {
      console.log('[onerror]', request.error);
    };
  });
};

export const updateReviewItem = (item, isCorrect) => {
  const request = window.indexedDB.open('Grammar', 6);

  request.onsuccess = (e) => {
    const db = e.target.result;

    const grammarStore = db
      .transaction(['Grammar'], 'readwrite')
      .objectStore('Grammar');

    const reviewRequest = grammarStore.get(item.id);
    reviewRequest.onsuccess = (e) => {
      const {
        target: { result: review },
      } = e;
      const { level, nextReview } = calcNextReviewData({ review, isCorrect });

      grammarStore.put({
        ...item,
        lastReview: Date.now(),
        nextReview,
        level,
      }).onsuccess = (e) => {};
    };
    reviewRequest.onerror = (e) => {
      console.log('[onerror]', reviewRequest.error);
    };
  };

  request.onerror = (e) => {
    console.log('[onerror]', request.error);
  };

  request.onupgradeneeded = (e) => {};
};

export const grammarPoints = {
  dekiru: {
    id: 'dekiru',
    title: 'できる',
    parts: ['noun', ['から', 'で'], 'できる'],
    sentence: 'チーズやヨーグルトは牛乳(からできます)',
    sentence2: '日本にはき(でできた)家が多いがこの国の家は大抵石(でできている)',
    level: 0,
    chapter: 1,
    explanation:
      'でできる means made of/from/out of, while から indicates that the material from which something is made is not immediately obvious. できている is used when speaking about something specific.',
    translation: ['be made of', 'be made from'],
  },

  youni: {
    id: 'youni',
    title: 'ように',
    parts: [['Nounの', 'Verb'], 'ように'],
    sentence:
      'これはチョコレートの(ように)見えるけれど消しゴムだから、食べられませんよ',
    sentence2: '小さい猫の声は、赤ちゃんが泣いている(ように)聞こえます',
    level: 0,
    chapter: 1,
    translation: ['like', 'as', 'as if'],
    explanation:
      'ように is used when (1) X resembels Y or (2) when X is as Y shows, says, explains or (3) when X does something as shown/said/explained in/by Y.',
  },
};
