import React from "react";

import {
  getManse,
  getDangSaju,
  getTojung,
  getLifeTimeline,
} from "./lifeFortuneEngine";

function safeScore(score) {
  const n = Number(score || 0);
  return Math.max(0, Math.min(100, Math.round(n)));
}

function ScoreBar({ score }) {
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-violet-400"
        style={{ width: `${safeScore(score)}%` }}
      />
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
      <h3 className="text-xl font-black text-white">{title}</h3>
      {subtitle ? (
        <p className="mt-1 text-xs leading-5 text-slate-400">{subtitle}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Card({ title, color, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className={`text-sm font-bold ${color || "text-cyan-300"}`}>
        {title}
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-300">{children}</div>
    </div>
  );
}

function hashText(text) {
  let h = 0;
  const str = String(text || "");
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function getBirthKey(profile) {
  const p = profile || {};
  return `${p.birthDate || ""}-${p.birthTime || ""}-${p.gender || ""}`;
}

function getBirthYear(profile) {
  const p = profile || {};
  return Number((p.birthDate || "1990").slice(0, 4)) || 1990;
}

function getZodiac(year) {
  const list = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  return list[(year + 8) % 12];
}

function getSamjae(profile) {
  const birthYear = getBirthYear(profile);
  const zodiac = getZodiac(birthYear);
  const nowYear = new Date().getFullYear();
  const yearBranch = getZodiac(nowYear);

  const groupMap = {
    "신": ["인", "묘", "진"],
    "자": ["인", "묘", "진"],
    "진": ["인", "묘", "진"],
    "해": ["사", "오", "미"],
    "묘": ["사", "오", "미"],
    "미": ["사", "오", "미"],
    "인": ["신", "유", "술"],
    "오": ["신", "유", "술"],
    "술": ["신", "유", "술"],
    "사": ["해", "자", "축"],
    "유": ["해", "자", "축"],
    "축": ["해", "자", "축"],
  };

  const years = groupMap[zodiac] || [];
  const idx = years.indexOf(yearBranch);

  if (idx === -1) {
    return {
      zodiac,
      status: "삼재 아님",
      level: "안정",
      text: "올해는 큰 삼재 흐름은 약합니다. 다만 무리한 계약, 대출, 급한 투자 판단은 조심하는 것이 좋습니다.",
    };
  }

  return {
    zodiac,
    status: idx === 0 ? "들삼재" : idx === 1 ? "눌삼재" : "날삼재",
    level: idx === 0 ? "진입" : idx === 1 ? "정체" : "마무리",
    text:
      idx === 0
        ? "삼재가 들어오는 시기입니다. 새로운 일은 신중히 시작하고 무리한 확장은 피하는 편이 좋습니다."
        : idx === 1
        ? "삼재 기운이 눌러앉는 시기입니다. 건강, 돈, 인간관계에서 방어적으로 가는 것이 좋습니다."
        : "삼재가 빠져나가는 시기입니다. 끝맺음과 정리가 중요하며 회복 흐름을 만드는 것이 좋습니다.",
  };
}

function getDeep(profile) {
  const seed = hashText(getBirthKey(profile));

  const types = ["분석형", "추진형", "사업형", "고독형", "인연형", "재물형"];
  const strengths = ["분석력", "기획력", "생존력", "집중력", "설득력", "재물감각"];
  const weaknesses = ["성급함", "고집", "과소비", "감정 기복", "몰빵 성향", "인간관계 피로"];

  const tenGods = [
    ["비견", "자존심과 독립성이 강합니다. 혼자 결정할 때 힘이 살아나지만 고집은 줄여야 합니다."],
    ["겁재", "경쟁심과 승부욕이 있습니다. 지인·동료와 돈 문제는 분리하는 것이 좋습니다."],
    ["식신", "먹고사는 재주와 꾸준함이 강합니다. 기술·콘텐츠·반복 수익에 유리합니다."],
    ["상관", "표현력과 아이디어가 강합니다. 말실수와 조직 충돌은 조심해야 합니다."],
    ["편재", "사업감각과 큰돈 흐름에 민감합니다. 기회는 있지만 과욕은 위험합니다."],
    ["정재", "월급·저축·관리형 재물운이 좋습니다. 안정적인 자산 형성에 유리합니다."],
    ["편관", "압박 속에서 성장하는 타입입니다. 위기 대응력은 좋지만 스트레스 관리가 필요합니다."],
    ["정관", "직장·명예·책임운이 있습니다. 규칙과 신뢰를 지키면 평가가 올라갑니다."],
    ["편인", "직감·연구·비주류 감각이 강합니다. 혼자 파고드는 일에 재능이 있습니다."],
    ["정인", "학습·문서·자격·보호운이 있습니다. 공부와 준비가 운을 키웁니다."],
  ];

  const stages = [
    ["장생", "새로 시작하고 배우는 힘이 좋습니다."],
    ["목욕", "인기와 변화가 있으나 감정 기복을 조심해야 합니다."],
    ["관대", "자신감과 성장운이 강합니다."],
    ["건록", "자립과 직업 기반을 세우는 힘이 있습니다."],
    ["제왕", "에너지가 강한 대신 독단을 조심해야 합니다."],
    ["쇠", "무리한 확장보다 관리가 중요한 흐름입니다."],
    ["병", "건강과 컨디션 관리가 필요합니다."],
    ["사", "정리와 내려놓음이 필요한 흐름입니다."],
    ["묘", "저장·축적·숨은 기회가 있는 흐름입니다."],
    ["절", "끊고 새로 바꾸는 변화운이 강합니다."],
    ["태", "준비 단계입니다. 성급히 결과를 보려 하면 흔들립니다."],
    ["양", "회복과 보호의 흐름입니다. 기반을 다지기 좋습니다."],
  ];

  return {
    type: types[seed % types.length],
    strong: strengths[seed % strengths.length],
    weak: weaknesses[(seed >> 4) % weaknesses.length],
    ten: tenGods[seed % tenGods.length],
    stage: stages[(seed >> 3) % stages.length],
  };
}

function getMonthlyFlow(profile) {
  const seed = hashText(getBirthKey(profile) + new Date().getFullYear());
  const labels = [
    "시작·계획", "관계·연락", "재물·소비", "이동·변화",
    "건강·휴식", "계약·문서", "귀인·도움", "직업·성과",
    "정리·수정", "인연·호감", "주의·방어", "회복·마무리",
  ];

  return Array.from({ length: 12 }, function (_, i) {
    const score = safeScore(45 + ((seed >> (i % 12)) % 45) + ((i * 7) % 16) - 8);
    return {
      month: i + 1,
      score,
      label: labels[(seed + i) % labels.length],
      text:
        score >= 75
          ? "강하게 움직여도 좋은 달입니다."
          : score >= 60
          ? "무난하게 진행 가능한 달입니다."
          : score >= 45
          ? "확인 후 천천히 진행할 달입니다."
          : "방어와 절제가 필요한 달입니다.",
    };
  });
}

export default function LifeFortunePage({ profile }) {
  const manse = getManse(profile) || {};
  const dang = getDangSaju(profile) || {};
  const toj = getTojung(profile) || {};
  const timeline = getLifeTimeline(profile) || [];

  const safeDang = {
    early: dang.early || { age: "초년", title: "초년운", score: 50, text: "초년 흐름 데이터 준비 중" },
    middle: dang.middle || { age: "중년", title: "중년운", score: 50, text: "중년 흐름 데이터 준비 중" },
    late: dang.late || { age: "말년", title: "말년운", score: 50, text: "말년 흐름 데이터 준비 중" },
    peakLoveAge: dang.peakLoveAge || "-",
    peakMoneyAge: dang.peakMoneyAge || "-",
    cautionAge: dang.cautionAge || "-",
  };

  const safeToj = {
    year: toj.year || new Date().getFullYear(),
    total: toj.total || 50,
    text: toj.text || "올해 토정비결 데이터를 계산 중입니다.",
    bestMonths: toj.bestMonths || [],
    cautionMonths: toj.cautionMonths || [],
  };

  const samjae = getSamjae(profile);
  const deep = getDeep(profile);
  const monthly = getMonthlyFlow(profile);

  const bestMonths = monthly.slice().sort((a, b) => b.score - a.score).slice(0, 3);
  const cautionMonths = monthly.slice().sort((a, b) => a.score - b.score).slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <p className="text-xs text-violet-300">만세력 기반</p>
        <h2 className="mt-1 text-2xl font-black text-white">
          당사주 · 토정비결 · 인생 총운
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          생년월일시 기준 사주팔자, 삼재, 십성, 12운성, 월별 흐름을 함께 봅니다.
        </p>
      </div>

      <Section title="만세력 사주팔자" subtitle="년주 · 월주 · 일주 · 시주">
        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <Card title="년주" color="text-violet-300">{manse.yearPillar || "-"}</Card>
          <Card title="월주" color="text-cyan-300">{manse.monthPillar || "-"}</Card>
          <Card title="일주" color="text-yellow-300">{manse.dayPillar || "-"}</Card>
          <Card title="시주" color="text-emerald-300">{manse.hourPillar || "-"}</Card>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          음력 변환: {manse.lunarText || "계산 중"}
        </p>
      </Section>

      <div className="grid gap-3 md:grid-cols-3">
        {[safeDang.early, safeDang.middle, safeDang.late].map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
            <div className="text-xs text-violet-300">{item.age}</div>
            <h3 className="mt-1 text-xl font-black text-white">{item.title}</h3>
            <div className="mt-2 text-2xl font-black text-cyan-300">{item.score}점</div>
            <ScoreBar score={item.score} />
            <p className="mt-3 text-xs leading-5 text-slate-300">{item.text}</p>
          </div>
        ))}
      </div>

      <Section title="타고난 운명 해석" subtitle="성향 · 십성 · 12운성">
        <div className="grid gap-3 md:grid-cols-2">
          <Card title="기본 성향" color="text-cyan-300">
            이 사주는 {deep.type} 성향이 강합니다. 강점은 {deep.strong}이고,
            조심할 부분은 {deep.weak}입니다.
          </Card>
          <Card title={"십성 흐름 · " + deep.ten[0]} color="text-yellow-300">
            {deep.ten[1]}
          </Card>
          <Card title={"12운성 흐름 · " + deep.stage[0]} color="text-emerald-300">
            {deep.stage[1]}
          </Card>
          <Card title="인생 운영법" color="text-pink-300">
            단기 감정 판단보다 기록, 분석, 반복 검증을 통해 운이 좋아지는 구조입니다.
          </Card>
        </div>
      </Section>

      <Section title="가족·인연 복 해석" subtitle="부모복 · 형제복 · 배우자운 · 자식운">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card title="부모복" color="text-violet-300">초년에는 도움과 간섭이 함께 들어오는 흐름입니다.</Card>
          <Card title="형제·지인복" color="text-cyan-300">돈거래, 보증, 감정적 약속은 피하는 것이 좋습니다.</Card>
          <Card title="배우자운" color="text-pink-300">빠른 만남보다 오래 검증된 인연이 안정적입니다.</Card>
          <Card title="자식·후배운" color="text-emerald-300">아래 사람을 챙기거나 가르치는 역할에서 운이 살아납니다.</Card>
        </div>
      </Section>

      <Section title="삼재·주의 흐름" subtitle="띠 기준 삼재 흐름 자동 계산">
        <div className="grid gap-3 md:grid-cols-3">
          <Card title="나의 띠" color="text-cyan-300">{samjae.zodiac}띠</Card>
          <Card title="올해 삼재" color="text-yellow-300">{samjae.status}</Card>
          <Card title="상태" color="text-pink-300">{samjae.level}</Card>
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">
          {samjae.text}
        </div>
      </Section>

      <Section title="재물·직업·투자 흐름" subtitle="돈이 들어오는 방식과 피해야 할 패턴">
        <div className="grid gap-3 md:grid-cols-3">
          <Card title="직업운" color="text-cyan-300">분석, 기획, 기술, 운영, 데이터, 관리형 분야와 잘 맞습니다.</Card>
          <Card title="재물운" color="text-yellow-300">한 번에 크게 벌기보다 누적 수익과 현금 관리가 맞습니다.</Card>
          <Card title="투자 주의" color="text-rose-300">몰빵, 미수, 대출 투자, 급등주 추격은 손실운을 키울 수 있습니다.</Card>
        </div>
      </Section>

      <Section title={safeToj.year + "년 토정비결"} subtitle="올해 전체 흐름">
        <div className="text-3xl font-black text-yellow-300">{safeToj.total}점</div>
        <ScoreBar score={safeToj.total} />
        <p className="mt-3 text-sm leading-6 text-slate-300">{safeToj.text}</p>
        <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-200">
            좋은 달: {safeToj.bestMonths.join("월, ")}월
          </div>
          <div className="rounded-xl bg-rose-500/10 p-3 text-rose-200">
            조심할 달: {safeToj.cautionMonths.join("월, ")}월
          </div>
        </div>
      </Section>

      <Section title="올해 12개월 흐름" subtitle="월별 점수 · 좋은 달 · 조심할 달">
        <div className="grid gap-2 md:grid-cols-3">
          {monthly.map((m) => (
            <div key={m.month} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between">
                <div className="font-black text-white">{m.month}월</div>
                <div className="text-cyan-300">{m.score}점</div>
              </div>
              <ScoreBar score={m.score} />
              <div className="mt-2 text-xs font-bold text-violet-300">{m.label}</div>
              <div className="mt-1 text-xs leading-5 text-slate-400">{m.text}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-200">
            강한 달: {bestMonths.map((m) => `${m.month}월`).join(", ")}
          </div>
          <div className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-200">
            조심할 달: {cautionMonths.map((m) => `${m.month}월`).join(", ")}
          </div>
        </div>
      </Section>

      <Section title="핵심 시기" subtitle="인연 · 재물 · 주의 나이">
        <div className="grid gap-2 text-sm md:grid-cols-3">
          <div className="rounded-xl bg-white/[0.04] p-3">최고의 인연운: {safeDang.peakLoveAge}세 전후</div>
          <div className="rounded-xl bg-white/[0.04] p-3">재물 상승기: {safeDang.peakMoneyAge}세 전후</div>
          <div className="rounded-xl bg-white/[0.04] p-3">주의 시기: {safeDang.cautionAge}세 전후</div>
        </div>
      </Section>

      <Section title="인생 총 스케줄" subtitle="10대부터 60대 이후까지 큰 흐름">
        <div className="space-y-3">
          {timeline.map((item) => (
            <div key={item.age} className="rounded-xl bg-white/[0.04] p-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-white">{item.age}</div>
                <div className="text-cyan-300">{item.score}점</div>
              </div>
              <ScoreBar score={item.score} />
              <p className="mt-2 text-xs text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
