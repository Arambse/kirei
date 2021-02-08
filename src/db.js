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
        const toReview = grammar
          .filter(({ nextReview, active }) => active && Date.now() > nextReview)
          .reduce((res, obj) => {
            return { ...res, [obj.id]: obj };
          }, {});

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
    translation: ['X is famous for Y', 'X is know because Y'],
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
  nakerebanaranai: {
    id: 'nakerebanaranai',
    title: 'なければならない｜なくてはいけない',
    parts: [
      ['V-nai', 'A-nai'],
      ['なければ', 'なくて'],
      ['いけない', 'ならない'],
    ],
    sentence: '調べなきゃならないことがあるから、図書館に行ってくるよ',
    sentence2:
      '今朝、朝寝坊してクラスに遅れちゃったから、明日はもっと早く起きなくちゃ',
    level: 0,
    chapter: 2,
    chapterOrder: 1,
    active: false,
    translation: ['have to', 'must'],
    explanation:
      'This pattern express the idea of obligaion. Although the two patterns are interchangeable, there is a subtle difference. ならない is often used when the speaker expresses his own self of obligation, while いけない is commonly used when the sense of obligation is on the hearer. ならない in sentence ending position can be omitted.',
  },

  wanohitotsuda: {
    id: 'wanohitotsuda',
    title: '〜は〜の〜一つだ',
    parts: ['Noun', 'は', 'NP', ['の一つだ', 'の一人だ']],
    sentence: '漢字は日本語の勉強で最も大切なものの一つです',
    sentence2: 'もーシアルとは最も人気がある作曲家の一人です',
    level: 0,
    chapter: 2,
    chapterOrder: 3,
    active: false,
    translation: ['X is one of the'],
    explanation:
      'The structure is used to describe X while indicating that X is not the only example object, person etc.',
  },
  nokawarini: {
    id: 'nokawarini',
    title: 'の代わりに',
    parts: ['Noun', 'の代わりに'],
    sentence: '最近日本で現金の代わりにカードを使う人が多くなった',
    sentence2: 'ペンの代わりに鉛筆を使ってください',
    level: 0,
    chapter: 2,
    chapterOrder: 5,
    active: false,
    translation: ['in place of', 'instead of'],
    explanation:
      'の代わりに is used to present something/someone that is replacing or has been replaced by something/someone. When the context is clear, Nounの can be omitted.',
  },
  tamenipurpose: {
    id: 'tamenipurpose',
    title: '〜ために (purpose)',
    parts: [['Noun+の', 'V-plain.non-past'], ['の', 'ために', 'ための']],
    sentence: '日本中を安く旅行するためにJRパスを買おうと思っている',
    sentence2:
      '将来、日本の会社で働きたいと思っている。そのためにはもっと日本語が上手にならなくてはいけない',
    level: 0,
    chapter: 2,
    chapterOrder: 6,
    active: false,
    translation: ['in order to', 'for the purpose of', 'for the sake of'],
    explanation:
      'When ために is preceded by a noun or the non-past form of a verb, it indicates either purpose or reason/cause.',
  },
  tamenireason: {
    id: 'tamenireason',
    title: '〜ために (reason)',
    parts: [['い-adjective', 'な-adjectiveな'], ['ために']],
    sentence: 'トムさんは日本語が上手なために、時々通訳を頼まれる',
    sentence2: '勉強が忙しいために、友達と会う時間がない',
    level: 0,
    chapter: 2,
    chapterOrder: 7,
    active: false,
    translation: ['because', 'due to'],
    explanation:
      'When ために is preceeded by an i-adjective or na-adjective or the past form of a verb, it indicates reason or cause. When ために is reason/cause, it can be replaced by から、ので which are less formal.',
  },
  akabka: {
    id: 'akabka',
    title: 'AかBか',
    parts: ['〜か', '〜か'],
    sentence:
      '東京から九州まで新幹線で行くか飛行機で行くか、まで決めていないです。',
    sentence2: '私は毎朝ジュースか水を飲む。',
    level: 0,
    chapter: 2,
    chapterOrder: 8,
    active: false,
    translation: ['Either A or B', 'Wheter A or B'],
    explanation:
      'The phrase AかBか is used to present alternatives. When B か is followed by a case particle (e.g が、を、へ、に、で、と) the second か is usually dropped.',
  },
  youninaru: {
    id: 'youninaru',
    title: 'ようになる',
    parts: ['V-Plain.non-past (often potential form)', 'ようになる'],
    sentence: '日本人の友達ができてから、日本語が上手に話せるようになった。',
    sentence2:
      'スポーツジムに行くようになってから、毎朝早く起きるようになりました。',
    level: 0,
    chapter: 2,
    chapterOrder: 11,
    active: false,
    translation: ['come to (be able to) V', 'Not V now', 'not V anymore'],
    explanation:
      'ようになる indicates a gradual change over a certain period of time. It means that someone or something comes to the point where he/she does (or can do) something or does not (or cannot) do something. V-なくなる is synonymous wih V-ないようになる. The difference is that the latter implies a more gradual change.',
  },
  hitsuyogaaruwanai: {
    id: 'hitsuyogaaruwanai',
    title: '〜必要（がある｜はない）',
    parts: ['Verb', '必要', ['がある', 'はない']],
    sentence: '海外旅行に行く前にパスポートをとる必要があります。',
    sentence2: '私の国では日本に旅行に行くとき、旅行ビザをとる必要はない。',
    level: 0,
    chapter: 2,
    chapterOrder: 13,
    active: false,
    translation: [
      'it is necessary to to V',
      'must V',
      'It is not neccesary to V',
      'there is no need for V',
    ],
    explanation:
      'This phrase is used to indicate the neccessity of doing something. は is common with negative ending.',
  },
  baai: {
    id: 'baai',
    title: '〜場合（は｜には）',
    parts: [['Verb', 'Nounの', 'い-adjective', 'な-adjectiveな'], '場合'],
    sentence:
      '明日になっても犬が見つからない場合は、ペットレスキューセンターに探しに行きましょう。',
    sentence2: '火事や地震の場合にはエレベーターを使わないで下さい。',
    level: 0,
    chapter: 2,
    chapterOrder: 14,
    active: false,
    translation: ['if', 'when', 'in case'],
    explanation:
      '場合 is a noun meaning "case, occation, situation", but with a modifier it forms an adverbial phrase/clause meaning "when, if, in case". 時 can be used in place of 場合 sometimes. However 場合 cannot replace 時 when 時 refers to a specific time and does not mean "case, situation etc". For example 私が行った（時）にはミーチングが始まっていた。',
  },
  dewanakujanaku: {
    id: 'dewanakujanaku',
    title: 'A（では｜じゃ）なく（て）B',
    parts: [
      ['Noun', 'Phrase'],
      ['では', 'じゃ'],
      ['なく', 'なくて'],
      ['Noun', 'Phrase'],
    ],
    sentence: '私が取っているのは中国語ではなくて、日本語です。',
    sentence2: 'いええ、ここじゃなくて、あそこだ。',
    level: 0,
    chapter: 2,
    chapterOrder: 15,
    active: false,
    translation: ['not A but B'],
    explanation:
      'This structure is used to indicate that a certain piece of information is wrong, and following that, to present the correct information. ではなく is used in written laguage, and じゃなく is used when talking.',
  },
  nancounterka: {
    id: 'nancounterka',
    title: '何 + Counter + か',
    parts: ['何', 'Counter', 'か'],
    sentence: '私が取っているのは中国語ではなくて、日本語です。',
    sentence2: 'いええ、ここじゃなくて、あそこだ。',
    level: 0,
    chapter: 2,
    chapterOrder: 16,
    active: false,
    translation: ['some'],
    explanation:
      '何 followed by a counter and か becomes a quantifier meaning "some". For example 何人か,何枚か. 何 cannot be used with つ.',
  },
  hokani: {
    id: 'hokani',
    title: '〜他に（も）；〜他（に）は',
    parts: [
      ['Nounの', 'いーadjective', 'な-adjectiveな', 'Verb'],
      ['他に', '他は', '他には'],
    ],
    sentence: '日本語ではくだけた話しの他に敬語もあって、大変だ。',
    sentence2: '今日は授業に出る他は、何も予定がない。',
    level: 0,
    chapter: 3,
    chapterOrder: 1,
    active: false,
    translation: ['In addition to', 'besides', 'except for', 'other than'],
    explanation:
      'Nの他に（も）is an adverbial phrase meaning "in addition to N". Verbs, adjectives and demonstrative adjectives can also precede 他に（も）to mean "in addition to V-ing" or "in addition to being Adj.". 〜他には also means "in addition to". In some contexts, the phrase can mean "Except for, other than".',
  },
  onajikurai: {
    id: 'onajikurai',
    title: '〜（と）同じ（くらい｜ぐらい）',
    parts: [['Nounと'], '同じ', ['ぐらい', 'くらい', 'くらいのNoun']],
    explanation:
      'The particle くらい or ぐらい "approximately often occurs with 同じ to mean "about the same". Review the pattern "Number + Counter ぐらい". For example 車で5時間ぐらいです。',
    translation: ['about as', 'about the same as'],
    sentence: '今、私が住んでいるアパートの広さは、この部屋と同じぐらいです。',
    sentence2: 'そのロボットは人間と同じぐらい上手の自転車に乗れます。',
    level: 0,
    chapter: 3,
    chapterOrder: 2,
    active: false,
  },
  kata: {
    id: 'kata',
    title: 'Noun + 型',
    parts: [['Noun'], '型', ['だ', 'のNoun']],
    explanation:
      '型 is a suffix meaning "style, type, model etc.". It is commonly used to describe the shape, type or model of an object. The preceding elements are mostly nouns, but some adjectival kanji can also precede it (e.g 大、新、薄).',
    translation: ['style', 'type', 'pattern', 'make', 'model', 'design'],
    sentence: 'ドラえもんは、実は猫型ロボットなんです。知っていますか？',
    sentence2: '私の血液型はA型ですが、母はAB型で父はO型弟はB型です。',
    level: 0,
    chapter: 3,
    chapterOrder: 3,
    active: false,
  },
  soreni: {
    id: 'soreni',
    title: 'それに',
    explanation:
      'それに is used to add an item or to make an additional statement.',
    translation: [
      'In addition',
      'furthermore',
      'on top of that',
      "what's more",
    ],
    parts: [
      ['Noun', 'Sentence。', 'Sentenceし'],
      'それに',
      ['Noun', 'Sentence'],
    ],
    sentence: 'そのアルバイトはあまり大変じゃないし、それに給料もいい。',
    sentence2:
      '日本語を勉強し始めたとき、ひらがなとカタカナ、それに漢字を覚えなくてはいけなかったので、とても大変だった。でも、やめなくてよかった。',
    level: 0,
    chapter: 3,
    chapterOrder: 4,
    active: false,
  },
  nara: {
    id: 'nara',
    title: '〜(の)なら',
    explanation:
      'なら is used when the speaker supposes that something is the case or is true and makes a statement, suggestion, etc. based on that supposition. の occurs before なら when the supposition is based on what the speaker has heard from someone or heard from someone. Example for the の - トムがいく（の) なら、私も行きます。',
    translation: ['Would', 'could', "if that's the case"],
    parts: [['Noun', 'Sentence'], 'なら', 'Sentence'],
    sentence: '彼女が好きなら、付き合ってくれるように頼んでみたらどうですか。',
    sentence2: 'チェックは使えませんが、クレジットカードなら使えます。',
    level: 0,
    chapter: 3,
    chapterOrder: 5,
    active: false,
  },
  toshite: {
    id: 'toshite',
    title: 'として',
    explanation:
      'として is used to indicate the role, capacity or occupation of someone or the function or charcteristics of something.',
    translation: ['as', 'in the capacity of'],
    parts: ['Noun', 'として'],
    sentence:
      '私は来週、学校の代表(representative)として、スピーチュコンテストに出ます。',
    sentence2: 'この携帯電話は電話をするだけでなく、カメラとして使えます。',
    level: 0,
    chapter: 3,
    chapterOrder: 6,
    active: false,
  },
  kotoninatteiru: {
    id: 'kotoninatteiru',
    title: 'Verb-non-past ことになっている',
    explanation:
      'V-plain-non-past ことになっている means that something has been decided and the result of that decision is still in effect. It is often used to introduce rules and customs, as well as ones schedule.',
    translation: [
      'be supposed to',
      'It is a rule that',
      'its been decided that',
    ],
    parts: ['V-plain-non-past', 'ことになっている'],
    sentence: '私のアパートでは、ペット飼ってはいけないことになっている。',
    sentence2: '私の家では食事の後、自分が使ったお皿を洗うことになっている。',
    level: 0,
    chapter: 3,
    chapterOrder: 7,
    active: false,
  },
  oshiteiru: {
    id: 'oshiteiru',
    title: '〜をしている; 〜をしたNoun',
    explanation:
      'This pattern is used to describe a feature of someone or something, focusing on a certain part or attribute of the person or thing. NounはAdjective + Nounをしている is synonymous with NounはNounがAdj. When the phrase modifies a noun, した is commonly used.',
    translation: [
      'be supposed to',
      'It is a rule that',
      'its been decided that',
    ],
    parts: ['V-plain-non-past', 'ことになっている'],
    sentence: '私のアパートでは、ペット飼ってはいけないことになっている。',
    sentence2: '私の家では食事の後、自分が使ったお皿を洗うことになっている。',
    level: 0,
    chapter: 3,
    chapterOrder: 7,
    active: false,
  },
  tekuruteiku: {
    id: 'tekuruteiku',
    title: '〜てくる; 〜ていく',
    explanation:
      "V-teくる and V-teいく indicate the temporal or spatial direction of an actions from the speaker's viewpoint. V-teくる is used when an action appears to be directed toward the speaker and V-ていく is used when it appears to be directed away from the speaker. V-teくる often idicates that an action or process began in the past and is continuingin the present, or that something has begun to take place. V-teいく often expresses an action or state that will continue from the present into the future.",
    translation: ['begin to', 'become', 'continue'],
    parts: ['V-te', ['くる', 'いく']],
    sentence: '最近ちょっと暖かくなってきました。',
    sentence2: '練習すれば、もっと上手二版せるようになっていくよ。頑張ってね。',
    level: 0,
    chapter: 3,
    chapterOrder: 8,
    active: false,
  },
  kotoninatta: {
    id: 'kotoninatta',
    title: 'Verb-non-pastことになった',
    explanation:
      'Verb-non-pastことになった means that a situation has changed due to some external force (e.g a decision made by someone other than the speaker). It indicates either that the speaker (or the subject of the sentence) did not actively make the decision or that he/she is viewing the decision from the standpoint of an outsider. Note that ことにした idicates that the speaker or subject made a decision to do something. Can also be used with negative (いかないことになった).',
    translation: ['It was decided that', 'It turns out that'],
    parts: ['V-non-past-plain', 'ことになった'],
    sentence:
      '日本にあるオフィスで働くことになったので、日本に引っ越すことになりました。',
    sentence2:
      '環境を良くするため、来月からサイクルキャンペーンをすることになった。',
    level: 0,
    chapter: 3,
    chapterOrder: 10,
    active: false,
  },
  younitanomutamenoiu: {
    id: 'younitanomutamenoiu',
    title: '〜ように（頼む｜言う）',
    explanation:
      'ように頼む/言う is used to quote a request or command indirectly. In an affirmative request ように頼む is often used to てくれる as in 来てくれるように頼む.',
    translation: ['to ask someone V', 'to tell someone V'],
    parts: [
      ['V-non-past-plain', 'V-teくれる', 'V-ない'],
      ['ように'],
      ['頼む', '言う'],
    ],
    sentence: '両親は私に、いつも早く家に買ってくるように言います。',
    sentence2:
      '病気でクラスに行けないので、代わりに友達に宿題を出しに行ってくれるように頼んだ。',
    level: 0,
    chapter: 3,
    chapterOrder: 11,
    active: false,
  },
  tekurerukurenaimoraeru: {
    id: 'tekurerukurenaimoraeru',
    title: '〜て（くれる｜くれない｜もらえる｜もらえない）',
    explanation:
      'V-teくれる, etc. with rising intonation is used to make requests in casual conversation.',
    translation: ['will you', ' can you', 'could you'],
    parts: ['V-te', ['くれる', 'くれない', 'もらえる', 'もらえない']],
    sentence: '初めてケーキ焼いたんだけど、ちょっと食べてみてくれる？',
    sentence2: '今勉強中だから、もうちょっと静かにしてもらえる？',
    level: 0,
    chapter: 3,
    chapterOrder: 12,
    active: false,
  },
  younisuru: {
    id: 'younisuru',
    title: 'Verb-non-pastようにする',
    explanation:
      "V-plain.non-pastようにする idicates one's consious effort to do something for some purpose. Here, one makes an effort at every opportunity to do something to the degree that he or she can, but sometimes fails. Thus,ようにする is often used for habitual actions. Note that this phrase differs from Vことにする which indicates one's decision to do something and the action can be either a single or a habitual one.",
    translation: [
      'make an effort to do',
      'make an effort so that',
      'try best to do',
    ],
    parts: ['V-plain.non-past', 'ようにする'],
    sentence:
      '先生、今日は授業に遅れてすみませんでした。明日からもっと早く家を出るようにします。',
    sentence2: '毎日寝る前に、新しい漢字を五つ覚えるようにしています。',
    level: 0,
    chapter: 3,
    chapterOrder: 13,
    active: false,
  },
  kana: {
    id: 'kana',
    title: '〜かな（あ）',
    explanation:
      'かな（あ） is a sentence-final particle which indicates that the sentence is a self-addressed question or a question addressed to the speaker in grou-member. It is used only in casual language.',
    translation: ['I wonder'],
    parts: ['sentence', 'かな'],
    sentence: '春休みは何をしようかなあ。',
    sentence2:
      '北海道のホストファミリーの母さんは元気かなあ。今晩、電話をしてみよう。',
    level: 0,
    chapter: 3,
    chapterOrder: 14,
    active: false,
  },
  narubeku: {
    id: 'narubeku',
    title: 'なるべく',
    explanation:
      "なるべく with or without an adverb modifies the following verb phrase and adds the meaning 'as (much) as possible'. When there is no specific adverb after なるべく, it is usually interpeted as 'as much as' or 'as often as'.",
    translation: ['as much as possible', 'as possible', 'as often as possible'],
    parts: ['なるべく', 'sentence'],
    sentence:
      '日本語のクラスの外でも、なるべく日本語で話した方がいいですよう。',
    sentence2: 'なるべく辞書を使わないで、この記事を読んでみてください。',
    level: 0,
    chapter: 3,
    chapterOrder: 15,
    active: false,
  },
  youtoshitaga: {
    id: 'youtoshitaga',
    title: '〜ようとした（が｜けれど｜ら）',
    explanation:
      "V-volとして, the past form of V-volとする(to try to do), is used in situatios where someone had made an attempt to do something but failed, where someone was goining to do something but didn't, or where something has happened when someone was going to do something.",
    translation: ['tried to but', 'was going to do but', 'was going to when'],
    parts: ['V-vol', 'とした', ['が', 'けれど', 'ら']],
    sentence: 'ケーキを作ろうとしたけれど、卵がなかったから作れなかった。',
    sentence2: '電車に乗ろうとしたら、目の前でドアが閉まってしまった。',
    level: 0,
    chapter: 3,
    chapterOrder: 16,
    active: false,
  },
  mainoyouni: {
    id: 'mainoyouni',
    title: '毎〜のように',
    explanation:
      "The literal meaning of this phrase is 'like every ~' but it is used to mean 'almost every ~'.",
    translation: ['almost every ~'],
    parts: ['毎', 'Xのように'],
    sentence: '映画が好きなので、毎週のように映画を見に行っています。',
    sentence2: '子供の頃は、毎年のように夏休みに海に行っていた。',
    level: 0,
    chapter: 4,
    chapterOrder: 1,
    active: false,
  },
  sentencetokangaerareteiru: {
    id: 'sentencetokangaerareteiru',
    title: 'Sentenceと（考えれている｜思われている）',
    explanation:
      "Sと考えられている an Sと思われている are used to introduce a generally accepted opinion regarding some matter. 考えられている usually indicates an opinion arrived at through logic, and 思われている usually indicates an opinion derived from intution. Note that both indicate the speaker's/writer's opinion.",
    translation: ['it is considered that', 'it is believed that'],
    parts: ['s-plainと', ['考えられている', '思われている']],
    sentence:
      '日本の食べ物は日本にいいと考えられているが、実は、天ぷらやトンカツなど、油をたくさん使うカロリーの高い料理も多い。',
    sentence2: '将来は、宇宙にも人間が住めるようになるだろうと考えられている。',
    level: 0,
    chapter: 4,
    chapterOrder: 2,
    active: false,
  },
  nadonante: {
    id: 'nadonante',
    title: '〜など（は）｜〜なんて',
    explanation:
      "Sentence など is an abbreviated form of Sなどということは which means 'things like S.'. Nounなど is a shortened form on Nounなどとういもの which means things like N. なんて is a colloquial version of など. When S is a quotation, Sなどと is an abbreviated form of Sなどということを",
    translation: ['things like', 'people like', 'etc like'],
    parts: [['Sentence', 'Noun'], ['など', 'なんて']],
    sentence: 'こんな不味い料理美味しいなどと言いたのは誰だ？',
    sentence2: '寿司が嫌いな日本人なんて聞いたこごがない。',
    level: 0,
    chapter: 4,
    chapterOrder: 3,
    active: false,
  },
  mazu: {
    id: 'mazu',
    title: 'まず',
    explanation: "まず is an adverb which means 'first of all'.",
    translation: ['first of all', 'first', 'to begin with'],
    parts: ['まず'],
    sentence: '朝、起きたら、私はまずコーヒーを飲む。',
    sentence2: '今日は、味噌汁を作ります。まず次の材料を準備してください。',
    level: 0,
    chapter: 4,
    chapterOrder: 4,
    active: false,
  },
  verbmasuau: {
    id: 'verbmasuau',
    title: 'Verb-masu合う',
    explanation:
      "合う, when combined with another form, forms a compound verb, adding the meaning of 'to each other'.",
    translation: ['V to each other', 'V with'],
    parts: ['V-Masu', '合う'],
    sentence: 'この問題について、グループで話し合ってください。',
    sentence2: '大きな災害の時は、みんなで助け合うことが大切だ。',
    level: 0,
    chapter: 4,
    chapterOrder: 5,
    active: false,
  },
  verbnonpastyouni: {
    id: 'verbnonpastyouni',
    title: 'Verb-non-pastように',
    explanation:
      'This construction is used to state either a purpose or the way in which something is to be done. in XようにY, X represents a state or event which is beyond the control of the subject Y. The verb form before ように is ofter a potential or negative form. In the similar construction XためにY, X represents an action which can be controlled by the subject of Y, while XようにY implies that a certain consequence (X) will arise from the result of an action (Y). Thus, in the following example, ように cannot be used - 新しい車を買うためにお金を貯めています. When the subject of the main clause is different than that of the subordinate clause, he cannot necessarly control the outcome and therefore ように can be used. For example - 大学が勉強する（ように｜ために）、先生は毎日宿題を出します。',
    translation: ['so that', 'in such a way'],
    parts: ['V-plain.non-past', 'ように'],
    sentence: '日本語が上手になるように、毎日練習しています。',
    sentence2: 'みんなに聞こえるように、大きい声で話しください。',
    level: 0,
    chapter: 4,
    chapterOrder: 6,
    active: false,
  },
  arunoun: {
    id: 'arunoun',
    title: 'あるNoun',
    explanation:
      'あるX is used when the speaker has a specific X in mind, but he/she does not need to or want to be specific.',
    translation: ['a', 'a certain', 'some'],
    parts: ['ある', 'Noun'],
    sentence: 'ある日、突然、日本人が話す普通の日本語が分かるようになった。',
    sentence2: '私は何年か前、ニューヨークで、ある有名人に会いました。',
    level: 0,
    chapter: 4,
    chapterOrder: 7,
    active: false,
  },
  sentencenodewanaikajanaikana: {
    id: 'sentencenodewanaikajanaikana',
    title: 'Sentence （の｜ん）（ではないだろうか｜じゃないかな）',
    explanation:
      "This ending indicates the speaker's conjecture and is used to express an opinion in an indecisive fashion. Although the negative form ではない is used, there is no negative meaning. For casual speech ではないでしょう and じゃないかな are used.",
    translation: ['i think that', 'isnt it that'],
    parts: ['Sentence', ['のではないでしょう', 'んじゃないかな']],
    sentence: '地球温暖化問題はもっと大きくなっていくのではないでしょう。。',
    sentence2: 'このアパートは広いから、二人で住めるんじゃないかな。',
    level: 0,
    chapter: 4,
    chapterOrder: 8,
    active: false,
  },
  zuni: {
    id: 'zuni',
    title: 'ずに',
    explanation:
      'ずに is synonymous with ないで when ないで means "without doing something" or "instead of doing something". に is sometimes omitted.',
    translation: ['without V-ing', 'instead of V-ing'],
    parts: ['V-Nai', 'ずに'],
    sentence: '辞書を見ずに新聞が読めるようになりたいです。',
    sentence2: '両親に相談せずに、留学することを決めてしまった。',
    level: 0,
    chapter: 4,
    chapterOrder: 9,
    active: false,
  },
  souiu: {
    id: 'souiu',
    title: '(そう｜こう｜ああ)いう',
    explanation:
      'When そういう、こういう、ああいう refer to something or someone the speaker sees or percieves they are ised for something/someone close to the hearer, close to the speaker, and away from both. These phrases are also used to refer to something/someone the speaker or the hearer has just mentioned. Specifically, そういう is used when the speaker has just mentioned something/someone. こういう is ised wjem tje speaker has just stated something factual about something/someone. ああいう is used when the information the spekaer or the hearer just mentioned known to both.',
    translation: ['that kind of', 'this kind of', 'such'],
    parts: [['そう', 'こう', 'ああ'], 'いう'],
    sentence:
      '動物園でパンダの赤ちゃんが３匹生まれたそうだ。こういう二ユースはうれしい。',
    sentence2: '面白くて元気が出るそういう本を探しています。',
    level: 0,
    chapter: 4,
    chapterOrder: 10,
    active: false,
  },
  toierudesho: {
    id: 'toierudesho',
    title: 'と言える（だろう｜でしょう）',
    explanation:
      'This pattern is used when the spekaer is quite certain that his or her statement is correct but wants to soften the statement so as not to appear too assertive. This is a formal expression.',
    translation: [
      'It probably can be said that',
      'It is probably right to say',
    ],
    parts: ['Sentence', 'と言えるだろう'],
    sentence: '日本語を勉強している外国人は多くなってきていると言えるだろう。',
    sentence2: 'ならは日本で一番歴史の古い町の一つ言えるでしょうt。',
    level: 0,
    chapter: 4,
    chapterOrder: 11,
    active: false,
  },
  toiukotonanodearu: {
    id: 'toiukotonanodearu',
    title: 'XはY（という）ことなの（である｜だ）',
    explanation:
      'This structure is used to indicate what X is or what X means. なのだ makes the statement more ephatic. である is the formal form of だ.',
    translation: ['X is Y', 'X means that Y'],
    parts: [['Sentence', 'Noun'], 'のことなのだ'],
    sentence:
      '外国語を勉強するということは他の国の文化を勉強するということなのだ。',
    sentence2: 'お金持ちになることは、幸せになれるということなのだろうか。',
    level: 0,
    chapter: 4,
    chapterOrder: 12,
    active: false,
  },
  ndakedondesuga: {
    id: 'ndakedondesuga',
    title: '〜ん　（だけど｜ですが）',
    explanation:
      'Sんだけど is used as a preliminary remark by the speaker to inform the hearer of the speakers desire, the current situation, etc. before (a) asking a question related to that desire/situation. (b) asking for an opinion or for advice, or (c) making a request. This ohrase can also be used to extend an invitation or an offer. When making a request, the request is often unstated as seen in the next sentence: もらったメールを間違って消してしまったんですが（もう一度送ってもらえませんか）. んだけど is more casual than んですが.',
    translation: ['but'],
    parts: ['Sentence', ['んだけど', 'んですが']],
    sentence: '先生、ここの文法がよく分からないんですが..。',
    sentence2:
      '私は野球を見るのが好きなんだけど、トムさんはスポーツは何が好き？',
    level: 0,
    chapter: 4,
    chapterOrder: 13,
    active: false,
  },
  sorede: {
    id: 'sorede',
    title: 'それで',
    explanation:
      "それで is a sentence initial conjuction. It precedes a fact, conclusion, decision, etc. In some sentences S1 when 'S1。それで、S2' S1 is the cause/reason for the information stated in the second sentence. This structure cannot be used when the first sentence is the speaker's judgement, request, or command. In this situation, だから should be used as shown in the following example: トムは明日試験がある。（だから｜X それで）今日のパーティーには来ないと思う。",
    translation: ['because of that', 'so', 'thats why', 'for that reason'],
    parts: ['Sentence', 'それで', 'Sentence'],
    sentence:
      '今日は試験が二つもあったんです。それで昨日はコンサートに行けませんでした。',
    sentence2:
      '子供の時、アニメが大好きだったんだ。それで、日本語を勉強しようと思ったんだ。',
    level: 0,
    chapter: 4,
    chapterOrder: 14,
    active: false,
  },
  questiontemo: {
    id: 'questiontemo',
    title: 'Question Word 〜ても',
    explanation:
      'When ても is used with a question word, the phrase means "no matter" or "without regard to.".',
    translation: [
      'no matter what',
      'no matter who',
      'no matter when',
      'no matter how',
    ],
    parts: ['Question', ['VerbてForm', 'NounてForm'], 'も', 'sentence'],
    sentence: '世界中、どこに行っても、マクドナルドが食べられる。',
    sentence2: '彼はギターがとても上手だ。どんな曲でも弾ける。',
    level: 0,
    chapter: 4,
    chapterOrder: 15,
    active: false,
  },
  uchini: {
    id: 'uchini',
    title: '〜うちに',
    explanation:
      '（ない）うちに is used when someone does something before a situation or state changes. 間に is used in similiar situations, but it cannot be used with the negative forms of verbs, as seen in the next sentence: 忘れない（うちに｜X 間に）今日習ったことを復習した。. Another difference between the two phrases is that うちに always implies that it is not possible, easy or a good idea to do something after the time specified by the うちに clause. However, this is not always the case with 間に.　Thus, if it is not a problem for the speaker to go to japan after finishing his japanese class, 間に should be used: 日本語を勉強している間に日本に行ってみたい。',
    translation: ['while', 'still', 'before'],
    parts: [
      ['Verv-plain-nonpast', 'Adj-Plain-nonpast', 'Nounの', 'NaAdjな'],
      'うちに',
      'Sentence',
    ],
    sentence: '日本にいるうちに、色々な所に旅行に行きたい。',
    sentence2: '暑くならないうちに、犬の散歩をしてきた方がいいよ。',
    level: 0,
    chapter: 4,
    chapterOrder: 16,
    active: false,
  },
  dekireba: {
    id: 'dekireba',
    title: 'できれば；できたら',
    explanation:
      'The phrase literally means "if possible". It is also used when the speaker asks a favor of someone in a less direct way. できれば is slightly more formal then できたら.',
    translation: ['if possible', 'if you dont mind', 'if its all right'],
    parts: [['Sentence', 'Noun'], ['できれば', 'できたら'], 'Sentence'],
    sentence:
      'できれば、医者になりたいが、授業料が高いので難しいかもしれない。',
    sentence2:
      'ケーキは私が焼くから、山下さんは、できたら果物を持って切ってくれない？',
    level: 0,
    chapter: 4,
    chapterOrder: 17,
    active: false,
  },
  tabakari: {
    id: 'tabakari',
    title: '〜たばかり',
    explanation:
      'V-plain-past ばかり indicates that someone has just done something or something has just happened. The noun modification form is ばかりの.',
    translation: ['have just V-ed'],
    parts: ['V-plain-past', 'ばかり', ['だ', 'Noun']],
    sentence: '今、食べたばかりですから、お腹がいっぱいで、何も食べれません。',
    sentence2: '日本に来たばかりの頃は、日本の習慣がよく分からなくて困った。',
    level: 0,
    chapter: 4,
    chapterOrder: 18,
    active: false,
  },
};
