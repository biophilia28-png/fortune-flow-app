import LifeFortunePage from "./LifeFortunePage";
import React, { useEffect, useMemo, useState } from "react";

import {
  Home,
  CalendarDays,
  BarChart3,
  MapPin,
  ShieldAlert,
  Settings,
  Lock,
  Compass,
  Star,
  Heart,
  Coins,
  Smile,
  AlertTriangle,
  MessageCircleWarning,
  Save,
  UserRound,
  Clock,
  CalendarCheck,
  Info,
  RotateCcw,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "fortune_flow_profile_v2";
const LOG_KEY = "fortune_flow_logs";


const defaultProfile = {
  nickname: "",
  birthDate: "",
  birthTime: "12:00",
  gender: "선택 안 함",
  calendarType: "양력",
};

function clamp(n, min = 5, max = 95) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function hashNumber(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

const branches = [
  "자",
  "축",
  "인",
  "묘",
  "진",
  "사",
  "오",
  "미",
  "신",
  "유",
  "술",
  "해",
];

const stems = [
  "갑",
  "을",
  "병",
  "정",
  "무",
  "기",
  "경",
  "신",
  "임",
  "계",
];

/* ✅ 1단계: 사주 기반 계산 테이블 */
const FIVE_ELEMENTS = {
  갑: "목", 을: "목",
  병: "화", 정: "화",
  무: "토", 기: "토",
  경: "금", 신: "금",
  임: "수", 계: "수",
};

const STEM_YINYANG = {
  갑: "양", 을: "음",
  병: "양", 정: "음",
  무: "양", 기: "음",
  경: "양", 신: "음",
  임: "양", 계: "음",
};

const BRANCH_ELEMENTS = {
  자: "수",
  축: "토",
  인: "목",
  묘: "목",
  진: "토",
  사: "화",
  오: "화",
  미: "토",
  신: "금",
  유: "금",
  술: "토",
  해: "수",
};

const BRANCH_HIDDEN_STEMS = {
  자: ["계"],
  축: ["기", "계", "신"],
  인: ["갑", "병", "무"],
  묘: ["을"],
  진: ["무", "을", "계"],
  사: ["병", "무", "경"],
  오: ["정", "기"],
  미: ["기", "정", "을"],
  신: ["경", "임", "무"],
  유: ["신"],
  술: ["무", "신", "정"],
  해: ["임", "갑"],
};

const BRANCH_CLASH = {
  자: "오",
  축: "미",
  인: "신",
  묘: "유",
  진: "술",
  사: "해",
  오: "자",
  미: "축",
  신: "인",
  유: "묘",
  술: "진",
  해: "사",
};

const BRANCH_COMBINATION = {
  자: "축",
  축: "자",
  인: "해",
  해: "인",
  묘: "술",
  술: "묘",
  진: "유",
  유: "진",
  사: "신",
  신: "사",
  오: "미",
  미: "오",
};

const THREE_HARMONY = [
  ["신", "자", "진", "수"],
  ["인", "오", "술", "화"],
  ["해", "묘", "미", "목"],
  ["사", "유", "축", "금"],
];

const TWELVE_STAGE_TABLE = {
  갑: ["해", "자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술"],
  을: ["오", "사", "진", "묘", "인", "축", "자", "해", "술", "유", "신", "미"],
  병: ["인", "묘", "진", "사", "오", "미", "신", "유", "술", "해", "자", "축"],
  정: ["유", "신", "미", "오", "사", "진", "묘", "인", "축", "자", "해", "술"],
  무: ["인", "묘", "진", "사", "오", "미", "신", "유", "술", "해", "자", "축"],
  기: ["유", "신", "미", "오", "사", "진", "묘", "인", "축", "자", "해", "술"],
  경: ["사", "오", "미", "신", "유", "술", "해", "자", "축", "인", "묘", "진"],
  신: ["자", "해", "술", "유", "신", "미", "오", "사", "진", "묘", "인", "축"],
  임: ["신", "유", "술", "해", "자", "축", "인", "묘", "진", "사", "오", "미"],
  계: ["묘", "인", "축", "자", "해", "술", "유", "신", "미", "오", "사", "진"],
};

const TWELVE_STAGE_NAMES = [
  "장생", "목욕", "관대", "건록", "제왕", "쇠",
  "병", "사", "묘", "절", "태", "양",
];
/* ✅ 2단계: 십성 계산 함수 */
function getTenGod(dayStem, targetStem) {
  const dayElement = FIVE_ELEMENTS[dayStem];
  const targetElement = FIVE_ELEMENTS[targetStem];

  const dayYY = STEM_YINYANG[dayStem];
  const targetYY = STEM_YINYANG[targetStem];

  if (!dayElement || !targetElement) return "미상";

  const sameYinYang = dayYY === targetYY;

  const generates = {
    목: "화",
    화: "토",
    토: "금",
    금: "수",
    수: "목",
  };

  const controls = {
    목: "토",
    토: "수",
    수: "화",
    화: "금",
    금: "목",
  };

  if (dayElement === targetElement) {
    return sameYinYang ? "비견" : "겁재";
  }

  if (generates[dayElement] === targetElement) {
    return sameYinYang ? "식신" : "상관";
  }

  if (controls[dayElement] === targetElement) {
    return sameYinYang ? "편재" : "정재";
  }

  if (controls[targetElement] === dayElement) {
    return sameYinYang ? "편관" : "정관";
  }

  if (generates[targetElement] === dayElement) {
    return sameYinYang ? "편인" : "정인";
  }

  return "미상";
}

function getBranchMainStem(branch) {
  const hidden = BRANCH_HIDDEN_STEMS[branch];
  return hidden && hidden.length ? hidden[0] : null;
}

function getBranchTenGod(dayStem, branch) {
  const mainStem = getBranchMainStem(branch);
  if (!mainStem) return "미상";
  return getTenGod(dayStem, mainStem);
}

/* ✅ 3단계: 12운성 계산 함수 */
function getTwelveStage(dayStem, branch) {
  const order = TWELVE_STAGE_TABLE[dayStem];

  if (!order) return "미상";

  const index = order.indexOf(branch);

  if (index < 0) return "미상";

  return TWELVE_STAGE_NAMES[index];
}

function getTwelveStageScore(stage) {
  const scoreMap = {
    장생: 82,
    목욕: 58,
    관대: 72,
    건록: 86,
    제왕: 90,
    쇠: 55,
    병: 38,
    사: 30,
    묘: 42,
    절: 25,
    태: 52,
    양: 60,
  };

  return scoreMap[stage] || 50;
} 
/* ✅ 4단계: 형충회합 계산 함수 */
function analyzeBranchRelations(branchesInput) {
  const result = {
    clash: [],
    combo: [],
    harmony: [],
    score: 50,
    text: [],
  };

  const list = branchesInput.filter(Boolean);

  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];

      if (BRANCH_CLASH[a] === b) {
        result.clash.push(`${a}-${b}`);
        result.score -= 10;
      }

      if (BRANCH_COMBINATION[a] === b) {
        result.combo.push(`${a}-${b}`);
        result.score += 8;
      }
    }
  }

  THREE_HARMONY.forEach(([a, b, c, element]) => {
    const count = [a, b, c].filter((x) => list.includes(x)).length;

    if (count >= 2) {
      result.harmony.push(`${a}${b}${c} ${element}국`);
      result.score += count === 3 ? 16 : 8;
    }
  });

  if (result.clash.length) {
    result.text.push(`충: ${result.clash.join(", ")}`);
  }

  if (result.combo.length) {
    result.text.push(`육합: ${result.combo.join(", ")}`);
  }

  if (result.harmony.length) {
    result.text.push(`삼합: ${result.harmony.join(", ")}`);
  }

  if (!result.text.length) {
    result.text.push("큰 충돌 없이 안정적인 지지 흐름");
  }

  result.score = clamp(result.score, 15, 95);

  return result;
}



/* ✅ 5단계: 신살·귀인 계산 함수 */
function getNoblemanBranches(dayStem) {
  const map = {
    갑: ["축", "미"],
    무: ["축", "미"],
    경: ["축", "미"],

    을: ["자", "신"],
    기: ["자", "신"],

    병: ["해", "유"],
    정: ["해", "유"],

    임: ["사", "묘"],
    계: ["사", "묘"],

    신: ["오", "인"],
  };

  return map[dayStem] || [];
}

function getPeachBlossomBranch(yearBranchOrDayBranch) {
  const groupMap = {
    신: "유",
    자: "유",
    진: "유",

    인: "묘",
    오: "묘",
    술: "묘",

    해: "자",
    묘: "자",
    미: "자",

    사: "오",
    유: "오",
    축: "오",
  };

  return groupMap[yearBranchOrDayBranch] || null;
}

function getHorseBranch(yearBranchOrDayBranch) {
  const groupMap = {
    신: "인",
    자: "인",
    진: "인",

    인: "신",
    오: "신",
    술: "신",

    해: "사",
    묘: "사",
    미: "사",

    사: "해",
    유: "해",
    축: "해",
  };

  return groupMap[yearBranchOrDayBranch] || null;
}

function getHwayeopBranch(yearBranchOrDayBranch) {
  const groupMap = {
    신: "자",
    자: "자",
    진: "자",

    인: "오",
    오: "오",
    술: "오",

    해: "묘",
    묘: "묘",
    미: "묘",

    사: "유",
    유: "유",
    축: "유",
  };

  return groupMap[yearBranchOrDayBranch] || null;
}

