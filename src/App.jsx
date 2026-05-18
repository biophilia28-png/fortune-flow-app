import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Home, CalendarDays, BarChart3, MapPin, ShieldAlert, Settings, Lock,
  Users, Eye, Bell, ChevronRight, Compass, Star, Heart, Coins, Smile,
  AlertTriangle, MessageCircleWarning
} from "lucide-react";

const cards = [
  { label: "인연운", value: 72, icon: Heart, desc: "새 인연·연락 흐름 상승", tone: "from-violet-500 to-fuchsia-400" },
  { label: "외출·이동운", value: 81, icon: Compass, desc: "이동·약속·외부 활동 좋음", tone: "from-sky-400 to-cyan-300" },
  { label: "사고·부상 주의", value: 28, icon: AlertTriangle, desc: "무리한 이동은 주의", tone: "from-orange-400 to-rose-400" },
  { label: "구설·다툼운", value: 31, icon: MessageCircleWarning, desc: "말실수·오해 주의", tone: "from-amber-400 to-yellow-300" },
  { label: "금전운", value: 64, icon: Coins, desc: "기회와 소비가 함께 증가", tone: "from-yellow-300 to-orange-300" },
  { label: "행복지수", value: 75, icon: Smile, desc: "만족감·활력 양호", tone: "from-blue-400 to-indigo-300" },
];

const directions = [
  ["자", "북", 58], ["축", "북북동", 45], ["인", "동북동", 67], ["묘", "동", 82],
  ["진", "동남동", 71], ["사", "남남동", 63], ["오", "남", 78], ["미", "남남서", 52],
  ["신", "서남서", 49], ["유", "서", 61], ["술", "서북서", 74], ["해", "북북서", 56],
];

