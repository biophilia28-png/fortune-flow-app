import React from "react";
import {
  getManse,
  getDangSaju,
  getTojung,
  getLifeTimeline,
} from "./lifeFortuneEngine";

function ScoreBar({ score }) {
  const value = Math.max(0, Math.min(100, Number(score || 0)));

  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-violet-400"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-sm font-bold text-cyan-300">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-300">{children}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
      <h3 className="text-xl font-black text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function makeMonthlyFlow(profile) {
  const seedText = `${profile?.birthDate || ""}-${profile?.birthTime || ""}`;
  let seed = 0;

  for (let i = 0; i < seedText.length; i++) {
    seed += seedText.charCodeAt(i) * (i + 1);
  }

  const labels = [
    "재물운",
    "인연운",
    "이동운",
    "건강운",
    "직업운",
    "계약운",
    "귀인운",
    "주의운",
    "회복운",
    "정리운",
    "확장운",
    "마무리운",
  ];

  return Array.from({ length: 12 }, (_, i) => {
    const score = 45 + ((seed + i * 17) % 46);

    return {
      month: i + 1,
      score,
      label: labels[i],
      text:
        score >= 80
          ? "강하게 움직여도 좋은 달입니다."
          : score >= 65
          ? "무난하게 진행 가능한 달입니다."
          : score >= 50
          ? "확인 후 천천히 가는 달입니다."
          : "방어와 절제가 필요한 달입니다.",
    };
  });
}

function getSamjae(profile) {
  const year = Number((profile?.birthDate || "1990").slice(0, 4)) || 1990;
  const zodiacs = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  const myZodiac = zodiacs[(year + 8) % 12];

  return {
    zodiac: myZodiac,
    status: "참고용 삼재",
    text: "삼재는 띠 기준으로 보는 큰 주의 흐름입니다. 실제 판단은 개인 사주와 세운을 함께 봐야 합니다.",
  };
}

export default function LifeFortunePage({ profile }) {
  const manse = getManse(profile) || {};
  const dang = getDangSaju(profile) || {};
  const toj = getTojung(profile) || {};
  const timeline = getLifeTimeline(profile) || [];

  const safeDang = {
    early: dang.early || { age: "0세~30세", title: "초년운", score: 50, text: "초년운 계산 중" },
    middle: dang.middle || { age: "31세~55세", title: "중년운", score: 50, text: "중년운 계산 중" },
    late: dang.late || { age: "56세 이후", title: "말년운", score: 50, text: "말년운 계산 중" },
    peakLoveAge: dang.peakLoveAge || "-",
    peakMoneyAge: dang.peakMoneyAge || "-",
    cautionAge: dang.cautionAge || "-",
  };

  const safeToj = {
    year: toj.year || new Date().getFullYear(),
    total: toj.total || 50,
    text: toj.text || "올해 토정비결 흐름을 계산 중입니다.",
    bestMonths: toj.bestMonths || [],
    cautionMonths: toj.cautionMonths || [],
  };

  const monthly = makeMonthlyFlow(profile);
  const samjae = getSamjae(profile);

  const bestMonths = monthly
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const cautionMonths = monthly
    .slice()
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <p className="text-xs text-violet-300">만세력 기반</p>

        <h2 className="mt-1 text-2xl font-black text-white">
          당사주 · 토정비결 · 인생 총운
        </h2>

        <p className="mt-2 text-xs text-slate-400">
          생년월일시 기준 사주팔자와 연도 흐름을 함께 봅니다.
        </p>
      </div>

      <Section title="만세력 사주팔자">
        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <Card title="년주">{manse.yearPillar || "-"}</Card>
          <Card title="월주">{manse.monthPillar || "-"}</Card>
          <Card title="일주">{manse.dayPillar || "-"}</Card>
          <Card title="시주">{manse.hourPillar || "-"}</Card>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-400">
          음력 변환: {manse.lunarText || "계산 중"}
        </p>
      </Section>

      <div className="grid gap-3 md:grid-cols-3">
        {[safeDang.early, safeDang.middle, safeDang.late].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-slate-950/80 p-4"
          >
            <div className="text-xs text-violet-300">{item.age}</div>

            <h3 className="mt-1 text-xl font-black text-white">
              {item.title}
            </h3>

            <div className="mt-2 text-2xl font-black text-cyan-300">
              {item.score}점
            </div>

            <ScoreBar score={item.score} />

            <p className="mt-3 text-xs leading-5 text-slate-300">
              {item.text}
            </p>
          </div>
        ))}
      </div>

  <Section title="타고난 운명 해석">
  <div className="grid gap-3 md:grid-cols-2">
    <Card title="기본 성향">
      독립성과 추진력이 있으며 한 분야를 깊게 파고드는 흐름입니다.
      남에게 휘둘리기보다 스스로 기준을 세울 때 운이 살아납니다.
    </Card>

    <Card title="십성 해석">
      식신·상관 기운은 표현력, 기술, 생산력과 관련됩니다.
      정재·편재 기운은 돈을 버는 방식과 재물 감각을 봅니다.
      정관·편관은 직업, 책임, 압박 속 성장 흐름을 의미합니다.
    </Card>

    <Card title="12운성 해석">
      장생·관대·건록·제왕은 성장과 활동성이 강한 흐름이고,
      쇠·병·사·묘·절은 정리와 변화가 필요한 흐름입니다.
      태·양은 준비와 회복의 기운으로 봅니다.
    </Card>

    <Card title="인생 운영법">
      단기 감정 판단보다 기록, 분석, 반복 검증을 통해 운이 좋아지는 구조입니다.
      특히 돈과 사람 문제는 즉흥보다 기준을 세워야 합니다.
    </Card>

    <Card title="재능 방향">
      기획, 분석, 운영, 기술, 데이터, 콘텐츠처럼 혼자 깊게 파고들 수 있는 분야가 잘 맞습니다.
      반복 개선형 일에서 성과가 쌓이는 흐름입니다.
    </Card>

    <Card title="주의할 습관">
      급한 결정, 감정적 소비, 무리한 투자, 인간관계에서의 의리 지출을 조심해야 합니다.
      좋은 운도 관리하지 않으면 손실로 바뀔 수 있습니다.
    </Card>
    <Section title="재물·직업 상세 해석">
  <div className="grid gap-3 md:grid-cols-2">
    <Card title="돈이 들어오는 방식">
      한 번에 크게 버는 운보다 작은 수익을 반복해서 쌓는 구조가 유리합니다.
      고정수입, 부업, 자동화 수익, 콘텐츠 수익처럼 누적형 구조가 좋습니다.
    </Card>

    <Card title="돈이 새는 패턴">
      감정적 소비, 급등주 추격, 지인 말만 믿는 투자, 손실 만회성 매매를 조심해야 합니다.
      특히 한 번 손실이 나면 더 크게 베팅하려는 흐름을 끊어야 합니다.
    </Card>

    <Card title="직업 적성">
      분석, 기획, 개발, 운영, 데이터, 리서치, 상담, 교육, 콘텐츠 제작 쪽이 잘 맞습니다.
      혼자 깊게 파고드는 일에서 성과가 쌓입니다.
    </Card>

    <Card title="사업운">
      빠른 확장보다 작게 테스트하고 검증한 뒤 키우는 방식이 유리합니다.
      처음부터 큰돈을 넣기보다 무료 사용자, 광고, 소액 결제 구조부터 보는 것이 좋습니다.
    </Card>

    <Card title="투자 주의">
      미수, 신용, 대출 투자, 몰빵은 운이 좋아도 한 번에 흐름을 망칠 수 있습니다.
      매수 전 손절가와 분할 기준을 먼저 정해야 합니다.
    </Card>

    <Card title="재물운 살리는 습관">
      매일 기록, 손익 복기, 지출 통제, 현금 비중 유지가 중요합니다.
      운보다 먼저 시스템을 만들면 손실 흐름이 줄어듭니다.
    </Card>
  </div>