function analyzeUsefulStars(pillars) {
  const dayStem = pillars.day[0];
  const yearBranch = pillars.year[1];
  const dayBranch = pillars.day[1];

  const allBranches = [
    pillars.year[1],
    pillars.month[1],
    pillars.day[1],
    pillars.hour[1],
  ];

  const stars = [];
  let score = 50;

  const nobleBranches = getNoblemanBranches(dayStem);
  const foundNoble = nobleBranches.filter((b) => allBranches.includes(b));

  if (foundNoble.length) {
    stars.push(`천을귀인(${foundNoble.join(", ")})`);
    score += 14;
  }

  const peach = getPeachBlossomBranch(dayBranch || yearBranch);
  if (peach && allBranches.includes(peach)) {
    stars.push(`도화살(${peach})`);
    score += 6;
  }

  const horse = getHorseBranch(dayBranch || yearBranch);
  if (horse && allBranches.includes(horse)) {
    stars.push(`역마살(${horse})`);
    score += 5;
  }

  const hwayeop = getHwayeopBranch(dayBranch || yearBranch);
  if (hwayeop && allBranches.includes(hwayeop)) {
    stars.push(`화개살(${hwayeop})`);
    score += 4;
  }

  if (!stars.length) {
    stars.push("강한 신살보다 기본 흐름 중심");
  }

  return {
    stars,
    score: clamp(score, 15, 95),
    text: stars.join(" · "),
  };
}