function StatBar({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-300">
        <span>{label}</span><span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function NoticeBox() {
  return (
    <div className="rounded-2xl border border-violet-400/20 bg-slate-950/70 p-4 shadow-xl">
      <div className="flex items-center gap-2 text-sm font-bold text-violet-200">
        <ShieldAlert size={18}/> 필수 공지
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-300">
        본 서비스는 사주팔자·대운·세운·월운·일운·시운과 통계 데이터를 기반으로 한 참고용 운세 서비스입니다.
        결과는 확정된 예언이 아니며, 건강·투자·법률·사고 여부를 단정하지 않습니다.
      </p>
    </div>
  );
}

function UserHome() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-violet-300">AI · 통계 기반</p>
              <h1 className="mt-1 text-2xl font-black text-white">오늘의 운세 흐름</h1>
              <p className="mt-1 text-sm text-slate-400">2026.05.18 · 월요일</p>
            </div>
            <button className="rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-200">
              <CalendarDays className="inline mr-1" size={14}/> 캘린더
            </button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-[170px_1fr]">
            <div className="flex aspect-square items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-amber-300 to-cyan-300 p-3">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950">
                <span className="text-4xl font-black text-white">68%</span>
                <span className="text-sm text-amber-200">양호</span>
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <h2 className="font-bold text-white">오늘은 ‘기회와 변화’의 흐름</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                유사 사주군 1,258명 통계 기준, 외출·연락·금전 활동은 평균보다 높고 대인 말실수는 약간 주의가 필요합니다.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-amber-400/15 px-3 py-1 text-amber-200">#기회포착</span>
                <span className="rounded-full bg-violet-400/15 px-3 py-1 text-violet-200">#연락가능성</span>
                <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-cyan-200">#이동추천</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-3 md:grid-cols-3">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <Icon className="text-violet-300" size={22}/>
                  <span className="text-2xl font-black text-white">{c.value}%</span>
                </div>
                <div className="mt-3 text-sm font-bold text-white">{c.label}</div>
                <div className="mt-1 text-xs text-slate-400">{c.desc}</div>
                <div className="mt-3 h-2 rounded-full bg-slate-800">
                  <div className={`h-full rounded-full bg-gradient-to-r ${c.tone}`} style={{ width: `${c.value}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">내 위치 기준 12지신 방향운</h3>
              <MapPin size={18} className="text-cyan-300"/>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {directions.map(([z, dir, score]) => (
                <div key={z} className="rounded-xl bg-white/[0.04] p-3 text-center">
                  <div className="text-lg font-black text-white">{z}</div>
                  <div className="text-[11px] text-slate-400">{dir}</div>
                  <div className="mt-1 text-sm text-cyan-200">{score}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
            <h3 className="font-bold text-white">대운·세운·월운 흐름</h3>
            <div className="mt-4 space-y-3">
              <StatBar label="대운 흐름" value={69}/>
              <StatBar label="세운 흐름" value={74}/>
              <StatBar label="월운 흐름" value={61}/>
              <StatBar label="일운 흐름" value={68}/>
              <StatBar label="시운 변동성" value={53}/>
            </div>
            <button className="mt-5 flex w-full items-center justify-between rounded-xl bg-violet-500/20 px-4 py-3 text-sm font-bold text-violet-100">
              상세 리포트 보기 <ChevronRight size={18}/>
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <NoticeBox />
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
          <h3 className="font-bold text-white">오늘 실제로 비슷했나요?</h3>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <button className="rounded-xl bg-violet-500 px-3 py-3 font-bold text-white">잘 맞음</button>
            <button className="rounded-xl bg-white/10 px-3 py-3 text-slate-200">보통</button>
            <button className="rounded-xl bg-white/10 px-3 py-3 text-slate-200">안 맞음</button>
          </div>
          <p className="mt-3 text-xs text-slate-400">피드백은 익명 통계 개선에만 사용됩니다.</p>
        </div>
        <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 to-rose-400 p-5 shadow-2xl">
          <Star className="text-white" />
          <h3 className="mt-3 text-xl font-black text-white">무료 운세 확인</h3>
          <p className="mt-1 text-sm text-white/80">초기 베타 기간에는 모든 리포트를 무료로 제공합니다.</p>
        </div>
      </aside>
    </div>
  );
}

function Admin() {
  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-rose-300">관리자 모드</p>
            <h1 className="text-2xl font-black text-white">사용자 통계 대시보드</h1>
          </div>
          <Lock className="text-rose-300"/>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {[["총 설치자", "12,584", Users], ["오늘 사용자", "1,284", Eye], ["누적 실행", "83,210", BarChart3], ["공지 확인", "92%", Bell]].map(([a,b,I]) => (
          <div key={a} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <I className="text-cyan-300"/>
            <div className="mt-3 text-xs text-slate-400">{a}</div>
            <div className="text-2xl font-black text-white">{b}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
          <h3 className="font-bold text-white">연령대별 사용자</h3>
          <div className="mt-4 space-y-3">
            <StatBar label="20대" value={32}/><StatBar label="30대" value={41}/>
            <StatBar label="40대" value={18}/><StatBar label="50대 이상" value={9}/>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
          <h3 className="font-bold text-white">운세 적중 피드백</h3>
          <div className="mt-4 space-y-3">
            <StatBar label="잘 맞았어요" value={61}/><StatBar label="보통이에요" value={27}/>
            <StatBar label="안 맞았어요" value={12}/><StatBar label="재방문 의향" value={73}/>
          </div>
        </div>
      </div>
      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
        <h3 className="font-bold text-white">관리자 필수 체크</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-3 text-sm text-slate-300">
          <div className="rounded-xl bg-white/[0.04] p-3">개인정보처리방침 노출 완료</div>
          <div className="rounded-xl bg-white/[0.04] p-3">운세 참고용 고지 노출 완료</div>
          <div className="rounded-xl bg-white/[0.04] p-3">위치 권한 선택 동의 처리</div>
        </div>
      </div>
    </div>
  )
}

function ScreenshotPreview() {
  const previews = [
    { title: "오늘의 운세 흐름", desc: "AI·통계 기반 오늘의 흐름과 시간대별 변화 제공", color: "from-violet-500 to-fuchsia-400" },
    { title: "12지신 방향운", desc: "현재 위치 기준 이동 방향·외출 흐름 분석", color: "from-cyan-400 to-blue-400" },
    { title: "대운·세운 분석", desc: "10년 흐름·연간 흐름·월간 흐름을 시각화", color: "from-amber-400 to-orange-400" },
    { title: "통계 피드백", desc: "실제 사용자 피드백 기반 운세 정확도 강화", color: "from-pink-500 to-rose-400" },
    { title: "사주 프로필", desc: "년주·월주·일주·시주와 성향 키워드 제공", color: "from-emerald-400 to-teal-400" },
    { title: "관리자 통계", desc: "설치자·접속자·연령대·광고 통계 관리", color: "from-indigo-500 to-violet-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
        <p className="text-xs text-cyan-300">스토어 등록용 UI 미리보기</p>
        <h2 className="mt-2 text-3xl font-black text-white">앱 스크린샷 구성</h2>
        <p className="mt-2 text-sm text-slate-400">Play스토어 등록 전 필요한 실제 앱 화면 예시입니다.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {previews.map((p) => (
          <div key={p.title} className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl">
            <div className={`h-40 bg-gradient-to-br ${p.color} p-5`}>
              <div className="text-xs text-white/80">운세플로우</div>
              <div className="mt-4 text-2xl font-black text-white">{p.title}</div>
              <div className="mt-2 text-sm text-white/80">{p.desc}</div>
            </div>
            <div className="space-y-3 p-5">
              <div className="rounded-2xl bg-white/[0.05] p-4">
                <div className="text-xs text-slate-400">오늘의 흐름</div>
                <div className="mt-1 text-3xl font-black text-white">68%</div>
                <div className="mt-3 h-2 rounded-full bg-slate-800"><div className="h-full w-[68%] rounded-full bg-violet-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/[0.04] p-3 text-center"><div className="text-xs text-slate-400">인연운</div><div className="text-lg font-black text-pink-300">72%</div></div>
                <div className="rounded-xl bg-white/[0.04] p-3 text-center"><div className="text-xs text-slate-400">금전운</div><div className="text-lg font-black text-amber-300">64%</div></div>
              </div>
              <button className="w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-bold text-white">상세 리포트 보기</button>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
          <h3 className="text-2xl font-black text-white">출시 전 반드시 포함할 기능</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-xl bg-white/[0.04] p-3">✔ Firebase 로그인 및 사용자 저장</div>
            <div className="rounded-xl bg-white/[0.04] p-3">✔ 실제 사주 계산 엔진 연결</div>
            <div className="rounded-xl bg-white/[0.04] p-3">✔ 위치 권한 및 방향운 처리</div>
            <div className="rounded-xl bg-white/[0.04] p-3">✔ 개인정보처리방침 / 이용약관 URL</div>
            <div className="rounded-xl bg-white/[0.04] p-3">✔ 관리자 비밀번호 및 통계 보호</div>
            <div className="rounded-xl bg-white/[0.04] p-3">✔ 문의하기 / 탈퇴 / 공지사항</div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
          <h3 className="text-2xl font-black text-white">필수 정책 문구</h3>
          <div className="mt-4 rounded-2xl bg-white/[0.04] p-4 text-sm leading-7 text-slate-300">
            본 서비스는 사주팔자 및 통계 데이터를 기반으로 한 참고용 운세 서비스입니다.
            건강·투자·법률·사고 여부를 단정하지 않으며, 중요한 결정은 사용자의 판단과 전문가 상담을 함께 고려해 주세요.
            위치 정보는 방향운 계산에만 사용되며, 유명인 정보는 익명 통계 형태로만 활용됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");
  const menu = useMemo(() => [
    ["home", "홈", Home],
    ["luck", "오늘의 흐름", CalendarDays],
    ["stats", "통계", BarChart3],
    ["preview", "스토어", Star],
    ["admin", "관리자", Settings],
  ], []);

  return (
    <div className="min-h-screen bg-[#050816] p-3 text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,.35),transparent_35%),radial-gradient(circle_at_top_right,rgba(56,189,248,.2),transparent_32%)]" />
      <header className="mx-auto mb-4 flex max-w-7xl items-center justify-between rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-2xl">
        <div>
          <div className="text-xs text-violet-300">AI · 통계 기반 운세 플랫폼</div>
          <h1 className="text-2xl font-black text-white">운세플로우</h1>
        </div>
        <div className="rounded-xl bg-violet-500/20 px-4 py-2 text-sm text-violet-100">Beta Preview v1.0</div>
      </header>
      <main className="mx-auto max-w-7xl pb-24">
        {tab === "admin" ? <Admin /> : tab === "preview" ? <ScreenshotPreview /> : <UserHome />}
      </main>
      <nav className="fixed bottom-3 left-1/2 z-10 grid w-[calc(100%-24px)] max-w-2xl -translate-x-1/2 grid-cols-5 rounded-2xl border border-white/10 bg-slate-950/90 p-2 shadow-2xl backdrop-blur">
        {menu.map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={`rounded-xl px-2 py-3 text-xs ${tab === id ? "bg-violet-500 text-white" : "text-slate-400"}`}>
            <Icon className="mx-auto mb-1" size={18} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