</Section>
  </div>
</Section>
      <Section title="삼재·주의 흐름">
        <div className="grid gap-3 md:grid-cols-3">
          <Card title="나의 띠">{samjae.zodiac}띠</Card>
          <Card title="삼재 상태">{samjae.status}</Card>
          <Card title="주의 안내">{samjae.text}</Card>
        </div>
      </Section>

      <Section title={`${safeToj.year}년 토정비결`}>
        <div className="text-3xl font-black text-yellow-300">
          {safeToj.total}점
        </div>

        <ScoreBar score={safeToj.total} />

        <p className="mt-3 text-sm leading-6 text-slate-300">
          {safeToj.text}
        </p>

        <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-200">
            좋은 달: {safeToj.bestMonths.join("월, ")}월
          </div>

          <div className="rounded-xl bg-rose-500/10 p-3 text-rose-200">
            조심할 달: {safeToj.cautionMonths.join("월, ")}월
          </div>
        </div>
      </Section>

      <Section title="올해 12개월 흐름">
        <div className="grid gap-2 md:grid-cols-3">
          {monthly.map((m) => (
            <div
              key={m.month}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
            >
              <div className="flex items-center justify-between">
                <div className="font-black text-white">{m.month}월</div>
                <div className="text-cyan-300">{m.score}점</div>
              </div>

              <ScoreBar score={m.score} />

              <div className="mt-2 text-xs font-bold text-violet-300">
                {m.label}
              </div>

              <div className="mt-1 text-xs leading-5 text-slate-400">
                {m.text}
              </div>
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

      <Section title="핵심 시기">
        <div className="grid gap-2 text-sm md:grid-cols-3">
          <div className="rounded-xl bg-white/[0.04] p-3">
            최고의 인연운: {safeDang.peakLoveAge}세 전후
          </div>

          <div className="rounded-xl bg-white/[0.04] p-3">
            재물 상승기: {safeDang.peakMoneyAge}세 전후
          </div>

          <div className="rounded-xl bg-white/[0.04] p-3">
            주의 시기: {safeDang.cautionAge}세 전후
          </div>
        </div>
      </Section>

      <Section title="인생 총 스케줄">
        <div className="space-y-3">
          {timeline.map((item) => (
            <div key={item.age} className="rounded-xl bg-white/[0.04] p-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-white">{item.age}</div>
                <div className="text-cyan-300">{item.score}점</div>
              </div>

              <ScoreBar score={item.score} />

              <p className="mt-2 text-xs text-slate-400">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
