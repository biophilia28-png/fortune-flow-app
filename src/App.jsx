import React, { useEffect, useMemo, useState } from "react";
import {
  getTodayFortune,
  getCalendarFortunes,
  getGanjiName
} from "./fortuneEngine";
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
const FEEDBACK_KEY = "fortune_flow_feedback";

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

function calcPseudoSaju(profile) {
  const raw = `${profile.birthDate || ""}-${profile.birthTime || "12:00"}-${profile.gender}-${profile.calendarType}`;
  const h = hashNumber(raw);

  const birthDate = profile.birthDate || "1990-01-01";
  const year = Number(birthDate.slice(0, 4)) || 1990;
  const month = Number(birthDate.slice(5, 7)) || 1;
  const day = Number(birthDate.slice(8, 10)) || 1;
  const hour = Number((profile.birthTime || "12:00").slice(0, 2)) || 12;

  const pillars = {
    year: stems[(year + 6) % 10] + branches[(year + 8) % 12],
    month: stems[(month + h) % 10] + branches[(month + 1) % 12],
    day: stems[(day + h) % 10] + branches[(day + h) % 12],
    hour:
      stems[(Math.floor(hour / 2) + h) % 10] +
      branches[Math.floor((hour + 1) / 2) % 12],
  };

  const base = (h % 41) + 40;

  return {
    pillars,
    scores: {
      total: clamp(base + (day % 7) - 3),
      love: clamp(55 + ((h >> 2) % 34)),
      move: clamp(50 + ((h >> 5) % 41)),
      accident: clamp(18 + ((h >> 7) % 24)),
      conflict: clamp(20 + ((h >> 9) % 30)),
      money: clamp(45 + ((h >> 11) % 38)),
      happy: clamp(52 + ((h >> 13) % 35)),
      bigLuck: clamp(50 + ((h >> 15) % 36)),
      yearLuck: clamp(48 + ((h >> 17) % 39)),
      monthLuck: clamp(45 + ((h >> 19) % 41)),
      dayLuck: clamp(50 + ((h >> 21) % 36)),
      hourLuck: clamp(40 + ((h >> 23) % 42)),
    },
    keywords: ["기회포착", "연락가능성", "이동추천", "과소비주의"].slice(
      0,
      3 + (h % 2)
    ),
    similarCount: 900 + (h % 1900),
    eventCount: 12000 + (h % 25000),
  };
}

