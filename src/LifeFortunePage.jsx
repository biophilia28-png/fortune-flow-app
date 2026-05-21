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
        style={{ width: `${score || 0}%` }}
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

export default function LifeFortunePage({ profile }) {
  const manse = getManse(profile);
  const dang = getDangSaju(profile);
  const toj = getTojung(profile);
  const timeline = getLifeTimeline(profile);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <p className="text-xs text-violet-300">만세력 기반</p>
        <h2 className="mt-1 text-2xl font-black text-white">
          당사주 · 토정비결 · 인생 총운
        </h2>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <h3 className="font-black text-white">만세력 사주팔자</h3>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div className="rounded-xl bg-white/[0.04] p-3">년주<br />{manse.yearPillar}</div>
          <div className="rounded-xl bg-white/[0.04] p-3">월주<br />{manse.monthPillar}</div>
          <div className="rounded-xl bg-white/[0.04] p-3">일주<br />{manse.dayPillar}</div>
          <div className="rounded-xl bg-white/[0.04] p-3">시주<br />{manse.hourPillar}</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[dang.early, dang.middle, dang.late].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-slate-950/80 p-4"
          >
            <div className="text-xs text-violet-300">{item.age}</div>
            <h3 className="mt-1 text-xl font-black text-white">{item.title}</h3>
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
        <h3 className="text-xl font-black text-white">타고난 운명 해석</h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Card title="기본 성향">
            독립성과 추진력이 있으며 한 분야를 깊게 파고드는 흐름입니다.
          </Card>

          <Card title="인연·배우자운">
            빠른 인연보다 오래 검증된 인연에서 안정됩니다.
          </Card>

          <Card title="재물 흐름">
            큰 기회와 손실 흐름이 함께 오므로 분산과 현금 관리가 중요합니다.
          </Card>

          <Card title="직업운">
            분석, 기획, 기술, 운영, 데이터형 일이 잘 맞습니다.
          </Card>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <h3 className="text-xl font-black text-white">{toj.year}년 토정비결</h3>

        <div className="mt-2 text-3xl font-black text-yellow-300">
          {toj.total}점
        </div>

        <ScoreBar score={toj.total} />

        <p className="mt-3 text-sm leading-6 text-slate-300">
          {toj.text}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <h3 className="text-xl font-black text-white">인생 총 스케줄</h3>

        <div className="mt-3 space-y-3">
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
      </div>
    </div>
  );
}
