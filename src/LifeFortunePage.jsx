import React from "react";

import {
  getManse,
  getDangSaju,
  getTojung,
  getLifeTimeline,
} from "./lifeFortuneEngine";

function ScoreBar({ score }) {
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-violet-400"
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

export default function LifeFortunePage({ profile }) {
  const manse = getManse(profile);
  const dang = getDangSaju(profile);
  const toj = getTojung(profile);
  const timeline = getLifeTimeline(profile);

  <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/70 p-5">
  <h3 className="text-xl font-black text-white">
    타고난 운명 해석
  </h3>

  <div className="mt-4 grid gap-3 md:grid-cols-2">
    <div className="rounded-xl bg-white/[0.04] p-4">
      <div className="text-sm font-bold text-cyan-300">
        기본 성향
      </div>

      <div className="mt-2 text-sm leading-6 text-slate-300">
        강한 독립성과 추진력이 있으며,
        한 분야를 오래 파고드는 흐름이 강합니다.
        사람에게 휘둘리기보다 스스로 판단할 때 운이 살아납니다.
      </div>
    </div>

    <div className="rounded-xl bg-white/[0.04] p-4">
      <div className="text-sm font-bold text-pink-300">
        인연·배우자 운
      </div>

      <div className="mt-2 text-sm leading-6 text-slate-300">
        인연운은 늦게 강해지는 흐름입니다.
        초반 인간관계보다 30대 이후 안정되는 구조가 강합니다.
      </div>
    </div>

    <div className="rounded-xl bg-white/[0.04] p-4">
      <div className="text-sm font-bold text-yellow-300">
        재물 흐름
      </div>

      <div className="mt-2 text-sm leading-6 text-slate-300">
        재물운은 변동성이 큰 편이며,
        큰 기회와 큰 손실 흐름이 함께 들어올 수 있습니다.
        무리한 투자보다 분산 흐름이 유리합니다.
      </div>
    </div>

    <div className="rounded-xl bg-white/[0.04] p-4">
      <div className="text-sm font-bold text-emerald-300">
        말년 흐름
      </div>

      <div className="mt-2 text-sm leading-6 text-slate-300">
        후반으로 갈수록 안정운이 강해지며,
        인간관계보다 건강과 평온이 중요해지는 흐름입니다.
      </div>
    </div>
  </div>
</div>
  
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

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <h3 className="font-black text-white">만세력 사주팔자</h3>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div className="rounded-xl bg-white/[0.04] p-3">
            년주
            <br />
            {manse.yearPillar}
          </div>

          <div className="rounded-xl bg-white/[0.04] p-3">
            월주
            <br />
            {manse.monthPillar}
          </div>

          <div className="rounded-xl bg-white/[0.04] p-3">
            일주
            <br />
            {manse.dayPillar}
          </div>

          <div className="rounded-xl bg-white/[0.04] p-3">
            시주
            <br />
            {manse.hourPillar}
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-400">
          음력 변환: {manse.lunarText}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[dang.early, dang.middle, dang.late].map((item) => (
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

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <h3 className="text-xl font-black text-white">핵심 시기</h3>

        <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
          <div className="rounded-xl bg-white/[0.04] p-3">
            최고의 인연운: {dang.peakLoveAge}세 전후
          </div>

          <div className="rounded-xl bg-white/[0.04] p-3">
            재물 상승기: {dang.peakMoneyAge}세 전후
          </div>

          <div className="rounded-xl bg-white/[0.04] p-3">
            주의 시기: {dang.cautionAge}세 전후
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <h3 className="text-xl font-black text-white">
          {toj.year}년 토정비결
        </h3>

        <div className="mt-2 text-3xl font-black text-yellow-300">
          {toj.total}점
        </div>

        <ScoreBar score={toj.total} />

        <p className="mt-3 text-sm leading-6 text-slate-300">
          {toj.text}
        </p>

        <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-200">
            좋은 달: {toj.bestMonths.join("월, ")}월
          </div>

          <div className="rounded-xl bg-rose-500/10 p-3 text-rose-200">
            조심할 달: {toj.cautionMonths.join("월, ")}월
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <h3 className="text-xl font-black text-white">
          인생 총 스케줄
        </h3>

        <div className="mt-3 space-y-3">
          {timeline.map((item) => (
            <div
              key={item.age}
              className="rounded-xl bg-white/[0.04] p-3"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-white">
                  {item.age}
                </div>

                <div className="text-cyan-300">
                  {item.score}점
                </div>
              </div>

              <ScoreBar score={item.score} />

              <p className="mt-2 text-xs text-slate-400">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