function calcDirectionScores(profile) {
  const h = hashNumber(`${profile.birthDate}-${profile.birthTime}-direction`);

  const names = [
    ["자", "북"],
    ["축", "북북동"],
    ["인", "동북동"],
    ["묘", "동"],
    ["진", "동남동"],
    ["사", "남남동"],
    ["오", "남"],
    ["미", "남남서"],
    ["신", "서남서"],
    ["유", "서"],
    ["술", "서북서"],
    ["해", "북북서"],
  ];

  return names.map(([z, dir], i) => [
    z,
    dir,
    clamp(40 + (((h >> (i % 16)) + i * 7) % 49)),
  ]);
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

function FeedbackBox() {
  const [answer, setAnswer] = useState("");

  const [counts, setCounts] = useState(() =>
    loadJson(FEEDBACK_KEY, {})
  );

  function selectAnswer(v) {
    const next = {
      ...counts,
      [v]: (counts[v] || 0) + 1,
    };

    setAnswer(v);
    setCounts(next);

    localStorage.setItem(
      FEEDBACK_KEY,
      JSON.stringify(next)
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
      <h3 className="font-bold text-white">
        오늘 실제로 비슷했나요?
      </h3>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        {["잘 맞음", "보통", "안 맞음"].map((v) => (
          <button
           key={v}
            onClick={() => selectAnswer(v)}
            className={`rounded-xl px-3 py-3 font-bold ${
              answer === v
                ? "bg-violet-500 text-white"
                : "bg-white/10 text-slate-200"
            }`}
          >
          {v}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2 text-xs text-slate-300">
        <div>잘 맞음: {counts["잘 맞음"] || 0}회</div>
        <div>보통: {counts["보통"] || 0}회</div>
        <div>안 맞음: {counts["안 맞음"] || 0}회</div>
      </div>
    </div>
  );
}

function ProfileForm({ profile, setProfile }) {
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
              <div className="rounded-xl bg-emerald-500/15 p-3 text-sm text-emerald-200">
                저장 완료
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

          <div className="mt-5">
            <NoticeBox />
          </div>
        </div>
      </div>
    </div>
  );
}
function UserHome({ profile, data, setTab, todayFortune }) {
  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
        <p className="text-sm text-violet-300">
          오늘의 운세 흐름
        </p>

        <h1 className="mt-2 text-4xl font-black text-white">
          {profile.nickname || "사용자"}님의 운세
        </h1>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <div className="text-xs text-slate-400">
              종합운
            </div>

            <div className="mt-2 text-4xl font-black text-cyan-300">
              {todayFortune.total}%
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.04] p-4">
            <div className="text-xs text-slate-400">
              인연운
            </div>

            <div className="mt-2 text-4xl font-black text-pink-300">
             {todayFortune.love}%
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.04] p-4">
            <div className="text-xs text-slate-400">
              금전운
            </div>

            <div className="mt-2 text-4xl font-black text-yellow-300">
              {todayFortune.money}%
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.04] p-4">
            <div className="text-xs text-slate-400">
              행복지수
            </div>

            <div className="mt-2 text-4xl font-black text-emerald-300">
            {todayFortune.happy}%
            </div>
          </div>
        </div>
<div className="mt-5 rounded-2xl bg-white/[0.04] p-4">
  <div className="text-sm text-cyan-300 font-bold">
    오늘의 사주 흐름
  </div>

  <p className="mt-2 text-sm text-slate-300">
    {todayFortune.saju.summary}
  </p>

  <div className="mt-3 text-xs text-violet-300">
    기문: {todayFortune.qimen.door}
    / 길방향: {todayFortune.qimen.direction}
  </div>

  <div className="mt-2 text-xs text-yellow-300">
    주역: {todayFortune.iching.main}
  </div>
</div>
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setTab("flow")}
            className="rounded-xl bg-violet-500 px-4 py-3 font-bold text-white"
          >
            운세 흐름 보기
          </button>

          <button
            onClick={() => setTab("calendar")}
            className="rounded-xl bg-cyan-500 px-4 py-3 font-bold text-white"
          >
            캘린더 보기
          </button>
        </div>
      </div>

      <DirectionPanel profile={profile} />

      <FeedbackBox />
    </div>
  );
}
function DirectionPanel({ profile }) {
  const directions = calcDirectionScores(profile);
  const [fromPlace, setFromPlace] = useState("");
  const [toPlace, setToPlace] = useState("");

  const directionIndex =
    fromPlace && toPlace ? (fromPlace.length * 3 + toPlace.length * 7) % 12 : 1;

  const picked = directions[directionIndex];
  const pickedZodiac = picked[0];
  const pickedDirection = picked[1];
  const pickedScore = picked[2];

  const getColor = (score) => {
    if (score >= 80) return "from-emerald-400 to-green-500 border-emerald-400 text-emerald-200";
    if (score >= 60) return "from-lime-400 to-green-500 border-lime-400 text-lime-200";
    if (score >= 40) return "from-yellow-400 to-amber-500 border-yellow-400 text-yellow-200";
    if (score >= 20) return "from-orange-400 to-red-500 border-orange-400 text-orange-200";
    return "from-red-500 to-rose-600 border-red-400 text-red-200";
  };

  const resultText =
    pickedScore >= 80
      ? "매우 좋은 이동 흐름"
      : pickedScore >= 60
      ? "좋은 이동 흐름"
      : pickedScore >= 40
      ? "보통 흐름"
      : pickedScore >= 20
      ? "주의 흐름"
      : "매우 주의";

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-white">
          내 위치 기준 12지신 방향운
        </h3>
        <MapPin size={18} className="text-cyan-300" />
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          value={fromPlace}
          onChange={(e) => setFromPlace(e.target.value)}
          placeholder="출발지 예: 서울역"
          className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none"
        />

        <input
          value={toPlace}
          onChange={(e) => setToPlace(e.target.value)}
          placeholder="목적지 예: 홍대입구"
          className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none"
        />

        <button className="rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-3 text-sm font-bold text-white">
          분석하기
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_330px]">
        <div className="relative min-h-[560px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#07111f] p-4">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(59,130,246,.35),transparent_35%),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] bg-[length:100%_100%,48px_48px,48px_48px]" />

          <div className="relative mx-auto mt-8 aspect-square max-w-[520px]">
            <div className="absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-300/30" />

            {directions.map(([zodiac, dir, score], index) => {
              const angle = index * 30 - 90;
              const rad = (angle * Math.PI) / 180;
              const radius = 42;
              const x = 50 + radius * Math.cos(rad);
              const y = 50 + radius * Math.sin(rad);
              const active = zodiac === pickedZodiac;
              const color = getColor(score);

              return (
                <div
                  key={zodiac}
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div
                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border bg-slate-950/90 text-3xl font-black shadow-2xl ${
                      active
                        ? `${color} scale-110 shadow-cyan-500/40`
                        : color
                    }`}
                  >
                    {zodiac}
                  </div>
                  <div className="mt-1 text-xs text-slate-300">{dir}</div>
                  <div className="mx-auto mt-1 rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-white">
                    {score}%
                  </div>
                </div>
              );
            })}

            <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/50 bg-blue-500/30 p-2 shadow-2xl shadow-blue-500/40">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
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

          <div className="relative mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-slate-300">
            점수 기준:
            <span className="ml-3 text-emerald-300">80% 이상 매우 좋음</span>
            <span className="ml-3 text-lime-300">60~79% 좋음</span>
            <span className="ml-3 text-yellow-300">40~59% 보통</span>
            <span className="ml-3 text-orange-300">20~39% 주의</span>
            <span className="ml-3 text-red-300">20% 미만 매우 주의</span>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5">
          <h3 className="text-xl font-black text-white">
            이동 방향 분석 결과
          </h3>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs text-slate-400">주 이동 방향</div>
            <div className="mt-2 text-3xl font-black text-violet-300">
              {pickedDirection}
            </div>

            <div className="mt-5 text-xs text-slate-400">12지신 방향</div>
            <div className="mt-2 text-3xl font-black text-blue-300">
              {pickedZodiac}
            </div>

            <div className="mt-5 text-xs text-slate-400">이동운 점수</div>
            <div className="mt-2 text-4xl font-black text-yellow-300">
              {pickedScore}%
            </div>

            <div className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-200">
              {resultText}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[...directions]
              .sort((a, b) => b[2] - a[2])
              .map(([zodiac, dir, score], i) => (
                <div key={zodiac} className="grid grid-cols-[28px_1fr_52px] items-center gap-2 text-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs text-white">
                    {i + 1}
                  </div>

                  <div>
                    <span className="font-bold text-white">{zodiac}</span>
                    <span className="ml-2 text-slate-400">({dir})</span>
                    <div className="mt-1 h-2 rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right font-bold text-cyan-300">
                    {score}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

     function FlowPage({ data }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <h2 className="text-3xl font-black text-white">
          대운·세운·월운·일운·시운
        </h2>

        <div className="mt-5 space-y-4">
          <StatBar label="대운 흐름" value={data.scores.bigLuck} />
          <StatBar label="세운 흐름" value={data.scores.yearLuck} />
          <StatBar label="월운 흐름" value={data.scores.monthLuck} />
          <StatBar label="일운 흐름" value={data.scores.dayLuck} />
          <StatBar label="시운 흐름" value={data.scores.hourLuck} />
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <h2 className="text-3xl font-black text-white">
          오늘의 상세 해석
        </h2>

        <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
          <p className="rounded-xl bg-white/[0.04] p-4">
            오늘은 외부 활동과 연락 흐름이 비교적 강합니다.
          </p>

          <p className="rounded-xl bg-white/[0.04] p-4">
            금전운은 기회와 소비가 함께 증가하는 흐름입니다.
          </p>

          <p className="rounded-xl bg-white/[0.04] p-4">
            피로한 시간대 이동은 주의하세요.
          </p>
        </div>
      </div>
    </div>
  );
}

function CalendarPage({ profile }) {
const now = new Date();

const days = getCalendarFortunes(
  now.getFullYear(),
  now.getMonth() + 1,
  profile
);
const year = now.getFullYear();
const month = now.getMonth() + 1;
const today = now.getDate();

const firstDay = new Date(year, month - 1, 1).getDay();

const blanks = Array.from({ length: firstDay });
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
      <h2 className="text-3xl font-black text-white">
        운세 캘린더
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        이번 달 날짜별 흐름 미리보기입니다.
      </p>

    

       <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400">
  {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
    <div key={d}>{d}</div>
  ))}
</div>

<div className="mt-2 grid grid-cols-7 gap-2">

  {blanks.map((_, i) => (
    <div key={`blank-${i}`} />
  ))}

      {days.map((fortune, i) => (
          <div
            key={i}
        className="rounded-xl bg-white/[0.04] p-3 text-center min-h-[118px]"
          >
          <div className="text-xs text-slate-400">
  {i + 1}일
</div>

<div className="mt-1 text-lg font-black text-white">
  {getGanjiName(new Date(now.getFullYear(), now.getMonth(), i + 1))}
</div>

<div className="mt-1 text-[11px] text-cyan-300">
  {fortune.saju.element} · {fortune.saju.tenGod}
</div>

<div className="mt-1 text-[11px] text-violet-300">
  {fortune.saju.twelveStage} · {fortune.saju.sinsal}
</div>

<div
  className={`mt-2 text-xl font-black ${
    fortune.total >= 80
      ? "text-emerald-300"
      : fortune.total >= 65
      ? "text-cyan-300"
      : fortune.total >= 45
      ? "text-yellow-300"
      : "text-rose-300"
  }`}
>
  {fortune.total}점
</div>
         </div>
        ))}
      </div>
    </div>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-white">{label}</div>
        <div className={`rounded-full px-2 py-1 text-[11px] font-bold ${color}`}>
          {labelText}
        </div>
      </div>

      <div className="mt-3 text-3xl font-black text-white">
        {displayValue}%
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300"
          style={{ width: `${displayValue}%` }}
        />
      </div>
    </div>
  );
}

function StatsPage({ data }) {
  const detailStats = [
    ["사고주의", data.scores.accident, true],
    ["외출운", data.scores.move, false],
    ["대인관계", data.scores.love, false],
    ["업무집중", data.scores.dayLuck, false],
    ["건강", data.scores.happy, false],
    ["소비주의", data.scores.money > 70 ? 65 : 35, true],
    ["말조심", data.scores.conflict, true],
    ["귀인운", data.scores.yearLuck, false],
    ["기회운", data.scores.bigLuck, false],
    ["스트레스", data.scores.conflict + 15, true],
    ["연락운", data.scores.love + 5, false],
    ["투자리스크", data.scores.accident + data.scores.conflict / 2, true],
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <p className="text-xs text-violet-300">상세 통계</p>

        <h2 className="mt-1 text-3xl font-black text-white">
          오늘의 운세 지표
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          단순 점수보다 항목별 위험/기회 흐름을 함께 보여줍니다.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="종합운" value={data.scores.total} />
        <StatCard label="인연운" value={data.scores.love} />
        <StatCard label="금전운" value={data.scores.money} />
        <StatCard label="행복지수" value={data.scores.happy} />
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <h3 className="text-xl font-black text-white">
          상세 통계 12개
        </h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {detailStats.map(([label, value, caution]) => (
            <StatCard
              key={label}
              label={label}
              value={clamp(value)}
              caution={caution}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
function SettingsPage({ setProfile }) {
  function clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LOG_KEY);
    localStorage.removeItem(FEEDBACK_KEY);
    setProfile(defaultProfile);
    alert("저장된 입력값과 기록이 삭제되었습니다.");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <p className="text-xs text-violet-300">앱 정보</p>

        <h2 className="mt-1 text-3xl font-black text-white">
          설정 / 약관 / 데이터 관리
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          회원가입 없이 기기 내부 저장 방식으로 작동합니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">필수 공지</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            본 서비스는 참고용 운세 서비스이며, 건강·투자·법률·사고 여부를 단정하지 않습니다.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">개인정보 처리 안내</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            생년월일시 입력값은 서버가 아닌 사용자의 브라우저/기기 내부에 저장됩니다.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">이용약관</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            운세 결과를 근거로 중요한 의사결정을 단독으로 진행하지 않아야 합니다.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">내 데이터 관리</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            입력값, 운세 기록, 피드백 기록은 이 기기 내부에 저장됩니다.
          </p>

          <button
            onClick={clearAllData}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 font-bold text-white"
          >
            <Trash2 size={18} />
            내 입력값/기록 삭제하기
          </button>
        </div>
      </div>
    </div>
  );
}
function Admin() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const ADMIN_PASSWORD = "1234";

  const feedback = loadJson(FEEDBACK_KEY, {});
  const logs = loadJson(LOG_KEY, []);

  const good = feedback["잘 맞음"] || 0;
  const normal = feedback["보통"] || 0;
  const bad = feedback["안 맞음"] || 0;
  const totalFeedback = good + normal + bad;

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
          테스트 비밀번호: 1234
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
          ["총 피드백", `${totalFeedback}회`],
          ["잘 맞음", `${good}회`],
          ["안 맞음", `${bad}회`],
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

export default function App() {

  const userProfile = JSON.parse(
  localStorage.getItem(STORAGE_KEY) || "{}"
);

const todayFortune = getTodayFortune(userProfile);
  
  const [tab, setTab] = useState("home");
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    const saved = loadJson(STORAGE_KEY, null);

    if (saved) {
      setProfile({
        ...defaultProfile,
        ...saved,
      });
    }
  }, []);

  const data = useMemo(
    () => calcPseudoSaju(profile),
    [profile]
  );

  const menu = [
    ["home", "홈", Home],
    ["profile", "입력", UserRound],
    ["flow", "흐름", CalendarDays],
    ["calendar", "캘린더", CalendarDays],
    ["stats", "통계", BarChart3],
    ["settings", "설정", Settings],
    ["admin", "관리자", Lock],
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
            운세플로우
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
  todayFortune={todayFortune}
/>
        )}

        {tab === "profile" && (
          <ProfileForm
            profile={profile}
            setProfile={setProfile}
          />
        )}

       {tab === "flow" && (
  <FlowPage
    data={data}
    profile={profile}
    todayFortune={todayFortune}
  />
)}

        {tab === "calendar" && (
         <CalendarPage profile={profile} />
        )}

        {tab === "stats" && (
          <StatsPage data={data} />
        )}

        {tab === "settings" && (
          <SettingsPage setProfile={setProfile} />
        )}

        {tab === "admin" && <Admin />}
      </main>

      <nav className="fixed bottom-3 left-1/2 z-10 grid w-[calc(100%-24px)] max-w-4xl -translate-x-1/2 grid-cols-7 rounded-2xl border border-white/10 bg-slate-950/90 p-2 shadow-2xl backdrop-blur">
        {menu.map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-xl px-1 py-3 text-[11px] md:text-xs ${
              tab === id
                ? "bg-violet-500 text-white"
                : "text-slate-400"
            }`}
          >
            <Icon
              className="mx-auto mb-1"
              size={18}
            />

            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
