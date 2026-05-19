// src/fortuneEngine.js
// 운세플로우 공통 운세 엔진
// 홈, 캘린더, 통계, 기문, 주역이 모두 이 파일의 결과값을 같이 사용하게 만든다.

const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

const FIVE_ELEMENTS = {
  갑: "목", 을: "목",
  병: "화", 정: "화",
  무: "토", 기: "토",
  경: "금", 신: "금",
  임: "수", 계: "수",
  자: "수", 축: "토", 인: "목", 묘: "목",
  진: "토", 사: "화", 오: "화", 미: "토",
  신: "금", 유: "금", 술: "토", 해: "수",
};

const TEN_GODS = [
  "비견", "겁재", "식신", "상관", "편재",
  "정재", "편관", "정관", "편인", "정인",
];

const TWELVE_STAGES = [
  "장생", "목욕", "관대", "건록", "제왕", "쇠",
  "병", "사", "묘", "절", "태", "양",
];

const SINSAL = [
  "역마", "도화", "화개", "천을귀인", "문창",
  "겁살", "재살", "천살", "월살", "망신",
  "장성", "반안",
];

const QIMEN_DOORS = [
  "개문", "휴문", "생문", "상문", "두문", "경문", "사문", "경문",
];

const ICHING_HEXAGRAMS = [
  "건위천", "곤위지", "수뢰둔", "산수몽", "수천수",
  "천수송", "지수사", "수지비", "풍천소축", "천택리",
  "지천태", "천지비", "천화동인", "화천대유", "지산겸",
  "뢰지예", "택뢰수", "산풍고", "지택림", "풍지관",
];

