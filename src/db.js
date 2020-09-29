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
          ({ nextReview, active }) => active && Date.now() > nextReview,
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

export const getAllGrammar = async () => {
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
        res(grammar);
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
export const setReviewActive = (id, active) => {
  const request = window.indexedDB.open('Grammar', 6);
  return new Promise((res, rej) => {
    request.onsuccess = (e) => {
      const db = e.target.result;

      const grammarStore = db
        .transaction(['Grammar'], 'readwrite')
        .objectStore('Grammar');

      const reviewRequest = grammarStore.get(id);
      reviewRequest.onsuccess = (e) => {
        const {
          target: { result: review },
        } = e;
        grammarStore.put({
          ...review,
          active,
        }).onsuccess = (e) => {
          res({ ...review, active });
        };
      };

      reviewRequest.onerror = (e) => {
        console.log('[onerror]', reviewRequest.error);
      };
    };

    request.onerror = (e) => {
      console.log('[onerror]', request.error);
    };

    request.onupgradeneeded = (e) => {};
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
  youni: {
    id: 'youni',
    title: 'ように',
    parts: [['Nounの', 'Verb'], 'ように'],
    sentence:
      'これはチョコレートの(ように)見えるけれど消しゴムだから、食べられませんよ',
    sentence2: '小さい猫の声は、赤ちゃんが泣いている(ように)聞こえます',
    level: 0,
    chapter: 1,
    chapterOrder: 2,
    active: false,
    translation: ['like', 'as', 'as if'],
    explanation:
      'ように is used when (1) X resembels Y or (2) when X is as Y shows, says, explains or (3) when X does something as shown/said/explained in/by Y.',
  },
  yumeida: {
    id: 'yumeida',
    title: '〜は〜で（有名だ｜知られている）',
    parts: [['〜はNで', '〜はSことで'], '有名だ'],
    sentence: 'エジプトはピラミッドやスフィンクスで有名だ。',
    sentence2: 'くまは冬眠することで知られています。',
    level: 0,
    chapter: 1,
    chapterOrder: 4,
    active: false,
    translation: ['X is famous for Y, X is know because Y'],
    explanation:
      'Either a noun or a sentence occors before で to state what X is famous for or the reason that X is famous.',
  },
  kotogaaru: {
    id: 'kotogaaru',
    title: 'V-plain-こと（が｜も）ある',
    parts: ['V-plain', 'こと（が｜も）ある'],
    sentence:
      '朝ごはんは大抵家で食べますが、時々友達とレストランに行くこともあります。',
    sentence2:
      '文法の説明を読んでもわからないことがある。そんな時は先生に聞きに行くことにしている。',
    level: 0,
    chapter: 1,
    chapterOrder: 6,
    active: false,
    translation: ['There are times when, sometimes'],
    explanation:
      'V-Plain non past ことがある is used when something occurs (or someone does something) occasionaly. も implies that something else may also occur.',
  },
  kadouka: {
    id: 'kadouka',
    title: '（〜か｜〜かどうか）は〜に（よって違う｜よる）',
    parts: [
      ['QA~か', 'QA~かどうか', 'Noun'],
      'は',
      'Nounに',
      ['よって違う', 'よる'],
    ],
    sentence: '何歳で運転免許が取れるかは国によって違うようです',
    sentence2: '私にとって、読み物が難しいかどうかは、漢字によります',
    level: 0,
    chapter: 1,
    chapterOrder: 7,
    active: false,
    translation: ['differ depending on', 'depend on'],
    explanation:
      'This structure is used to indicate that somethign differs depending onthe situation, location, time, etc..',
  },
  hajimeru: {
    id: 'hajimeru',
    title: 'V-始める',
    parts: ['Verb-Masu', '始める'],
    sentence: 'この地方では十一月になると雪が降り始める。',
    sentence2: '私の弟は一歳の時、歩き始めました。',
    level: 0,
    chapter: 1,
    chapterOrder: 8,
    active: false,
    translation: ['Begin to'],
    explanation: '始める in this use is an auxiliary verb meaning "begin to V"',
  },
  particleno: {
    id: 'particleno',
    title: 'P-の',
    parts: ['Noun', 'Particle', 'の', 'Noun'],
    sentence: '友達へのプレセント。先生とのミーティング。',
    sentence2: '東京までの新幹線',
    level: 0,
    chapter: 1,
    chapterOrder: 9,
    active: false,
    translation: ['description of something'],
    explanation:
      'In some situations, A in AのB is a noun with a particle such as へ、で、から、まで。が、を and に never occur in this position.',
  },
  toieba: {
    id: 'toieba',
    title: '〜と言えば',
    parts: ['X', 'と言えば'],
    sentence:
      'これは昔話の絵本ですね。そうですね。あ、昔話と言えば、昨日桃太郎を見ました。',
    sentence2:
      '今晩道子さんに会うんです。そうですか。道子さんと言えば来月田中さんと結婚する。',
    level: 0,
    chapter: 1,
    chapterOrder: 11,
    active: false,
    translation: ['Speaking of'],
    explanation:
      'と言えば which literally means "if you say that.." is used to present, as the topic, something or someone that has just been mentioned by the hearer or the speaker.',
  },
  toka: {
    id: 'toka',
    title: '〜とか',
    parts: ['Noun', 'とか', 'Noun', 'とか'],
    // parts: ['sentence-plain','とか','sentence-plain','とか','する'],
    sentence: '週末はたいてい選択とか掃除とかをします。',
    sentence2:
      '漢字を覚えるときは、フラッシュカードを作るとか何回も書くとかするといいですよ。',
    level: 0,
    chapter: 1,
    chapterOrder: 12,
    active: false,
    translation: ['thinks/places/etc like, and,or'],
    explanation:
      'とか is used to list examples non exhaustively. It is similar to や in the meaning when the examles listed are nouns. However, とか can be also be preceded by verb phrases.',
  },
  toiunowa: {
    id: 'toiunowa',
    title: '〜というのは',
    parts: ['phrase', 'というのは', 'Noun', 'と言うこと', 'だ'],
    // parts: ['phrase', 'というのは', 'Sentence','と言う意味','だ'],
    sentence: '「話せる」というのは、「話すことができる」という意味です。',
    sentence2:
      '漢字を覚えるときは、フラッシュカードを作るとか何回も書くとかするといいですよ。',
    level: 0,
    chapter: 1,
    chapterOrder: 13,
    active: false,
    translation: ['X means', 'The meaning of X is'],
    explanation:
      'The structure 〜というのは〜だ is used to provide the meaning or definition of a word or phase.',
  },
  dake: {
    id: 'dake',
    title: '〜だけ（でなく｜じゃなくて）も',
    parts: [
      ['Noun', 'Sentence'],
      ['だけでなく', 'だけじゃなくて'],
      'Noun',
      'も',
    ],
    sentence:
      '日本語はひらがなだけでなく、カタカナや漢字も覚えなくてはいけない。',
    sentence2:
      'このアパートは駅から近くて便利なだけじゃなくて、家賃も安いから、借りることにする',
    level: 0,
    chapter: 1,
    chapterOrder: 14,
    active: false,
    translation: ['not only', 'but also'],
    explanation:
      'This structure 〜だけ（でなくて｜じゃなくて）expresses the idea "not only X, but also Y". Particles may also appear before も.',
  },
  te: {
    id: 'te',
    title: 'って',
    parts: ['Noun', 'って'],
    sentence: '田中さんの嫌いな食べ物って何？',
    sentence2: '漢字って、覚えてもすぐ忘れちゃうよね',
    level: 0,
    chapter: 1,
    chapterOrder: 15,
    active: false,
    translation: ['Speaking of', 'As for'],
    explanation:
      'って is a colloquial topic marker. It often appears in questions. In written language, は can be used.',
  },
  teiu: {
    id: 'teiu',
    title: '〜って（言う｜聞く｜etc)',
    parts: ['Sentence', 'って', ['言う', '聞く', '書く']],
    sentence: '田中さん、五時に来るって言ってたけど、まだ来ないね。',
    sentence2: 'ここに「静かにしてください」って書いてあるのが目ませんか？',
    level: 0,
    chapter: 1,
    chapterOrder: 15,
    active: false,
    translation: ['Speaking of', 'As for'],
    explanation:
      'って is the informal colloquial form of the quotative marker と. って commonly occurs with verbs like 言う、書く、聞く.',
  },
  nitotte: {
    id: 'nitotte',
    title: 'にとって',
    parts: ['Noun', 'にとって'],
    sentence: 'あなたにとって、一番大切な人は誰ですか。',
    sentence2:
      'ベートーベンは音楽家にとって最も大切な耳が聞こえなくなってしまったのに、あの有名な「第九シンフォニー」を作った。',
    level: 0,
    chapter: 2,
    chapterOrder: 4,
    active: false,
    translation: ['for', 'to'],
    explanation:
      'Xにとって means "to X; forX" in a context where something or someone is important to X, or is necessary, useful, good, difficult, etc. For X. X is often a person, a geographic unit or an organization.',
  },
};