/* ✅ 7단계: 사주 기반 통합 점수 계산 */
/* ✅ 7단계: 사주 기반 통합 점수 계산 - 고정값 최소화 버전 */
function calculateSajuBasedFortune(profile, salt = "today") {
  const profileKey = [
    profile.birthDate || "",
    profile.birthTime || "",
    profile.gender || "",
    profile.calendarType || "",
    salt || "today",
  ].join("|");

  const seed = hashNumber(profileKey);

  const shiftedProfile = {
    ...profile,
    birthDate: `${profile.birthDate || "2000-01-01"}-${salt}-${seed}`,
  };

  const pseudo = calcPseudoSaju(shiftedProfile);
  const pillars = pseudo.pillars;

  const dayStem = pillars.day[0];
  const dayBranch = pillars.day[1];

  const branchList = [
    pillars.year[1],
    pillars.month[1],
    pillars.day[1],
    pillars.hour[1],
  ];

  const tenGods = {
    year: getTenGod(dayStem, pillars.year[0]),
    month: getTenGod(dayStem, pillars.month[0]),
    day: "일간",
    hour: getTenGod(dayStem, pillars.hour[0]),
    yearBranch: getBranchTenGod(dayStem, pillars.year[1]),
    monthBranch: getBranchTenGod(dayStem, pillars.month[1]),
    dayBranch: getBranchTenGod(dayStem, pillars.day[1]),
    hourBranch: getBranchTenGod(dayStem, pillars.hour[1]),
  };

  const stages = {
    year: getTwelveStage(dayStem, pillars.year[1]),
    month: getTwelveStage(dayStem, pillars.month[1]),
    day: getTwelveStage(dayStem, pillars.day[1]),
    hour: getTwelveStage(dayStem, pillars.hour[1]),
  };

  const relation = analyzeBranchRelations(branchList);
  const stars = analyzeUsefulStars(pillars);
  const element = analyzeElementBalance(pillars);

  const stageScores = [
    getTwelveStageScore(stages.year),
    getTwelveStageScore(stages.month),
    getTwelveStageScore(stages.day),
    getTwelveStageScore(stages.hour),
  ];

  const stageAvg = Math.round(
    stageScores.reduce((sum, v) => sum + v, 0) / stageScores.length
  );

  const tenGodScoreMap = {
    비견: 57,
    겁재: 43,
    식신: 77,
    상관: 49,
    편재: 73,
    정재: 79,
    편관: 46,
    정관: 75,
    편인: 52,
    정인: 71,
    일간: 61,
    미상: 48,
  };

  const tenGodValues = Object.values(tenGods).map(
    (tg) => tenGodScoreMap[tg] || 48
  );

  const tenGodAvg = Math.round(
    tenGodValues.reduce((sum, v) => sum + v, 0) / tenGodValues.length
  );

  const seedA = seed % 100;
  const seedB = Math.floor(seed / 7) % 100;
  const seedC = Math.floor(seed / 13) % 100;
  const seedD = Math.floor(seed / 23) % 100;

  const personalWave = clamp(
    stageAvg * 0.28 +
      tenGodAvg * 0.24 +
      element.score * 0.22 +
      relation.score * 0.16 +
      stars.score * 0.1 +
      (seedA - 50) * 0.18,
    15,
    95
  );

  const total = clamp(
    personalWave * 0.35 +
      element.score * 0.2 +
      relation.score * 0.18 +
      stageAvg * 0.17 +
      tenGodAvg * 0.1,
    15,
    95
  );

  const money = clamp(
    tenGodAvg * 0.33 +
      element.score * 0.27 +
      stageScores[1] * 0.18 +
      relation.score * 0.12 +
      stars.score * 0.1 +
      (seedB - 50) * 0.15,
    15,
    95
  );

  const love = clamp(
    stars.score * 0.3 +
      relation.score * 0.25 +
      stageScores[2] * 0.18 +
      tenGodAvg * 0.17 +
      element.score * 0.1 +
      (seedC - 50) * 0.16,
    15,
    95
  );

  const happy = clamp(
    total * 0.28 +
      stageAvg * 0.23 +
      stars.score * 0.2 +
      relation.score * 0.16 +
      element.score * 0.13 +
      (seedD - 50) * 0.12,
    15,
    95
  );

  const move = clamp(
    relation.score * 0.26 +
      stars.score * 0.22 +
      stageScores[3] * 0.2 +
      element.score * 0.17 +
      tenGodAvg * 0.15 +
      (seedA - 50) * 0.14,
    15,
    95
  );

  const accidentRisk = clamp(
    100 -
      (
        relation.score * 0.32 +
        stageScores[2] * 0.24 +
        element.score * 0.18 +
        stars.score * 0.14 +
        tenGodAvg * 0.12
      ) +
      relation.clash.length * 9 +
      (seedB % 9),
    10,
    85
  );

  const stress = clamp(
    100 -
      (
        relation.score * 0.28 +
        stageAvg * 0.24 +
        element.score * 0.18 +
        stars.score * 0.16 +
        tenGodAvg * 0.14
      ) +
      relation.clash.length * 8 +
      (seedC % 10),
    10,
    85
  );

  return {
    total,
    love,
    money,
    happy,
    move,
    accident: accidentRisk,
    accidentRisk,
    conflict: stress,
    stress,

    saju: {
      summary: `${pillars.year} / ${pillars.month} / ${pillars.day} / ${pillars.hour} · 일간 ${dayStem}${dayBranch}`,
      element: element.strong[0] || FIVE_ELEMENTS[dayStem],
      tenGod: tenGods.month,
      twelveStage: stages.day,
      detail: {
        pillars,
        tenGods,
        stages,
        relation,
        stars,
        element,
        stageAvg,
        tenGodAvg,
        personalWave,
      },
    },

    qimen: {
      door:
        relation.clash.length >= 2
          ? "상문"
          : relation.combo.length || relation.harmony.length
          ? "생문"
          : total >= 70
          ? "개문"
          : "휴문",
      direction:
        element.weak[0] === "목"
          ? "동"
          : element.weak[0] === "화"
          ? "남"
          : element.weak[0] === "금"
          ? "서"
          : element.weak[0] === "수"
          ? "북"
          : "중앙",
    },

    iching: {
      main:
        total >= 82
          ? "지천태"
          : money >= 78
          ? "화천대유"
          : love >= 78
          ? "택산함"
          : move >= 75
          ? "뢰지예"
          : stress >= 65 || accidentRisk >= 65
          ? "중수감"
          : total >= 65
          ? "풍뢰익"
          : total >= 45
          ? "수화기제"
          : "화수미제",
      changingLine: Math.max(
        1,
        Math.min(6, (relation.clash.length + relation.combo.length + seedA) % 6 + 1)
      ),
      changed:
        total >= 75
          ? "화천대유"
          : total >= 55
          ? "뢰풍항"
          : accidentRisk >= 65
          ? "산천대축"
          : "화수미제",
    },
  };
}

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function StatBar({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function NoticeBox() {
  return (
    <div className="rounded-2xl border border-violet-400/20 bg-slate-950/70 p-4 shadow-xl">
      <div className="flex items-center gap-2 text-sm font-bold text-violet-200">
        <ShieldAlert size={18} />
        필수 공지
      </div>

      <p className="mt-2 text-xs leading-6 text-slate-300">
        본 서비스는 사주팔자·대운·세운·월운·일운·시운과 통계 데이터를
        기반으로 한 참고용 운세 서비스입니다.
      </p>
    </div>
  );
}



 
function ProfileForm({ profile, setProfile, setTab }) {
  const [temp, setTemp] = useState(profile);

  const [saved, setSaved] = useState(false);

  function save() {
    setProfile(temp);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(temp)
    );

    setSaved(true);

    setTimeout(() => setSaved(false), 1500);
  }

  function reset() {
    setTemp(defaultProfile);

    setProfile(defaultProfile);

    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-2xl">
        <p className="text-xs text-violet-300">
          처음 입력
        </p>

        <h2 className="mt-1 text-3xl font-black text-white">
          생년월일시 입력
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          회원가입 없이 기기에만 저장됩니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5">
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <UserRound size={16} />
                닉네임
              </span>

              <input
                value={temp.nickname}
                onChange={(e) =>
                  setTemp({
                    ...temp,
                    nickname: e.target.value,
                  })
                }
                placeholder="예: 민준"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none"
              />
            </label>

            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <CalendarCheck size={16} />
                생년월일
              </span>

              <input
                type="date"
                value={temp.birthDate}
                onChange={(e) =>
                  setTemp({
                    ...temp,
                    birthDate: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none"
              />
            </label>

            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <Clock size={16} />
                태어난 시간
              </span>

              <input
                type="time"
                value={temp.birthTime}
                onChange={(e) =>
                  setTemp({
                    ...temp,
                    birthTime: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none"
              />
            </label>

                        <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-sm font-bold text-slate-200">
                  성별
                </span>

                <select
                  value={temp.gender}
                  onChange={(e) =>
                    setTemp({
                      ...temp,
                      gender: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
                >
                  <option>선택 안 함</option>
                  <option>남성</option>
                  <option>여성</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold text-slate-200">
                  달력
                </span>

                <select
                  value={temp.calendarType}
                  onChange={(e) =>
                    setTemp({
                      ...temp,
                      calendarType: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
                >
                  <option>양력</option>
                  <option>음력</option>
                </select>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={save}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 font-bold text-white"
              >
                <Save size={18} />
                저장하고 운세 보기
              </button>

              <button
                onClick={reset}
                className="rounded-xl bg-white/10 px-4 py-3 text-slate-200"
              >
                <RotateCcw size={18} />
              </button>
            </div>

          {saved && (
  <div className="space-y-3 rounded-xl bg-emerald-500/15 p-3 text-sm text-emerald-200">
    <div>
      저장 완료. 이제 홈, 캘린더, 당사주에서 운세를 확인할 수 있습니다.
    </div>

   <div className="grid grid-cols-3 gap-2">
  <button
    onClick={() => setTab("home")}
    className="rounded-lg bg-cyan-500/30 px-3 py-2 text-xs font-bold text-cyan-100"
  >
    홈 보기
  </button>

  <button
    onClick={() => setTab("calendar")}
    className="rounded-lg bg-blue-500/30 px-3 py-2 text-xs font-bold text-blue-100"
  >
    캘린더
  </button>

  <button
    onClick={() => setTab("life")}
    className="rounded-lg bg-violet-500/30 px-3 py-2 text-xs font-bold text-violet-100"
  >
    당사주
  </button>
</div>
  </div>
)}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5">
          <h3 className="text-xl font-black text-white">
            입력 후 가능한 기능
          </h3>

          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-xl bg-white/[0.04] p-3">
              ✔ 오늘의 운세 흐름 계산
            </div>

            <div className="rounded-xl bg-white/[0.04] p-3">
              ✔ 대운·세운·월운·일운·시운 보기
            </div>

            <div className="rounded-xl bg-white/[0.04] p-3">
              ✔ 12지신 방향운 보기
            </div>

            <div className="rounded-xl bg-white/[0.04] p-3">
              ✔ 기록/피드백 로컬 저장
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
  <h3 className="text-lg font-black text-white">
    입력값 미리보기
  </h3>

  <div className="mt-3 grid gap-2 text-sm text-slate-300">
    <div className="rounded-xl bg-white/[0.04] p-3">
      닉네임: {temp.nickname || "아직 입력 안 함"}
    </div>

    <div className="rounded-xl bg-white/[0.04] p-3">
      생년월일: {temp.birthDate || "아직 입력 안 함"}
    </div>

    <div className="rounded-xl bg-white/[0.04] p-3">
      태어난 시간: {temp.birthTime || "12:00"}
    </div>

    <div className="rounded-xl bg-white/[0.04] p-3">
      성별 / 달력: {temp.gender} · {temp.calendarType}
    </div>
  </div>
</div>

<div className="mt-4 rounded-2xl border border-violet-400/20 bg-violet-500/5 p-4">
  <h3 className="text-lg font-black text-white">
    입력 후 분석되는 항목
  </h3>

  <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
    <div className="rounded-xl bg-white/[0.04] p-3">
      ✔ 오늘의 종합운
    </div>

    <div className="rounded-xl bg-white/[0.04] p-3">
      ✔ 재물운·인연운
    </div>

    <div className="rounded-xl bg-white/[0.04] p-3">
      ✔ 당사주·토정비결
    </div>

    <div className="rounded-xl bg-white/[0.04] p-3">
      ✔ 삼재·귀인·살
    </div>

    <div className="rounded-xl bg-white/[0.04] p-3">
      ✔ 월별 흐름
    </div>

    <div className="rounded-xl bg-white/[0.04] p-3">
      ✔ 방향운·이동운
    </div>
  </div>
</div>

<div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-500/5 p-4">
  <h3 className="text-lg font-black text-white">
    입력 안내
  </h3>

  <p className="mt-2 text-sm leading-6 text-slate-300">
    태어난 시간을 모르면 기본값 12:00으로 입력해도 됩니다.
    다만 시간이 정확할수록 시주와 방향운 해석이 더 자연스럽게 계산됩니다.
  </p>
</div>
          
          <div className="mt-5">
            <NoticeBox />
          </div>
        </div>
      </div>
    </div>
  );
}
function UserHome({ profile, data, setTab }) {
  const todayFortune = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    return makeDynamicFortune(profile, todayKey);
  }, [profile.birthDate, profile.birthTime, profile.gender, profile.calendarType]);


  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 md:p-6">
        <p className="text-xs text-violet-300 md:text-sm">
          오늘의 운세 흐름
        </p>

        <h1 className="mt-2 text-2xl font-black text-white md:text-4xl">
          {profile.nickname || "사용자"}님의 운세
        </h1>

        <div className="mt-4 grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/[0.04] p-3 md:p-4">
            <div className="text-xs text-slate-400">종합운</div>
            <div className="mt-1 text-3xl font-black text-cyan-300 md:text-4xl">
              {todayFortune.total}%
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.04] p-3 md:p-4">
            <div className="text-xs text-slate-400">인연운</div>
            <div className="mt-1 text-3xl font-black text-pink-300 md:text-4xl">
              {todayFortune.love}%
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.04] p-3 md:p-4">
            <div className="text-xs text-slate-400">금전운</div>
            <div className="mt-1 text-3xl font-black text-yellow-300 md:text-4xl">
              {todayFortune.money}%
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.04] p-3 md:p-4">
            <div className="text-xs text-slate-400">행복지수</div>
            <div className="mt-1 text-3xl font-black text-emerald-300 md:text-4xl">
              {todayFortune.happy}%
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white/[0.04] p-3 md:mt-5 md:p-4">
          <div className="text-sm font-bold text-cyan-300">
            오늘의 사주 흐름
          </div>

          <p className="mt-2 text-xs text-slate-300 md:text-sm">
            {todayFortune.saju.summary}
          </p>

          <div className="mt-3 text-xs text-violet-300">
            기문: {todayFortune.qimen.door}
            / 길방향: {todayFortune.qimen.direction}
          </div>

   <div className="mt-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
  <div className="text-xs font-bold text-yellow-300">
    오늘의 주역괘
  </div>

  <div className="mt-1 text-lg font-black text-yellow-200">
    {todayFortune.iching.main}
  </div>

  <div className="mt-2 text-xs text-slate-400">
    변효 {todayFortune.iching.changingLine}효 · 변괘 {todayFortune.iching.changed}
  </div>

  <div className="mt-3 text-xs leading-6 text-slate-300">
    {{
      "건위천":"강한 추진력과 시작의 괘입니다. 결단은 좋지만 독단은 피해야 합니다.",
      "곤위지":"받아들이고 기다리는 괘입니다. 무리한 추진보다 안정이 유리합니다.",
      "수뢰둔":"초반 장애가 있는 괘입니다. 성급한 시작보다 준비가 필요합니다.",
      "산수몽":"혼란과 배움의 괘입니다. 모르는 일은 확인하고 물어봐야 합니다.",
      "수천수":"기다림의 괘입니다. 당장 결과보다 타이밍을 보는 날입니다.",
      "천수송":"다툼과 논쟁의 괘입니다. 말조심, 계약 확인이 중요합니다.",
      "지수사":"조직과 전략의 괘입니다. 혼자보다 계획과 팀워크가 유리합니다.",
      "수지비":"친화와 협력의 괘입니다. 사람을 만나면 도움을 받을 수 있습니다.",
      "풍천소축":"작게 쌓는 괘입니다. 큰 욕심보다 누적과 관리가 좋습니다.",
      "천택리":"예절과 균형의 괘입니다. 선을 넘지 않는 태도가 중요합니다.",
      "지천태":"막힌 것이 풀리는 길괘입니다. 관계·일·재물 흐름이 좋아질 수 있습니다.",
      "천지비":"소통이 막히는 괘입니다. 무리한 확장보다 방어가 좋습니다.",
      "천화동인":"사람과 함께하는 괘입니다. 인맥, 협업, 귀인운이 좋습니다.",
      "화천대유":"큰 소유의 괘입니다. 성취·재물운이 좋지만 과욕은 주의하세요.",
      "지산겸":"겸손의 괘입니다. 낮추면 오히려 얻는 것이 커집니다.",
      "뢰지예":"기쁨과 움직임의 괘입니다. 외출·활동·표현에 유리합니다.",
      "택뢰수":"즐거움과 유혹의 괘입니다. 과소비와 즉흥 판단은 주의하세요.",
      "산풍고":"고쳐야 할 것을 고치는 괘입니다. 정리·수정·치료에 좋습니다.",
      "지택림":"기회가 다가오는 괘입니다. 사람과 일이 가까이 오는 흐름입니다.",
      "풍지관":"관찰의 괘입니다. 오늘은 행동보다 분석과 판단이 중요합니다.",
      "화뢰서합":"막힌 것을 씹어 깨는 괘입니다. 문제 해결과 결단이 필요합니다.",
      "산화비":"겉모습과 꾸밈의 괘입니다. 이미지·표현·홍보에 유리합니다.",
      "산지박":"깎이고 줄어드는 괘입니다. 손실 방어와 무리한 투자 주의.",
      "지뢰복":"다시 돌아오는 괘입니다. 회복, 재시작, 복구 흐름이 있습니다.",
      "천뢰무망":"뜻밖의 흐름입니다. 억지보다 원칙대로 가야 합니다.",
      "산천대축":"크게 쌓는 괘입니다. 준비·저축·실력 축적에 좋습니다.",
      "산뢰이":"먹고 기르는 괘입니다. 건강, 식사, 말조심이 중요합니다.",
      "택풍대과":"무게가 큰 괘입니다. 부담이 크니 무리한 책임은 피하세요.",
      "중수감":"위험과 함정의 괘입니다. 투자·이동·계약 모두 신중해야 합니다.",
      "중화리":"밝음과 드러남의 괘입니다. 명예·홍보·발표에 유리합니다.",
      "택산함":"감응과 끌림의 괘입니다. 연애·호감·교류운이 강합니다.",
      "뢰풍항":"지속의 괘입니다. 꾸준히 가면 결과가 생깁니다.",
      "천산돈":"물러남의 괘입니다. 오늘은 후퇴·관망도 전략입니다.",
      "뢰천대장":"강한 힘의 괘입니다. 추진력은 좋지만 과격함은 주의.",
      "화지진":"나아감의 괘입니다. 성과·승진·상승 흐름이 있습니다.",
      "지화명이":"빛이 가려진 괘입니다. 드러내기보다 숨기고 버티는 날입니다.",
      "풍화가인":"가정과 내부 질서의 괘입니다. 가까운 사람 관리가 중요합니다.",
      "화택규":"어긋남의 괘입니다. 의견 차이와 오해를 조심하세요.",
      "수산건":"험난함의 괘입니다. 이동·진행이 막힐 수 있어 천천히 가야 합니다.",
      "뢰수해":"풀림의 괘입니다. 답답한 일이 해소될 수 있습니다.",
      "산택손":"덜어내는 괘입니다. 지출·정리·양보가 필요합니다.",
      "풍뢰익":"더해지는 괘입니다. 도움, 이익, 성장 흐름이 있습니다.",
      "택천쾌":"결단의 괘입니다. 끊을 것은 끊고 결정해야 합니다.",
      "천풍구":"우연한 만남의 괘입니다. 갑작스러운 인연·소식이 있습니다.",
      "택지췌":"모이는 괘입니다. 사람, 정보, 돈이 모이는 흐름입니다.",
      "지풍승":"올라가는 괘입니다. 단계적 성장과 승진운이 있습니다.",
      "택수곤":"곤란의 괘입니다. 막힘이 있으니 버티기와 절제가 중요합니다.",
      "수풍정":"우물의 괘입니다. 기본기, 자원, 오래된 기반을 점검하세요.",
      "택화혁":"변혁의 괘입니다. 바꿔야 할 것을 바꾸는 날입니다.",
      "화풍정":"솥의 괘입니다. 준비한 것이 익어 성과로 나올 수 있습니다.",
      "중뢰진":"놀람과 움직임의 괘입니다. 갑작스러운 소식·변동이 있습니다.",
      "간위산":"멈춤의 괘입니다. 움직이기보다 멈춰서 점검해야 합니다.",
      "풍산점":"점진의 괘입니다. 천천히 진행하면 안정적으로 좋아집니다.",
      "뢰택귀매":"성급한 결합의 괘입니다. 연애·계약은 서두르지 마세요.",
      "뢰화풍":"풍성함의 괘입니다. 성과가 커질 수 있지만 관리가 필요합니다.",
      "화산려":"나그네의 괘입니다. 이동·출장·낯선 환경에서 조심하세요.",
      "중풍손":"부드럽게 스며드는 괘입니다. 설득·협상·소통에 좋습니다.",
      "중택태":"기쁨의 괘입니다. 만남·대화·즐거운 일이 생길 수 있습니다.",
      "풍수환":"흩어짐의 괘입니다. 집중력이 약해질 수 있어 정리가 필요합니다.",
      "수택절":"절제의 괘입니다. 돈·말·행동을 줄이면 좋습니다.",
      "풍택중부":"진심과 신뢰의 괘입니다. 솔직함이 관계를 좋게 만듭니다.",
      "뢰산소과":"작은 일은 가능, 큰 일은 무리인 괘입니다. 소규모 실행이 좋습니다.",
      "수화기제":"이미 이룬 괘입니다. 방심하면 무너질 수 있어 관리가 필요합니다.",
      "화수미제":"아직 완성 전의 괘입니다. 마지막 확인과 준비가 필요합니다."
    }[todayFortune.iching.main] || "오늘은 흐름 변화가 큰 날입니다. 주변 상황을 살피며 움직이는 것이 좋습니다."}
  </div>
</div>
        </div>

        <div className="mt-5 flex gap-2">
        

          <button
            onClick={() => setTab("calendar")}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-white md:py-3"
          >
            캘린더 보기
          </button>
        </div>
      </div>

      <DirectionPanel profile={profile} />
<div className="mt-5 grid gap-3 md:grid-cols-2">
  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
    <div className="text-sm font-bold text-emerald-300">
      오늘 최고 흐름 TOP 3
    </div>

    <div className="mt-3 space-y-2">
      {[
        ["재물운", todayFortune.money, "수익·정리·현금 흐름"],
        ["인연운", todayFortune.love, "사람·연락·관계 흐름"],
        ["행복지수", todayFortune.happy, "기분·만족·활력 흐름"],
      ]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([title, score, text]) => (
          <div key={title} className="rounded-xl bg-black/20 p-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white">{title}</div>

              <div className="font-black text-emerald-300">
                {score}%
              </div>
            </div>

            <div className="mt-1 text-xs text-slate-400">
              {score >= 80
                ? `${text}이 매우 강합니다.`
                : score >= 65
                ? `${text}이 좋은 편입니다.`
                : score >= 45
                ? `${text}은 무난합니다.`
                : `${text}은 조심해야 합니다.`}
            </div>
          </div>
        ))}
    </div>
  </div>

  <div className="rounded-2xl border border-rose-400/20 bg-rose-500/5 p-4">
    <div className="text-sm font-bold text-rose-300">
      오늘 조심할 흐름
    </div>

    <div className="mt-3 space-y-2">
      {[
        ["사고주의", todayFortune.accidentRisk || todayFortune.accident || 35, "이동·기계·몸 컨디션 주의"],
        ["스트레스", todayFortune.stress || todayFortune.conflict || 40, "말다툼·감정 반응 주의"],
        ["과소비", 100 - todayFortune.money, "충동 소비와 손실 만회 심리 주의"],
      ]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([title, score, text]) => (
          <div key={title} className="rounded-xl bg-black/20 p-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white">{title}</div>

              <div className="font-black text-rose-300">
                {score}%
              </div>
            </div>

            <div className="mt-1 text-xs text-slate-400">
              {score >= 70
                ? `${text}. 오늘은 강하게 주의해야 합니다.`
                : score >= 50
                ? `${text}. 한 번 더 확인하세요.`
                : `${text}. 큰 위험은 낮은 편입니다.`}
            </div>
          </div>
        ))}
    </div>
  </div>
</div>

<div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
  <div className="text-sm font-bold text-cyan-300">
    시간대별 흐름
  </div>

  <div className="mt-4 grid gap-3 md:grid-cols-4">
    {[
      ["새벽", Math.max(35, todayFortune.total - 18), "회복·정리"],
      ["오전", Math.max(40, todayFortune.total - 5), "준비·확인"],
      ["오후", Math.min(95, todayFortune.total + 12), "실행·결정"],
      ["밤", Math.max(35, todayFortune.happy - 7), "감정·휴식"],
    ].map(([time, score, text]) => (
      <div key={time} className="rounded-xl bg-black/20 p-3">
        <div className="text-sm font-bold text-white">{time}</div>

        <div className="mt-2 text-2xl font-black text-cyan-300">
          {score}%
        </div>

        <div className="mt-1 text-xs text-slate-400">
          {score >= 80
            ? `${text} 흐름 매우 좋음`
            : score >= 65
            ? `${text} 흐름 좋음`
            : score >= 45
            ? `${text} 흐름 보통`
            : `${text} 흐름 주의`}
        </div>
      </div>
    ))}
  </div>
</div>

<div className="mt-5 grid gap-3 md:grid-cols-2">
  <div className="rounded-2xl border border-violet-400/20 bg-violet-500/5 p-4">
    <div className="text-sm font-bold text-violet-300">
      오늘 추천 행동
    </div>

    <div className="mt-3 grid gap-2 text-sm text-slate-300">
      {todayFortune.money >= 70 && (
        <div className="rounded-xl bg-black/20 p-3">
          ✔ 지출 정리·수익 실현·현금 흐름 점검
        </div>
      )}

      {todayFortune.love >= 70 && (
        <div className="rounded-xl bg-black/20 p-3">
          ✔ 연락·만남·관계 회복 시도
        </div>
      )}

      {todayFortune.total >= 70 && (
        <div className="rounded-xl bg-black/20 p-3">
          ✔ 중요한 일 진행·미뤘던 작업 처리
        </div>
      )}

      {todayFortune.total < 70 && (
        <div className="rounded-xl bg-black/20 p-3">
          ✔ 무리한 결정 대신 정리·점검·계획 세우기
        </div>
      )}
    </div>
  </div>

  <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/5 p-4">
    <div className="text-sm font-bold text-yellow-300">
      오늘 피해야 할 행동
    </div>

    <div className="mt-3 grid gap-2 text-sm text-slate-300">
      {(todayFortune.accidentRisk || todayFortune.accident || 0) >= 50 && (
        <div className="rounded-xl bg-black/20 p-3">
          ⚠ 무리한 이동·야간 운전·위험한 작업
        </div>
      )}

      {(todayFortune.stress || todayFortune.conflict || 0) >= 50 && (
        <div className="rounded-xl bg-black/20 p-3">
          ⚠ 말다툼·즉흥 답장·감정적 반응
        </div>
      )}

      {todayFortune.money < 60 && (
        <div className="rounded-xl bg-black/20 p-3">
          ⚠ 충동구매·손실 만회성 투자
        </div>
      )}

      {todayFortune.money >= 60 &&
        (todayFortune.stress || todayFortune.conflict || 0) < 50 &&
        (todayFortune.accidentRisk || todayFortune.accident || 0) < 50 && (
          <div className="rounded-xl bg-black/20 p-3">
            ⚠ 큰 위험은 낮지만 과욕은 피하기
          </div>
        )}
    </div>
  </div>

  </div>

  <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/5 p-4">
    <div className="text-sm font-bold text-yellow-300">
      오늘 좋은 방향
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2">
      {[
        ["동남", "재물 흐름"],
        ["북동", "귀인 흐름"],
        ["남", "활동 흐름"],
        ["서", "휴식 추천"],
      ].map(([dir, text]) => (
        <div
          key={dir}
          className="rounded-xl bg-black/20 p-3"
        >
          <div className="font-bold text-white">
            {dir}
          </div>

          <div className="mt-1 text-xs text-slate-400">
            {text}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
  );
}
/* ✅ 8단계: 12지신 방향운 계산 - 사주 기반 버전 */
function calcDirectionScores(profile) {
  const todayKey = new Date().toISOString().slice(0, 10);

  const fortune = calculateSajuBasedFortune(profile, todayKey);
  const detail = fortune.saju.detail;

  const pillars = detail.pillars;
  const element = detail.element;
  const relation = detail.relation;
  const stars = detail.stars;
  const stages = detail.stages;
  const tenGods = detail.tenGods;

  const profileKey = [
    profile.birthDate || "",
    profile.birthTime || "",
    profile.gender || "",
    profile.calendarType || "",
    todayKey,
    pillars.year,
    pillars.month,
    pillars.day,
    pillars.hour,
  ].join("|");

  const seed = hashNumber(profileKey);

  const items = [
    ["자", "북", "수"],
    ["축", "북동", "토"],
    ["인", "동북", "목"],
    ["묘", "동", "목"],
    ["진", "동남", "토"],
    ["사", "남동", "화"],
    ["오", "남", "화"],
    ["미", "남서", "토"],
    ["신", "서남", "금"],
    ["유", "서", "금"],
    ["술", "서북", "토"],
    ["해", "북서", "수"],
  ];

  const tenGodBonus = {
    정재: 9,
    편재: 7,
    정관: 8,
    식신: 7,
    정인: 6,
    비견: 3,
    편인: 1,
    상관: -2,
    편관: -4,
    겁재: -5,
    미상: 0,
  };

  const stageBonus = {
    장생: 10,
    관대: 7,
    건록: 9,
    제왕: 11,
    양: 4,
    태: 3,
    목욕: 0,
    쇠: -2,
    묘: -4,
    병: -7,
    사: -9,
    절: -11,
    미상: 0,
  };

  return items.map(([zodiac, dir, dirElement], index) => {
    const branchTenGod = getBranchTenGod(pillars.day[0], zodiac);
    const branchStage = getTwelveStage(pillars.day[0], zodiac);

    const elementMatch =
      element.weak.includes(dirElement)
        ? 16
        : element.strong.includes(dirElement)
        ? -7
        : 4;

    const clashPenalty =
      BRANCH_CLASH[pillars.day[1]] === zodiac ||
      BRANCH_CLASH[pillars.year[1]] === zodiac
        ? -18
        : 0;

    const comboBonus =
      BRANCH_COMBINATION[pillars.day[1]] === zodiac ||
      BRANCH_COMBINATION[pillars.year[1]] === zodiac
        ? 13
        : 0;

    const harmonyBonus = THREE_HARMONY.some(([a, b, c]) => {
      const group = [a, b, c];
      return (
        group.includes(zodiac) &&
        (group.includes(pillars.day[1]) || group.includes(pillars.year[1]))
      );
    })
      ? 9
      : 0;

    const starBonus =
      stars.stars.some((s) => s.includes(zodiac)) ? 8 : 0;

    const dayBranchBonus =
      zodiac === pillars.day[1] ? 6 : 0;

    const yearBranchBonus =
      zodiac === pillars.year[1] ? 4 : 0;

    const timeWave =
      ((seed >> (index % 8)) % 13) - 6;

    const rawScore =
      detail.stageAvg * 0.2 +
      detail.tenGodAvg * 0.18 +
      element.score * 0.2 +
      relation.score * 0.17 +
      stars.score * 0.12 +
      fortune.move * 0.13 +
      elementMatch +
      clashPenalty +
      comboBonus +
      harmonyBonus +
      starBonus +
      dayBranchBonus +
      yearBranchBonus +
      (tenGodBonus[branchTenGod] || 0) +
      (stageBonus[branchStage] || 0) +
      timeWave;

    const score = clamp(rawScore, 15, 95);

    const reasonParts = [];

    if (elementMatch > 10) {
      reasonParts.push(`부족한 오행 ${dirElement} 보완`);
    } else if (elementMatch < 0) {
      reasonParts.push(`강한 오행 ${dirElement} 과다 주의`);
    } else {
      reasonParts.push(`${dirElement} 오행 균형`);
    }

    if (comboBonus > 0) reasonParts.push("육합 흐름");
    if (harmonyBonus > 0) reasonParts.push("삼합 보조");
    if (clashPenalty < 0) reasonParts.push("충돌 기운 주의");
    if (starBonus > 0) reasonParts.push("귀인·신살 반응");
    if (stageBonus[branchStage] > 6) reasonParts.push(`${branchStage} 운성 강함`);
    if (tenGodBonus[branchTenGod] > 5) reasonParts.push(`${branchTenGod} 흐름 양호`);

    const reason = reasonParts.join(" · ");

    return [zodiac, dir, score, dirElement, reason];
  });
}
function DirectionPanel({ profile }) {
  const directions = calcDirectionScores(profile);
  const [fromPlace, setFromPlace] = useState("");
  const [toPlace, setToPlace] = useState("");
  const [directionIndex, setDirectionIndex] = useState(1);
  const [loading, setLoading] = useState(false);

  async function searchPlace(query) {
    const url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
      encodeURIComponent(query);

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    const data = await res.json();
    if (!data || data.length === 0) return null;

    return {
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
      name: data[0].display_name,
    };
  }

  function angleToDirectionIndex(angle) {
    return Math.round(angle / 30) % 12;
  }

  async function analyzeDirection() {
    if (!fromPlace.trim() || !toPlace.trim()) {
      alert("출발지와 목적지를 모두 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      const start = await searchPlace(fromPlace);
      const end = await searchPlace(toPlace);

      if (!start || !end) {
        alert("장소를 찾지 못했습니다. 예: 서울역, 부산역, Tokyo Station");
        return;
      }

      const dx = end.lng - start.lng;
      const dy = end.lat - start.lat;

      let angle = Math.atan2(dx, dy) * 180 / Math.PI;
      if (angle < 0) angle += 360;

      setDirectionIndex(angleToDirectionIndex(angle));
    } catch (error) {
      alert("장소 검색 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const picked = directions[directionIndex];
  const pickedZodiac = picked[0];
  const pickedDirection = picked[1];
  const pickedScore = picked[2];
  const pickedElement = picked[3];
  const pickedReason = picked[4];
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 md:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white md:text-base">
          내 위치 기준 12지신 방향운
        </h3>
        <MapPin size={16} className="text-cyan-300" />
      </div>

      <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
        <input
          value={fromPlace}
          onChange={(e) => setFromPlace(e.target.value)}
          placeholder="출발지 예: 서울역"
          className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white outline-none md:px-4 md:py-3 md:text-sm"
        />

        <input
          value={toPlace}
          onChange={(e) => setToPlace(e.target.value)}
          placeholder="목적지 예: 부산역"
          className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white outline-none md:px-4 md:py-3 md:text-sm"
        />

        <button
          onClick={analyzeDirection}
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-50 md:px-5 md:py-3 md:text-sm"
        >
          {loading ? "검색중..." : "분석하기"}
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_310px]">
        <div className="relative min-h-[390px] overflow-visible rounded-2xl border border-white/10 bg-[#07111f] p-2 md:min-h-[560px] md:p-4">
          <div className="relative mx-auto mt-8 aspect-square max-w-[330px] md:max-w-[520px]">
            <div className="absolute left-1/2 top-1/2 h-[84%] w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-300/30" />

            {directions.map(([zodiac, dir, score], index) => {
              const angle = index * 30 - 90;
              const rad = (angle * Math.PI) / 180;
              const radius = 42;
              const x = 50 + radius * Math.cos(rad);
              const y = 50 + radius * Math.sin(rad);
              const active = zodiac === pickedZodiac;

              return (
                <div
                  key={zodiac}
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div
                    className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl border bg-slate-950/90 text-xl font-black shadow-xl md:h-16 md:w-16 md:rounded-2xl md:text-3xl ${
                      active
                        ? "scale-110 border-cyan-300 text-cyan-200 shadow-cyan-500/40"
                        : "border-lime-400 text-lime-200"
                    }`}
                  >
                    {zodiac}
                  </div>

                  <div className="mt-1 text-[10px] text-slate-300 md:text-xs">
                    {dir}
                  </div>

                 <div className="mx-auto mt-1 w-fit rounded-full bg-black/80 px-2 py-1 text-center">
  <div className="text-[10px] font-bold text-white md:text-xs">
    {score}%
  </div>

  <div className="text-[9px] text-cyan-200 md:text-[10px]">
    {directions[index][3]}
  </div>
</div>
                </div>
              );
            })}

            <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/50 bg-blue-500/30 p-1.5 shadow-xl shadow-blue-500/40 md:h-20 md:w-20 md:p-2">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white md:text-xs">
                내 위치
              </div>
            </div>

            <div
              className="absolute left-1/2 top-1/2 h-1 origin-left border-t-2 border-dashed border-white/80"
              style={{
                width: "36%",
                transform: `rotate(${directionIndex * 30 - 90}deg)`,
              }}
            />
          </div>

          <div className="relative mt-3 rounded-xl border border-white/10 bg-black/30 p-2 text-[10px] leading-5 text-slate-300 md:p-3 md:text-xs">
            <span className="text-emerald-300">80%↑ 매우 좋음</span>
            <span className="ml-2 text-lime-300">60~79 좋음</span>
            <span className="ml-2 text-yellow-300">40~59 보통</span>
            <span className="ml-2 text-orange-300">20~39 주의</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
          <h3 className="text-lg font-black text-white md:text-xl">
            이동 방향 분석 결과
          </h3>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs text-slate-400">주 이동 방향</div>
            <div className="mt-1 text-2xl font-black text-violet-300 md:text-3xl">
              {pickedDirection}
            </div>

            <div className="mt-4 text-xs text-slate-400">12지신 방향</div>
            <div className="mt-1 text-2xl font-black text-blue-300 md:text-3xl">
              {pickedZodiac}
            </div>

            <div className="mt-4 text-xs text-slate-400">이동운 점수</div>
            <div className="mt-1 text-3xl font-black text-yellow-300 md:text-4xl">
              {pickedScore}%
            </div>
            <div className="mt-4 text-xs text-slate-400">방위 오행</div>
<div className="mt-1 text-xl font-black text-emerald-300">
  {pickedElement}
</div>

<div className="mt-4 rounded-xl bg-white/[0.04] p-3 text-xs leading-5 text-slate-300">
  {pickedReason}
</div>
            <div className="mt-4">
  <div className="mb-2 text-sm font-bold text-cyan-300">
    12방향 점수 순위
  </div>

  <div className="grid grid-cols-2 gap-2">
    {[...directions]
      .sort((a, b) => b[2] - a[2])
      .map(([zodiac, dir, score, element], idx) => (
        <div
          key={zodiac}
          className="rounded-xl border border-white/10 bg-white/[0.04] p-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-white">
                {idx + 1}. {zodiac}
              </div>

              <div className="text-[10px] text-slate-400">
                {dir} · {element}
              </div>
            </div>

            <div className="text-lg font-black text-yellow-300">
              {score}%
            </div>
          </div>
        </div>
      ))}
  </div>
</div>
          </div>
        </div>
      </div>
    </div>
  );
}


function CalendarPage({ profile, setSelectedFortune }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const today = now.getDate();

  const days = Array.from(
    { length: new Date(year, month, 0).getDate() },
    (_, i) => {
      const day = i + 1;
      return makeDynamicFortune(profile, `${year}-${month}-${day}`);
    }
  );

  const firstDay = new Date(year, month - 1, 1).getDay();
  const blanks = Array.from({ length: firstDay });

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-2 md:p-5">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-[11px] text-violet-300">불교 달력형 운세</p>
          <h2 className="mt-1 text-lg font-black text-white md:text-3xl">
            {year}년 {month}월
          </h2>
        </div>

        <div className="rounded-lg bg-violet-500/15 px-2 py-1 text-[10px] font-bold text-violet-200 md:px-3 md:py-2 md:text-xs">
          오늘 {today}일
        </div>
      </div>

      <div className="grid w-full grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
        {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
          <div
            key={d}
            className={i === 0 ? "text-rose-300" : i === 6 ? "text-cyan-300" : ""}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid w-full grid-cols-7 gap-1">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="min-h-[58px] md:min-h-[118px]" />
        ))}

        {days.map((fortune, i) => {
          const dayNum = i + 1;
          const currentDate = new Date(year, month - 1, dayNum);
          const isToday = dayNum === today;
          const ganji = getGanjiName(currentDate);

          const boxClass =
            isToday
              ? "border-violet-400 bg-violet-500/20"
              : fortune.total >= 80
              ? "border-emerald-400/40 bg-emerald-500/15"
              : fortune.total >= 65
              ? "border-cyan-400/30 bg-cyan-500/10"
              : fortune.total >= 45
              ? "border-yellow-400/30 bg-yellow-500/10"
              : "border-rose-400/30 bg-rose-500/10";

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => {
                setSelectedFortune({
                  ...fortune,
                  date: currentDate,
                });
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }, 50);
              }}
              className={`min-w-0 rounded-lg border p-1 text-center active:scale-95 md:rounded-xl md:p-3 ${boxClass}`}
            >
              <div className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-black/30 text-[10px] font-black text-white md:h-7 md:w-7 md:text-xs">
                {dayNum}
              </div>

              <div className="mt-1 text-[10px] font-black leading-tight text-white md:text-lg">
                {ganji}
              </div>

              <div className="mt-1 text-[9px] font-bold text-cyan-300 md:text-xs">
                {fortune.total}
              </div>

              <div className="hidden text-[10px] text-violet-300 md:block">
                {fortune.saju.element} · {fortune.saju.tenGod}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-slate-400 md:text-xs">
        날짜를 누르면 해당 날짜의 상세 운세 지표가 표시됩니다.
      </p>
    </section>
  );
}

function getScoreLabel(score) {
  if (score >= 80) return "매우 좋음";
  if (score >= 60) return "좋음";
  if (score >= 40) return "보통";
  if (score >= 20) return "주의";
  return "매우 주의";
}

function getScoreColor(score) {
  if (score >= 80) return "text-emerald-300 bg-emerald-500/10";
  if (score >= 60) return "text-cyan-300 bg-cyan-500/10";
  if (score >= 40) return "text-yellow-300 bg-yellow-500/10";
  if (score >= 20) return "text-orange-300 bg-orange-500/10";
  return "text-rose-300 bg-rose-500/10";
}

function StatCard({ label, value, caution = false }) {
  const displayValue = Math.round(value);
  const finalScore = caution ? 100 - displayValue : displayValue;
  const labelText = getScoreLabel(finalScore);
  const color = getScoreColor(finalScore);

  return (
<div className="rounded-xl border border-white/10 bg-white/[0.04] p-2 md:p-3">
      <div className="flex items-center justify-between">
       <div className="text-[10px] md:text-xs font-bold text-white">{label}</div>
        <div className={`rounded-full px-2 py-1 text-[11px] font-bold ${color}`}>
          {labelText}
        </div>
      </div>

  <div className="mt-0.5 text-[18px] md:text-base font-black text-white">
        {displayValue}%
      </div>

    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300"
          style={{ width: `${displayValue}%` }}
        />
      </div>
    </div>
  );
}

function StatsPage({ todayFortune, data }) {
  const baseTotal =
    todayFortune && todayFortune.total
      ? todayFortune.total
      : data && data.scores && data.scores.total
      ? data.scores.total
      : 60;

  const monthlyStats = Array.from({ length: 30 }, (_, i) => {
    const seed = (baseTotal + i * 13) % 100;

    return {
      day: i + 1,
      total: 45 + (seed % 50),
      money: 40 + ((seed * 3) % 60),
      love: 35 + ((seed * 5) % 65),
      health: 50 + ((seed * 7) % 45),
      move: 30 + ((seed * 11) % 70),
    };
  });

  const avg = (key) =>
    Math.round(
      monthlyStats.reduce((a, b) => a + b[key], 0) / monthlyStats.length
    );

  const bestDays = monthlyStats.slice().sort((a, b) => b.total - a.total).slice(0, 5);
  const worstDays = monthlyStats.slice().sort((a, b) => a.total - b.total).slice(0, 5);

  function AnalysisCard({ title, children }) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-sm font-bold text-cyan-300">{title}</div>
        <div className="mt-2 text-sm leading-6 text-slate-300">{children}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <p className="text-xs text-cyan-300">최근 30일 운세 분석</p>
        <h2 className="mt-1 text-2xl font-black text-white">운세 데이터 분석실</h2>
        <p className="mt-2 text-xs text-slate-400">
          최근 흐름의 평균값과 강한 날·약한 날을 분석합니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ["재물운", avg("money"), "text-yellow-300"],
          ["연애운", avg("love"), "text-pink-300"],
          ["건강운", avg("health"), "text-emerald-300"],
          ["이동운", avg("move"), "text-orange-300"],
          ["종합운", avg("total"), "text-cyan-300"],
        ].map(([title, score, color]) => (
          <div key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div className={`text-sm font-bold ${color}`}>{title}</div>
            <div className="mt-2 text-2xl font-black text-white">{score}%</div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-400" style={{ width: `${score}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <h3 className="text-xl font-black text-white">최근 30일 흐름</h3>

        <div className="mt-4 flex items-end gap-1 overflow-x-auto pb-2">
          {monthlyStats.map((d) => (
            <div key={d.day} className="flex min-w-[26px] flex-col items-center">
              <div
                className="w-full rounded-t-md bg-cyan-400"
                style={{ height: `${d.total * 1.2}px` }}
              />
              <div className="mt-1 text-[10px] text-slate-400">{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <h3 className="text-lg font-black text-emerald-300">가장 좋은 날 TOP 5</h3>
          <div className="mt-3 space-y-2">
            {bestDays.map((d, idx) => (
              <div key={d.day} className="flex justify-between rounded-xl bg-black/20 p-3">
                <div className="text-sm text-white">#{idx + 1} · {d.day}일</div>
                <div className="text-lg font-black text-emerald-300">{d.total}점</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <h3 className="text-lg font-black text-rose-300">주의해야 할 날 TOP 5</h3>
          <div className="mt-3 space-y-2">
            {worstDays.map((d, idx) => (
              <div key={d.day} className="flex justify-between rounded-xl bg-black/20 p-3">
                <div className="text-sm text-white">#{idx + 1} · {d.day}일</div>
                <div className="text-lg font-black text-rose-300">{d.total}점</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <h3 className="text-xl font-black text-white">운세 분석 결과</h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <AnalysisCard title="최근 흐름">
            최근 30일 기준 흐름을 평균값으로 분석한 화면입니다.
          </AnalysisCard>

          <AnalysisCard title="추천 행동">
            기록 정리, 공부, 기획, 시스템 구축 흐름이 좋습니다.
          </AnalysisCard>

          <AnalysisCard title="주의 포인트">
            피로 누적 상태에서의 충동 결정과 감정적 소비를 조심하세요.
          </AnalysisCard>

          <AnalysisCard title="현재 상승 요소">
            반복 루틴, 데이터 분석, 장기 누적형 작업에서 좋은 흐름이 있습니다.
          </AnalysisCard>
        </div>
      </div>
    </div>
  );
}
function SettingsPage({ setProfile }) {
  function clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LOG_KEY);
    setProfile(defaultProfile);
    alert("저장된 입력값과 기록이 삭제되었습니다.");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <p className="text-xs text-violet-300">앱 정보</p>
        <h2 className="mt-1 text-3xl font-black text-white">
          설정 / 공지 / 데이터 관리
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          오늘의운 이용 전 안내사항입니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">서비스 안내</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            본 서비스는 만세력·사주팔자·당사주·토정비결·통계 기반 운세 흐름을 참고용으로 제공하는 서비스입니다.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">운세 결과 안내</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            운세 결과는 실제 결과를 보장하지 않으며, 참고 정보로만 이용해야 합니다.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">투자·건강 판단 주의</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            투자·건강·법률·의료 판단은 전문가 상담이 우선이며, 운세 결과만으로 중요한 결정을 내리지 않아야 합니다.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">개인정보 처리 안내</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            생년월일시 입력값은 서버 전송 없이 사용자의 브라우저 내부 저장소에 저장됩니다.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">데이터 삭제 안내</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            아래 버튼을 누르면 저장된 생년월일시와 기록 데이터를 삭제할 수 있습니다.
          </p>

          <button
            onClick={clearAllData}
            className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-3 font-bold text-white"
          >
            <Trash2 size={18} />
            데이터 전체 삭제
          </button>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">광고 및 유료 기능</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            현재 기본 기능은 무료로 제공되며, 향후 일부 기능은 광고 또는 유료 기능이 추가될 수 있습니다.
          </p>
        </div>
       <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
  <h3 className="text-xl font-black text-white">
    데이터 저장 안내
  </h3>

  <p className="mt-3 text-sm leading-7 text-slate-300">
    본 서비스는 입력한 생년월일, 시간, 방향, 점수 계산 정보를 서버에 저장하지 않습니다.
    화면에서 계산 결과만 보여주는 간단한 참고용 서비스입니다.
  </p>

  <p className="mt-3 text-xs leading-6 text-slate-500">
    로그인, 회원가입, 채팅, 신고 기능은 현재 제공하지 않습니다.
  </p>
</div>
      </div>
    </div>
  );
}
function Admin() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);

 const ADMIN_PASSWORD = "246897";

 
  const logs = loadJson(LOG_KEY, []);

const good = 0;
const normal = 0;
const bad = 0;
const totalFeedback = 0;

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
        <Lock className="text-rose-300" size={36} />

        <h2 className="mt-4 text-2xl font-black text-white">
          관리자 인증
        </h2>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="관리자 비밀번호"
          className="mt-5 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none"
        />

        <button
          onClick={() => {
            if (password === ADMIN_PASSWORD) {
              setUnlocked(true);
            } else {
              alert("비밀번호가 틀렸습니다.");
            }
          }}
          className="mt-4 w-full rounded-xl bg-violet-500 px-4 py-3 font-bold text-white"
        >
          관리자 모드 입장
        </button>

        <p className="mt-3 text-xs text-slate-500">
         설정 버튼 8회 클릭 후 관리자 진입
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-rose-300">
              관리자 모드
            </p>

            <h1 className="text-2xl font-black text-white">
              로컬 통계 대시보드
            </h1>
          </div>

          <button
            onClick={() => setUnlocked(false)}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm text-slate-200"
          >
            잠금
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
  ["저장된 운세 기록", `${logs.length}개`],
  ["오늘 접속자", "로컬 기준"],
  ["연령층", "입력값 기준"],
  ["가입 방식", "회원가입 없음"],
  ["개인정보 저장", "기기 내부"],
  ["신고/피드백", "비활성화"],
].map(([a, b]) => (
          <div
            key={a}
            className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
          >
            <div className="text-xs text-slate-400">
              {a}
            </div>

            <div className="mt-2 text-2xl font-black text-white">
              {b}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
          <h3 className="font-bold text-white">
            운세 적중 피드백
          </h3>

          <div className="mt-4 space-y-3">
            <StatBar
              label="잘 맞음"
              value={totalFeedback ? (good / totalFeedback) * 100 : 0}
            />

            <StatBar
              label="보통"
              value={totalFeedback ? (normal / totalFeedback) * 100 : 0}
            />

            <StatBar
              label="안 맞음"
              value={totalFeedback ? (bad / totalFeedback) * 100 : 0}
            />
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
          <h3 className="font-bold text-white">
            최근 운세 기록
          </h3>

          <div className="mt-4 space-y-2">
            {logs.length === 0 ? (
              <div className="rounded-xl bg-white/[0.04] p-3 text-sm text-slate-400">
                저장된 기록 없음
              </div>
            ) : (
              logs.slice(0, 5).map((log, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-white/[0.04] p-3 text-sm text-slate-300"
                >
                  {log.date} · 종합 {log.total}% · 금전 {log.money}% · 인연{" "}
                  {log.love}%
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
        <h3 className="font-bold text-white">
          출시 전 체크
        </h3>

        <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
          <div className="rounded-xl bg-white/[0.04] p-3">
            현재 통계는 기기 내부 저장
          </div>

          <div className="rounded-xl bg-white/[0.04] p-3">
            서버 전송 없음
          </div>

          <div className="rounded-xl bg-white/[0.04] p-3">
            Firebase는 선택 기능으로 후순위
          </div>
        </div>
      </div>
    </div>
  );
}

function getFortuneCycleStats(birthKey = "default") {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();

  const seedText = `${birthKey}-${year}-${month}-${date}`;
  let seed = 0;

  for (let i = 0; i < seedText.length; i++) {
    seed += seedText.charCodeAt(i) * (i + 1);
  }

  const makeScore = (salt, min = 55, max = 94) => {
    const raw = Math.abs(Math.sin(seed + salt) * 10000);
    return Math.floor(min + (raw % (max - min + 1)));
  };

  return [
    {
      title: "대운",
      label: "10년 흐름",
      score: makeScore(11, 50, 90),
      desc: "장기 인생 방향과 큰 변화 흐름",
    },
    {
      title: "세운",
      label: "올해 흐름",
      score: makeScore(22, 52, 94),
      desc: "올해 기회, 재물, 인간관계 흐름",
    },
    {
      title: "월운",
      label: "이번 달 흐름",
      score: makeScore(33, 50, 92),
      desc: "이번 달 컨디션과 실행력",
    },
    {
      title: "일운",
      label: "오늘 흐름",
      score: makeScore(44, 55, 96),
      desc: "오늘 하루 운세 지표",
    },
  ];
}


 

  export default function App() {
  const [tab, setTab] = useState("home");
  const [profile, setProfile] = useState(defaultProfile);
  const [selectedFortune, setSelectedFortune] = useState(null);
  const [settingsTapCount, setSettingsTapCount] = useState(0);

  useEffect(() => {
    const saved = loadJson(STORAGE_KEY, null);

    if (saved) {
      setProfile({
        ...defaultProfile,
        ...saved,
      });
    }
  }, []);

  const data = useMemo(() => {
    return calcPseudoSaju(profile);
  }, [profile.birthDate, profile.birthTime, profile.gender, profile.calendarType]);
const todayFortune = useMemo(() => {
  const todayKey = new Date().toISOString().slice(0, 10);
  return makeDynamicFortune(profile, todayKey);
}, [
  profile.birthDate,
  profile.birthTime,
  profile.gender,
  profile.calendarType,
]);

  useEffect(() => {
    setSelectedFortune(null);
  }, [profile.birthDate, profile.birthTime, profile.gender, profile.calendarType]);

  const menu = [
    ["home", "홈", Home],
    ["profile", "입력", UserRound],
   
    ["calendar", "캘린더", CalendarDays],
   
    ["life", "당사주", Star],
    ["settings", "설정", Settings],
   
  ];

  return (
    <div className="min-h-screen bg-[#050816] p-3 text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,.35),transparent_35%),radial-gradient(circle_at_top_right,rgba(56,189,248,.2),transparent_32%)]" />

      <header className="mx-auto mb-4 flex max-w-7xl items-center justify-between rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-2xl">
        <div>
          <div className="text-xs text-violet-300">
            AI · 통계 기반 운세 플랫폼
          </div>

          <h1 className="text-2xl font-black text-white">
            오늘의운
          </h1>
        </div>

        <button
          onClick={() => setTab("profile")}
          className="rounded-xl bg-violet-500/20 px-4 py-2 text-sm text-violet-100"
        >
          {profile.birthDate ? "프로필 수정" : "생년월일시 입력"}
        </button>
      </header>

      <main className="mx-auto max-w-7xl pb-28">
        {tab === "home" && (
      <UserHome
  profile={profile}
  data={data}
  setTab={setTab}
/>
        )}

        {tab === "profile" && (
        <ProfileForm
  profile={profile}
  setProfile={setProfile}
  setTab={setTab}
/>
        )}

  

   {tab === "calendar" && (
  <div className="space-y-4">
    <CalendarPage
      profile={profile}
      setSelectedFortune={setSelectedFortune}
    />
{selectedFortune && (
  <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs text-violet-300">선택한 날짜</div>
        <h3 className="mt-1 text-xl font-black text-white">
          {selectedFortune.date?.getMonth() + 1}월 {selectedFortune.date?.getDate()}일 상세 운세
        </h3>
      </div>

      <div className="rounded-xl bg-violet-500/15 px-3 py-2 text-xs font-bold text-violet-200">
        종합 {selectedFortune.total}%
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        ["종합운", selectedFortune.total, "text-cyan-300"],
        ["재물운", selectedFortune.money, "text-yellow-300"],
        ["인연운", selectedFortune.love, "text-pink-300"],
        ["이동운", selectedFortune.move, "text-emerald-300"],
      ].map(([label, score, color]) => (
        <div key={label} className="rounded-xl bg-white/[0.04] p-3">
          <div className="text-xs text-slate-400">{label}</div>
          <div className={`mt-1 text-2xl font-black ${color}`}>
            {score}%
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-cyan-400"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      ))}
    </div>

    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
        <div className="text-sm font-bold text-emerald-300">
          오늘 하면 좋은 행동
        </div>

        <div className="mt-3 grid gap-2 text-sm text-slate-300">
          {selectedFortune.money >= 70 && (
            <div className="rounded-xl bg-black/20 p-3">
              💰 지출 정리·수익 실현·현금 흐름 점검
            </div>
          )}

          {selectedFortune.love >= 70 && (
            <div className="rounded-xl bg-black/20 p-3">
              💘 연락·만남·관계 회복 시도
            </div>
          )}

          {selectedFortune.move >= 65 && (
            <div className="rounded-xl bg-black/20 p-3">
              🧭 외출·이동·방문 일정 진행
            </div>
          )}

          {selectedFortune.total >= 75 && (
            <div className="rounded-xl bg-black/20 p-3">
              ⚡ 중요한 일 진행·미뤘던 작업 처리
            </div>
          )}

          {selectedFortune.total < 75 && (
            <div className="rounded-xl bg-black/20 p-3">
              🧘 무리한 결정 대신 정리·점검·계획 세우기
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-rose-400/20 bg-rose-500/5 p-4">
        <div className="text-sm font-bold text-rose-300">
          오늘 조심할 행동
        </div>

        <div className="mt-3 grid gap-2 text-sm text-slate-300">
          {(selectedFortune.accidentRisk || selectedFortune.accident || 0) >= 50 && (
            <div className="rounded-xl bg-black/20 p-3">
              ⚠ 무리한 이동·야간 운전·위험한 작업 주의
            </div>
          )}

          {(selectedFortune.stress || selectedFortune.conflict || 0) >= 50 && (
            <div className="rounded-xl bg-black/20 p-3">
              ⚠ 말다툼·즉흥 답장·감정적 반응 주의
            </div>
          )}

          {selectedFortune.money < 60 && (
            <div className="rounded-xl bg-black/20 p-3">
              ⚠ 충동구매·손실 만회성 투자 주의
            </div>
          )}

          {(selectedFortune.accidentRisk || selectedFortune.accident || 0) < 50 &&
            (selectedFortune.stress || selectedFortune.conflict || 0) < 50 &&
            selectedFortune.money >= 60 && (
              <div className="rounded-xl bg-black/20 p-3">
                ✅ 큰 위험은 낮지만 과욕은 피하기
              </div>
            )}
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
      <div className="text-sm font-bold text-cyan-300">
        시간대별 흐름
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          ["새벽", Math.max(35, selectedFortune.total - 18), "회복·정리"],
          ["오전", Math.max(40, selectedFortune.total - 5), "준비·확인"],
          ["오후", Math.min(95, selectedFortune.total + 12), "실행·결정"],
                ["밤", Math.max(35, selectedFortune.love - 7), "감정·휴식"],
      ].map(([time, score, text]) => (
        <div
          key={time}
          className="rounded-xl bg-black/20 p-3"
        >
          <div className="text-sm font-bold text-white">
            {time}
          </div>

          <div className="mt-1 text-2xl font-black text-cyan-300">
            {score}%
          </div>

          <div className="mt-1 text-xs text-slate-400">
            {text}
          </div>
        </div>
      ))}
    </div>
  </div>

  <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/5 p-4">
    <div className="text-sm font-bold text-yellow-300">
      한줄 결론
    </div>

    <p className="mt-2 text-sm leading-6 text-slate-300">
      {selectedFortune.total >= 80
        ? "강하게 밀고 가도 되는 날입니다. 다만 과욕과 말실수만 조심하세요."
        : selectedFortune.total >= 65
        ? "전체적으로 무난하게 좋은 날입니다. 중요한 일은 오후 흐름이 더 좋습니다."
        : selectedFortune.total >= 45
        ? "평범한 흐름입니다. 큰 결정은 피하고 정리와 확인에 집중하세요."
        : "주의가 필요한 날입니다. 이동, 소비, 감정 반응을 줄이는 것이 좋습니다."}
    </p>
  </div>
</div>
)}
  </div>
)}

      {tab === "life" && (
  <div className="space-y-4">
  <LifeFortunePage
  profile={profile}
  todayFortune={todayFortune}
  data={data}
/>
  </div>
)}
     

        {tab === "settings" && (
        <SettingsPage setProfile={setProfile} />
        )}

        {tab === "admin" && <Admin />}
        <div className="h-32 md:h-0" />
      </main>

     <nav className="fixed bottom-3 left-1/2 z-[9999] grid w-[calc(100%-24px)] max-w-4xl -translate-x-1/2 grid-cols-5 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur">
  {menu.map(([id, label, Icon]) => (
    <button
      key={id}
      type="button"
      onClick={() => {
        if (id === "settings") {
          const nextCount = settingsTapCount + 1;
          setSettingsTapCount(nextCount);

          if (nextCount >= 8) {
            setSettingsTapCount(0);
            setTab("admin");
            window.scrollTo(0, 0);
            return;
          }
        } else {
          setSettingsTapCount(0);
        }

        setSelectedFortune(null);
        setTab(id);
        window.scrollTo(0, 0);
      }}
      className={`rounded-xl px-1 py-3 text-[11px] md:text-xs ${
        tab === id ? "bg-violet-500 text-white" : "text-slate-400"
      }`}
    >
      <Icon className="mx-auto mb-1" size={18} />
      {label}
    </button>
  ))}
</nav>
    </div>
  );
}
