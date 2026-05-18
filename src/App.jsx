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

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-2xl">
        <p className="text-xs text-violet-300">처음 입력</p>
        <h2 className="mt-1 text-3xl font-black text-white">생년월일시 입력</h2>
        <p className="mt-2 text-sm text-slate-400">
          입력값은 현재 브라우저에 저장됩니다.
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
                  setTemp({ ...temp, nickname: e.target.value })
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
                  setTemp({ ...temp, birthDate: e.target.value })
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
                  setTemp({ ...temp, birthTime: e.target.value })
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
                    setTemp({ ...temp, gender: e.target.value })
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
                    setTemp({ ...temp, calendarType: e.target.value })
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
              ✔ 내 사주 프로필 자동 생성
            </div>

            <div className="rounded-xl bg-white/[0.04] p-3">
              ✔ 오늘의 인연·금전·이동·행복지수 계산
            </div>

            <div className="rounded-xl bg-white/[0.04] p-3">
              ✔ 12지신 방향운 표시
            </div>

            <div className="rounded-xl bg-white/[0.04] p-3">
              ✔ 통계 페이지 활성화
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
    현재 버전은 미리보기이며, 다음 버전에서 실제 지도 방향 계산을 연결합니다.
  </div>
)}
      
      <div className="mt-3 grid grid-cols-3 gap-2">
        {directions.map(([z, dir, score]) => (
          <div
            key={z}
            className="rounded-xl bg-white/[0.04] p-3 text-center"
          >
            <div className="text-lg font-black text-white">{z}</div>

            <div className="text-[11px] text-slate-400">{dir}</div>

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
  const cards = [
    {
      label: "인연운",
      value: data.scores.love,
      icon: Heart,
    },
    {
      label: "외출·이동운",
      value: data.scores.move,
      icon: Compass,
    },
    {
      label: "사고 주의",
      value: data.scores.accident,
      icon: AlertTriangle,
    },
    {
      label: "구설 주의",
      value: data.scores.conflict,
      icon: MessageCircleWarning,
    },
    {
      label: "금전운",
      value: data.scores.money,
      icon: Coins,
    },
    {
      label: "행복지수",
      value: data.scores.happy,
      icon: Smile,
    },
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
                {profile.nickname || "사용자"}님
              </p>
            </div>

            <button
              onClick={() => setTab("calendar")}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-200"
            >
              <CalendarDays
                className="inline mr-1"
                size={14}
              />
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
                유사 사주군 {data.similarCount}명 기준
                통계 데이터입니다.
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
          {cards.map((c) => {
            const Icon = c.icon;

            return (
              <button
                key={c.label}
                onClick={() => setTab("flow")}
                className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <Icon
                    className="text-violet-300"
                    size={22}
                  />

                  <span className="text-2xl font-black text-white">
                    {c.value}%
                  </span>
                </div>

                <div className="mt-3 text-sm font-bold text-white">
                  {c.label}
                </div>
              </button>
            );
          })}
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

        <div className="mt-5 space-y-4">
          <StatBar
            label="대운 흐름"
            value={data.scores.bigLuck}
          />

          <StatBar
            label="세운 흐름"
            value={data.scores.yearLuck}
          />

          <StatBar
            label="월운 흐름"
            value={data.scores.monthLuck}
          />

          <StatBar
            label="일운 흐름"
            value={data.scores.dayLuck}
          />

          <StatBar
            label="시운 흐름"
            value={data.scores.hourLuck}
          />
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
  const days = Array.from(
    { length: 30 },
    (_, i) => clamp(data.scores.total + ((i * 13) % 21) - 10)
  );

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
      <h2 className="text-3xl font-black text-white">
        운세 캘린더
      </h2>

      <div className="mt-5 grid grid-cols-5 gap-2 md:grid-cols-10">
        {days.map((v, i) => (
          <div
            key={i}
            className="rounded-xl bg-white/[0.04] p-3 text-center"
          >
            <div className="text-xs text-slate-400">
              {i + 1}일
            </div>

            <div className="mt-1 text-lg font-black text-cyan-300">
              {v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsPage({ data }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <h2 className="text-3xl font-black text-white">
          통계 인사이트
        </h2>

        <div className="mt-5 space-y-4">
          <StatBar
            label="인연운 상승"
            value={data.scores.love}
          />

          <StatBar
            label="이동운 상승"
            value={data.scores.move}
          />

          <StatBar
            label="금전운 상승"
            value={data.scores.money}
          />

          <StatBar
            label="행복지수"
            value={data.scores.happy}
          />
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <h2 className="text-3xl font-black text-white">
          유사 데이터
        </h2>

        <div className="mt-5 grid gap-3 text-sm text-slate-300">
          <div className="rounded-xl bg-white/[0.04] p-4">
            유사 사주군: {data.similarCount}명
          </div>

          <div className="rounded-xl bg-white/[0.04] p-4">
            누적 데이터: {data.eventCount}건
          </div>
        </div>
      </div>
    </div>
  );
}

function Admin() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const ADMIN_PASSWORD = "1234";

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
        <Lock className="text-rose-300" size={36} />

        <h2 className="mt-4 text-2xl font-black text-white">
          관리자 인증
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          관리자 통계는 비밀번호 입력 후 확인할 수 있습니다.
        </p>

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
            <p className="text-xs text-rose-300">관리자 모드</p>

            <h1 className="text-2xl font-black text-white">
              사용자 통계
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
          ["총 설치자", "12,584"],
          ["오늘 사용자", "1,284"],
          ["누적 실행", "83,210"],
          ["공지 확인", "92%"],
        ].map(([a, b]) => (
          <div
            key={a}
            className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
          >
            <div className="text-xs text-slate-400">{a}</div>

            <div className="mt-2 text-2xl font-black text-white">
              {b}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
          <h3 className="font-bold text-white">연령대별 사용자</h3>

          <div className="mt-4 space-y-3">
            <StatBar label="20대" value={32} />
            <StatBar label="30대" value={41} />
            <StatBar label="40대" value={18} />
            <StatBar label="50대 이상" value={9} />
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
          <h3 className="font-bold text-white">운세 적중 피드백</h3>

          <div className="mt-4 space-y-3">
            <StatBar label="잘 맞았어요" value={61} />
            <StatBar label="보통이에요" value={27} />
            <StatBar label="안 맞았어요" value={12} />
            <StatBar label="재방문 의향" value={73} />
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
        <h3 className="font-bold text-white">출시 전 체크</h3>

        <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
          <div className="rounded-xl bg-white/[0.04] p-3">
            개인정보처리방침 URL 필요
          </div>

          <div className="rounded-xl bg-white/[0.04] p-3">
            이용약관 URL 필요
          </div>

          <div className="rounded-xl bg-white/[0.04] p-3">
            Firebase 연결 필요
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <p className="text-xs text-violet-300">앱 정보</p>

        <h2 className="mt-1 text-3xl font-black text-white">
          설정 / 약관 / 문의
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          앱 등록 전 필수 안내 화면입니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">
            필수 공지
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            본 서비스는 사주팔자, 대운, 세운, 월운, 일운, 시운 및
            통계 데이터를 기반으로 한 참고용 운세 서비스입니다.
            제공되는 결과는 확정된 예언이나 사실이 아니며,
            건강, 투자, 법률, 사고 여부를 단정하지 않습니다.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">
            개인정보 처리 안내
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            생년월일시, 성별, 위치 정보는 운세 계산과 방향운 분석을
            위해 사용됩니다. 위치 정보는 선택 동의이며, 사용자가
            동의하지 않아도 기본 운세 기능은 이용할 수 있습니다.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <h3 className="text-xl font-black text-white">
            이용약관
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            사용자는 본 서비스를 참고용 정보로 이용해야 하며,
            앱에서 제공하는 운세 결과를 근거로 중요한 의사결정을
            단독으로 진행하지 않아야 합니다.
          </p>
        </div>

       <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
  <h3 className="text-xl font-black text-white">
    내 데이터 관리
  </h3>

  <p className="mt-3 text-sm leading-7 text-slate-300">
    현재 버전은 회원가입 없이 사용할 수 있으며, 생년월일시 입력값은
    서버가 아닌 사용자의 브라우저/기기 내부에만 저장됩니다.
  </p>

  <button
    onClick={() => {
      localStorage.removeItem(STORAGE_KEY);
      alert("저장된 입력값이 삭제되었습니다. 앱을 새로고침하면 초기화됩니다.");
    }}
    className="mt-4 w-full rounded-xl bg-rose-500 px-4 py-3 font-bold text-white"
  >
    내 입력값 삭제하기
  </button>
</div>
      </div>
    </div>
  );
}

function StorePreviewPage() {
  const items = [
    ["오늘의 운세 흐름", "사주팔자와 통계 기반으로 오늘 흐름 확인"],
    ["대운·세운 분석", "10년·1년·월·일·시간 흐름 표시"],
    ["12지신 방향운", "내 위치 기준 이동 방향별 흐름 확인"],
    ["통계 피드백", "사용자 피드백으로 운세 정확도 개선"],
    ["필수 공지", "참고용 운세 서비스 고지"],
    ["관리자 통계", "설치자·접속자·연령대 통계 확인"],
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <p className="text-xs text-cyan-300">스토어 등록 준비</p>

        <h2 className="mt-1 text-3xl font-black text-white">
          앱 스크린샷 구성
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Play스토어 등록 전에 필요한 대표 화면 구성입니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map(([title, desc], index) => (
          <div
            key={title}
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl"
          >
            <div className="h-40 bg-gradient-to-br from-violet-500 to-fuchsia-400 p-5">
              <div className="text-xs text-white/80">
                운세플로우
              </div>

              <div className="mt-4 text-2xl font-black text-white">
                {title}
              </div>

              <div className="mt-2 text-sm text-white/80">
                등록용 화면 {index + 1}
              </div>
            </div>

            <div className="space-y-3 p-5">
              <div className="rounded-2xl bg-white/[0.05] p-4">
                <div className="text-xs text-slate-400">
                  미리보기
                </div>

                <div className="mt-1 text-lg font-black text-white">
                  {desc}
                </div>
              </div>

              <button className="w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-bold text-white">
                화면 확인
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");

  const [profile, setProfile] =
    useState(defaultProfile);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );

      if (saved) {
        setProfile({
          ...defaultProfile,
          ...saved,
        });
      }
    } catch {}
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
    ["admin", "관리자", Settings],
    ["store", "스토어", Star],
    ["settings", "설정", Settings],
  ];

  return (
    <div className="min-h-screen bg-[#050816] p-3 text-slate-100">
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
          생년월일시 입력
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

        {tab === "admin" && <Admin />}

        {tab === "settings" && <SettingsPage />}

        {tab === "store" && <StorePreviewPage />}
        
      </main>

      <nav className="fixed bottom-3 left-1/2 z-10 grid w-[calc(100%-24px)] max-w-4xl -translate-x-1/2 grid-cols-8 rounded-2xl border border-white/10 bg-slate-950/90 p-2 shadow-2xl backdrop-blur">
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
