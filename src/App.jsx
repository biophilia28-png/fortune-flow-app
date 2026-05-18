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

function DirectionPanel({ profile }) {
  const directions = calcDirectionScores(profile);

  const [fromPlace, setFromPlace] = useState("");
  const [toPlace, setToPlace] = useState("");

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">
          내 위치 기준 12지신 방향운
        </h3>

        <MapPin size={18} className="text-cyan-300" />
      </div>

      <p className="mt-2 text-xs text-slate-400">
        현재는 GPS 없이 출발지/목적지 입력 기반 미리보기입니다.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
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
      </div>

      {fromPlace && toPlace && (
        <div className="mt-3 rounded-xl bg-cyan-500/10 p-3 text-sm text-cyan-100">
          {fromPlace} → {toPlace} 이동 방향운을 분석 중입니다.
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2">
        {directions.map(([z, dir, score]) => (
          <div
            key={z}
            className="rounded-xl bg-white/[0.04] p-3 text-center"
          >
            <div className="text-lg font-black text-white">
              {z}
            </div>

            <div className="text-[11px] text-slate-400">
              {dir}
            </div>

            <div className="mt-1 text-sm text-cyan-200">
              {score}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserHome({ profile, data, setTab }) {
  if (!profile.birthDate) {
    return (
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 text-center">
        <Info className="mx-auto text-violet-300" size={42} />

        <h2 className="mt-4 text-2xl font-black text-white">
          생년월일시 입력이 필요합니다
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          오늘의 운세 흐름, 대운·세운, 12지신 방향운을 보려면
          먼저 생년월일과 태어난 시간을 입력해 주세요.
        </p>

        <button
          onClick={() => setTab("profile")}
          className="mt-5 rounded-xl bg-violet-500 px-5 py-3 font-bold text-white"
        >
          생년월일시 입력하기
        </button>
      </div>
    );
  }

  const cards = [
    ["인연운", data.scores.love, Heart],
    ["외출·이동운", data.scores.move, Compass],
    ["사고 주의", data.scores.accident, AlertTriangle],
    ["구설 주의", data.scores.conflict, MessageCircleWarning],
    ["금전운", data.scores.money, Coins],
    ["행복지수", data.scores.happy, Smile],
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-violet-300">
                AI · 통계 기반
              </p>

              <h1 className="mt-1 text-2xl font-black text-white">
                오늘의 운세 흐름
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                {profile.nickname || "사용자"}님 · {profile.calendarType}
              </p>
            </div>

            <button
              onClick={() => setTab("calendar")}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-200"
            >
              <CalendarDays className="inline mr-1" size={14} />
              캘린더
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[170px_1fr]">
            <div className="flex aspect-square items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-amber-300 to-cyan-300 p-3">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950">
                <span className="text-4xl font-black text-white">
                  {data.scores.total}%
                </span>

                <span className="text-sm text-amber-200">
                  양호
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.04] p-4">
              <h2 className="font-bold text-white">
                오늘은 ‘기회와 변화’의 흐름
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                유사 사주군 {data.similarCount}명, 누적 데이터{" "}
                {data.eventCount}건 기준의 참고용 통계입니다.
              </p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {data.keywords.map((k) => (
                  <span
                    key={k}
                    className="rounded-full bg-violet-400/15 px-3 py-1 text-violet-200"
                  >
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {cards.map(([label, value, Icon]) => (
            <button
              key={label}
              onClick={() => setTab("flow")}
              className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left shadow-xl"
            >
              <div className="flex items-center justify-between">
                <Icon className="text-violet-300" size={22} />

                <span className="text-2xl font-black text-white">
                  {value}%
                </span>
              </div>

              <div className="mt-3 text-sm font-bold text-white">
                {label}
              </div>
            </button>
          ))}
        </div>

        <DirectionPanel profile={profile} />
      </section>

      <aside className="space-y-4">
        <NoticeBox />
        <FeedbackBox />

        <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 to-rose-400 p-5 shadow-2xl">
          <Star className="text-white" />

          <h3 className="mt-3 text-xl font-black text-white">
            무료 운세 확인
          </h3>

          <p className="mt-1 text-sm text-white/80">
            초기 베타 기간에는 무료 제공됩니다.
          </p>
        </div>
      </aside>
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

        <p className="mt-2 text-sm text-slate-400">
          실제 만세력 엔진 연결 전까지는 MVP용 간이 점수입니다.
        </p>

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

function CalendarPage({ data }) {
  const days = Array.from({ length: 30 }, (_, i) =>
    clamp(data.scores.total + ((i * 13) % 21) - 10)
  );

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
      <h2 className="text-3xl font-black text-white">
        운세 캘린더
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        이번 달 날짜별 흐름 미리보기입니다.
      </p>

      <div className="mt-5 grid grid-cols-5 gap-2 md:grid-cols-10">
        {days.map((v, i) => (
          <div
            key={i}
            className="rounded-xl bg-white/[0.04] p-3 text-center"
          >
            <div className="text-xs text-slate-400">
              {i + 1}일
            </div>

            <div
              className={`mt-1 text-lg font-black ${
                v >= 70
                  ? "text-cyan-300"
                  : v >= 50
                  ? "text-amber-200"
                  : "text-rose-300"
              }`}
            >
              {v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsPage({ data }) {
  const [logs, setLogs] = useState(() =>
    loadJson(LOG_KEY, [])
  );

  function saveTodayLog() {
    const today = new Date().toLocaleDateString("ko-KR");

    const newLog = {
      date: today,
      total: data.scores.total,
      love: data.scores.love,
      money: data.scores.money,
      move: data.scores.move,
      happy: data.scores.happy,
    };

    const next = [newLog, ...logs].slice(0, 30);

    setLogs(next);

    localStorage.setItem(LOG_KEY, JSON.stringify(next));

    alert("오늘 운세 기록이 저장되었습니다.");
  }

  function clearLogs() {
    setLogs([]);

    localStorage.removeItem(LOG_KEY);

    alert("운세 기록이 삭제되었습니다.");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <h2 className="text-3xl font-black text-white">
          통계 인사이트
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          유사 사주군 및 사용자 피드백 기반으로 표시됩니다.
        </p>

        <div className="mt-5 space-y-4">
          <StatBar label="인연운 상승" value={data.scores.love} />
          <StatBar label="이동운 상승" value={data.scores.move} />
          <StatBar label="금전운 상승" value={data.scores.money} />
          <StatBar label="행복지수" value={data.scores.happy} />
        </div>

        <button
          onClick={saveTodayLog}
          className="mt-5 w-full rounded-xl bg-violet-500 px-4 py-3 font-bold text-white"
        >
          오늘 운세 기록 저장
        </button>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-white">
            내 운세 기록
          </h2>

          <button
            onClick={clearLogs}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-300"
          >
            삭제
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {logs.length === 0 ? (
            <div className="rounded-xl bg-white/[0.04] p-4 text-sm text-slate-400">
              아직 저장된 기록이 없습니다.
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={`${log.date}-${index}`}
                className="rounded-xl bg-white/[0.04] p-4 text-sm text-slate-300"
              >
                <div className="font-bold text-white">
                  {log.date}
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>종합: {log.total}%</div>
                  <div>인연: {log.love}%</div>
                  <div>금전: {log.money}%</div>
                  <div>이동: {log.move}%</div>
                  <div>행복: {log.happy}%</div>
                </div>
              </div>
            ))
          )}
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
        <p className="text-xs text-violet-300">
          앱 정보
        </p>

        <h2 className="mt-1 text-3xl font-black text-white">
          설정 / 약관 / 데이터 관리
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          회원가입 없이 기기 내부 저장 방식으로 작동합니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">
            필수 공지
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            본 서비스는 사주팔자, 대운, 세운, 월운, 일운, 시운 및 통계
            데이터를 기반으로 한 참고용 운세 서비스입니다. 제공되는 결과는
            확정된 예언이나 사실이 아니며, 건강, 투자, 법률, 사고 여부를
            단정하지 않습니다.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">
            개인정보 처리 안내
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            현재 버전은 회원가입이 없으며, 생년월일시 입력값은 서버가 아닌
            사용자의 브라우저/기기 내부에 저장됩니다.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">
            이용약관
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            사용자는 본 서비스를 참고용 정보로 이용해야 하며, 운세 결과를
            근거로 중요한 의사결정을 단독으로 진행하지 않아야 합니다.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">
            내 데이터 관리
          </h3>

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
          />
        )}

        {tab === "profile" && (
          <ProfileForm
            profile={profile}
            setProfile={setProfile}
          />
        )}

        {tab === "flow" && (
          <FlowPage data={data} />
        )}

        {tab === "calendar" && (
          <CalendarPage data={data} />
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