function hashString(value) {
  let hash = 0;
  const str = String(value);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function clamp(num, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(num)));
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function getDateKey(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getHourBranch(hour) {
  if (hour >= 23 || hour < 1) return "자";
  if (hour < 3) return "축";
  if (hour < 5) return "인";
  if (hour < 7) return "묘";
  if (hour < 9) return "진";
  if (hour < 11) return "사";
  if (hour < 13) return "오";
  if (hour < 15) return "미";
  if (hour < 17) return "신";
  if (hour < 19) return "유";
  if (hour < 21) return "술";
  return "해";
}

export function getDailyFortune(date = new Date(), user = {}) {
  const d = new Date(date);
  const birthKey = `${user.birthYear || ""}-${user.birthMonth || ""}-${user.birthDay || ""}-${user.birthHour || ""}`;
  const seed = hashString(`${birthKey}-${getDateKey(d)}`);

  const dayStem = pick(STEMS, seed);
  const dayBranch = pick(BRANCHES, seed + 3);
  const element = FIVE_ELEMENTS[dayStem];
  const tenGod = pick(TEN_GODS, seed + 7);
  const twelveStage = pick(TWELVE_STAGES, seed + 11);
  const sinsal = pick(SINSAL, seed + 13);

  const conflictScore = 40 + (seed % 45);
  const base = 45 + (seed % 35);

  const love = clamp(base + ((seed % 17) - 5));
  const money = clamp(base + (((seed >> 2) % 19) - 6));
  const health = clamp(base + (((seed >> 3) % 18) - 7));
  const happy = clamp((love + money + health) / 3 + (((seed >> 4) % 9) - 4));
  const move = clamp(base + (((seed >> 5) % 20) - 5));

  const accidentRisk = clamp(100 - conflictScore);
  const spendingRisk = clamp(35 + ((seed >> 6) % 45));
  const stress = clamp(30 + ((seed >> 7) % 55));
  const noble = clamp(40 + ((seed >> 8) % 50));
  const chance = clamp(35 + ((seed >> 9) % 55));
  const relation = clamp(40 + ((seed >> 10) % 50));
  const focus = clamp(35 + ((seed >> 11) % 55));
  const contact = clamp(35 + ((seed >> 12) % 55));
  const investmentRisk = clamp(35 + ((seed >> 13) % 55));

  const total = clamp(
    love * 0.2 +
    money * 0.2 +
    health * 0.15 +
    happy * 0.15 +
    move * 0.15 +
    noble * 0.15
  );

  return {
    date: getDateKey(d),
    total,
    love,
    money,
    health,
    happy,
    move,
    accidentRisk,
    spendingRisk,
    stress,
    noble,
    chance,
    relation,
    focus,
    contact,
    investmentRisk,

    saju: {
      dayStem,
      dayBranch,
      element,
      tenGod,
      twelveStage,
      sinsal,
      relationType: pick(["합", "충", "형", "파", "해", "삼합", "방합", "무난"], seed + 15),
      summary: `${dayStem}${dayBranch} 일진 / ${element} 오행 / ${tenGod} 영향 / ${twelveStage} 흐름`,
    },

    qimen: {
      door: pick(QIMEN_DOORS, seed + 20),
      star: pick(["천봉성", "천임성", "천충성", "천보성", "천영성", "천예성", "천주성", "천심성"], seed + 21),
      god: pick(["직부", "등사", "태음", "육합", "백호", "현무", "구지", "구천"], seed + 22),
      direction: pick(["북", "북동", "동", "남동", "남", "남서", "서", "북서"], seed + 23),
      score: move,
    },

    iching: {
      main: pick(ICHING_HEXAGRAMS, seed + 30),
      changingLine: (seed % 6) + 1,
      changed: pick(ICHING_HEXAGRAMS, seed + 31),
      score: clamp((total + chance + focus) / 3),
    },
  };
}

export function getCalendarFortunes(year, month, user = {}) {
  const lastDay = new Date(year, month, 0).getDate();

  return Array.from({ length: lastDay }, (_, i) => {
    const date = new Date(year, month - 1, i + 1);
    return getDailyFortune(date, user);
  });
}

export function getHourlyFortunes(date = new Date(), user = {}) {
  const hours = [
    ["자", "23:00~01:00"],
    ["축", "01:00~03:00"],
    ["인", "03:00~05:00"],
    ["묘", "05:00~07:00"],
    ["진", "07:00~09:00"],
    ["사", "09:00~11:00"],
    ["오", "11:00~13:00"],
    ["미", "13:00~15:00"],
    ["신", "15:00~17:00"],
    ["유", "17:00~19:00"],
    ["술", "19:00~21:00"],
    ["해", "21:00~23:00"],
  ];

  return hours.map(([branch, label], index) => {
    const seed = hashString(`${getDateKey(date)}-${branch}-${user.birthYear || ""}`);
    return {
      branch,
      label,
      element: FIVE_ELEMENTS[branch],
      tenGod: pick(TEN_GODS, seed),
      twelveStage: pick(TWELVE_STAGES, seed + 2),
      sinsal: pick(SINSAL, seed + 3),
      relationType: pick(["합", "충", "형", "파", "해", "무난"], seed + 4),
      qimenDoor: pick(QIMEN_DOORS, seed + 5),
      score: clamp(40 + (seed % 55)),
      advice: pick(
        ["연락·상담 유리", "이동 유리", "투자 주의", "말조심 필요", "휴식 추천", "계약 검토 유리"],
        seed + 6
      ),
    };
  });
}

export function getYearStats(year, user = {}) {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, i, 15);
    const fortune = getDailyFortune(date, user);

    return {
      month: i + 1,
      total: fortune.total,
      element: fortune.saju.element,
      tenGod: fortune.saju.tenGod,
      sinsal: fortune.saju.sinsal,
      twelveStage: fortune.saju.twelveStage,
      relationType: fortune.saju.relationType,
      qimenDoor: fortune.qimen.door,
      iching: fortune.iching.main,
    };
  });
}

export function getScoreLabel(score, reverse = false) {
  const value = reverse ? 100 - score : score;

  if (value >= 80) return "매우 좋음";
  if (value >= 60) return "좋음";
  if (value >= 40) return "보통";
  if (value >= 20) return "주의";
  return "매우 주의";
}

export function getTodayFortune(user = {}) {
  return getDailyFortune(new Date(), user);
}
