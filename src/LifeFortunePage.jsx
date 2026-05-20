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

import { Solar } from "lunar-javascript";

function safe(v, fallback = "") {
  return v || fallback;
}

export function getManse(profile) {
  const birthDate = profile.birthDate || "1990-01-01";
  const birthTime = profile.birthTime || "12:00";

  const y = Number(birthDate.slice(0, 4));
  const m = Number(birthDate.slice(5, 7));
  const d = Number(birthDate.slice(8, 10));
  const hh = Number(birthTime.slice(0, 2));
  const mm = Number(birthTime.slice(3, 5)) || 0;

  const solar = Solar.fromYmdHms(y, m, d, hh, mm, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  return {
    solarText: solar.toYmdHms(),
    lunarText: lunar.toString(),
    yearPillar: eightChar.getYear(),
    monthPillar: eightChar.getMonth(),
    dayPillar: eightChar.getDay(),
    hourPillar: eightChar.getTime(),
    fullText: lunar.toFullString(),
  };
}

export function getDangSaju(profile) {
  const manse = getManse(profile);
  const seed = manse.yearPillar + manse.monthPillar + manse.dayPillar + manse.hourPillar;

  let n = 0;
  for (let i = 0; i < seed.length; i++) n += seed.charCodeAt(i) * (i + 1);

  const peakLoveAge = 24 + (n % 18);
  const peakMoneyAge = 33 + ((n >> 2) % 24);
  const cautionAge = 29 + ((n >> 4) % 22);

  return {
    early: {
      title: "초년운",
      age: "0세 ~ 30세",
      score: 50 + (n % 35),
      text: "초년에는 환경 변화, 가족운, 학업운, 인간관계의 영향을 크게 받는 흐름입니다.",
    },
    middle: {
      title: "중년운",
      age: "31세 ~ 55세",
      score: 55 + ((n >> 3) % 35),
      text: "중년에는 직업운, 재물운, 인연운이 본격적으로 강해지는 시기입니다.",
    },
    late: {
      title: "말년운",
      age: "56세 이후",
      score: 52 + ((n >> 5) % 36),
      text: "말년에는 건강, 안정, 가족, 재물 보존 흐름이 중요해집니다.",
    },
    peakLoveAge,
    peakMoneyAge,
    cautionAge,
  };
}

export function getTojung(profile) {
  const manse = getManse(profile);
  const nowYear = new Date().getFullYear();
  const seed = manse.dayPillar + nowYear + manse.hourPillar;

  let n = 0;
  for (let i = 0; i < seed.length; i++) n += seed.charCodeAt(i) * (i + 3);

  return {
    year: nowYear,
    total: 50 + (n % 45),
    bestMonths: [1 + (n % 12), 1 + ((n >> 3) % 12)],
    cautionMonths: [1 + ((n >> 5) % 12), 1 + ((n >> 7) % 12)],
    text: "올해는 세운 기준으로 인연, 이동, 재물, 직업 변화 흐름을 함께 보는 해입니다.",
  };
}

export function getLifeTimeline(profile) {
  const dang = getDangSaju(profile);

  return [
    { age: "10대", score: dang.early.score, text: "기초운·학업·가족 영향" },
    { age: "20대", score: dang.early.score + 3, text: "진로·연애·이동 변화" },
    { age: "30대", score: dang.middle.score, text: "인연·재물·직업 상승" },
    { age: "40대", score: dang.middle.score + 2, text: "사회운·자산 형성" },
    { age: "50대", score: dang.late.score, text: "안정·건강·가족운" },
    { age: "60대 이후", score: dang.late.score + 1, text: "말년 안정과 재물 보존" },
  ].map((v) => ({
    ...v,
    score: Math.max(5, Math.min(95, Math.round(v.score))),
  }));
}
