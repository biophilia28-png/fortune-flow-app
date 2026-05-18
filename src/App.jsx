import React, { useEffect, useMemo, useState } from "react";
import {
  Home,
  CalendarDays,
  BarChart3,
  MapPin,
  ShieldAlert,
  Settings,
  Lock,
  Users,
  Eye,
  Bell,
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
} from "lucide-react";

const STORAGE_KEY = "fortune_flow_profile_v2";

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

const branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const stems = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];

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
    hour: stems[(Math.floor(hour / 2) + h) % 10] + branches[Math.floor((hour + 1) / 2) % 12],
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
    keywords: ["기회포착", "연락가능성", "이동추천", "과소비주의"].slice(0, 3 + (h % 2)),
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

function StatBar({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>{value}%</span>
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
        <ShieldAlert size={18} /> 필수 공지
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-300">
        본 서비스는 사주팔자·대운·세운·월운·일운·시운과 통계 데이터를 기반으로 한 참고용 운세 서비스입니다.
        결과는 확정된 예언이 아니며, 건강·투자·법률·사고 여부를 단정하지 않습니다.
      </p>
    </div>
  );
}

function FeedbackBox() {
  const [answer, setAnswer] = useState("");

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
      <h3 className="font-bold text-white">오늘 실제로 비슷했나요?</h3>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        {["잘 맞음", "보통", "안 맞음"].map((v) => (
          <button
            key={v}
            onClick={() => setAnswer(v)}
            className={`rounded-xl px-3 py-3 font-bold ${
              answer === v ? "bg-violet-500 text-white" : "bg-white/10 text-slate-200"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        {answer ? `선택됨: ${answer}` : "피드백은 익명 통계 개선에만 사용됩니다."}
      </p>
    </div>
  );
}

function ProfileForm({ profile, setProfile }) {
  const [temp, setTemp] = useState(profile);
  const [saved, setSaved] = useState(false);

  function save() {
    setProfile(temp);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(temp));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function reset() {
    setTemp(defaultProfile);
    setProfile(defaultProfile);
    localStorage.removeItem(STORAGE_KEY);
  }
