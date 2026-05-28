import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import {
  Brain, Clock, Trophy, BookOpen, ChevronRight, ChevronLeft,
  RotateCcw, Home, BarChart2, CheckCircle, XCircle, AlertCircle,
  Play, Star, Target, Zap, Hash, Grid3X3
} from 'lucide-react';
import { ALL_FRT_QUESTIONS } from './data/frtQuestions';
import type { FRTQuestion, Fig } from './data/frtTypes';
import FigureCell from './components/FigureCell';

type View = 'home' | 'practice' | 'exam' | 'results' | 'review' | 'stats';
type Mode = 'matrix3x3' | 'series' | 'oddOneOut' | 'all';

interface Stats {
  totalAnswered: number;
  totalCorrect: number;
  byType: Record<string, { correct: number; total: number }>;
  sessions: { date: string; score: number; total: number; mode: string; timeTaken?: number }[];
}

const EMPTY_STATS: Stats = {
  totalAnswered: 0, totalCorrect: 0,
  byType: { matrix3x3: { correct:0,total:0 }, series: { correct:0,total:0 }, oddOneOut: { correct:0,total:0 } },
  sessions: [],
};

function getStats(): Stats {
  try { const s = localStorage.getItem('mensa_frt_stats'); if (s) return JSON.parse(s); } catch {}
  return EMPTY_STATS;
}
function saveStats(s: Stats) { localStorage.setItem('mensa_frt_stats', JSON.stringify(s)); }

function shuffle<T>(arr: T[], seed = Math.random()): T[] {
  const a = [...arr];
  let s = Math.floor(seed * 0xffffffff);
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 0x6c62272e) + 0xe3a39ce) | 0;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function estimateIQ(score: number, total: number) {
  const p = score / total;
  // Calibrated for MKAT (45q/20min, SD24 scale)
  if (p >= 0.93) return { iq: 148, label: '최상위 0.1% — MKAT 최고 등급', color: 'text-purple-400' };
  if (p >= 0.87) return { iq: 132, label: '멘사코리아 합격권 (상위 2%)', color: 'text-indigo-400' };
  if (p >= 0.78) return { iq: 127, label: '상위 5% — MKAT 합격 근접', color: 'text-blue-400' };
  if (p >= 0.69) return { iq: 122, label: '상위 10% — 우수', color: 'text-sky-400' };
  if (p >= 0.58) return { iq: 115, label: '평균 이상', color: 'text-teal-400' };
  if (p >= 0.47) return { iq: 107, label: '보통 수준', color: 'text-emerald-400' };
  return { iq: 98, label: '추가 연습 필요', color: 'text-amber-400' };
}

const TYPE_LABEL: Record<string, string> = {
  matrix3x3: '행렬 추론 (3×3)',
  series: '수열 완성',
  oddOneOut: '다른 하나 찾기',
};

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function MensaApp() {
  const [view, setView] = useState<View>('home');
  const [mode, setMode] = useState<Mode>('all');
  const [questions, setQuestions] = useState<FRTQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExp, setShowExp] = useState(false);
  const [isExam, setIsExam] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [stats, setStats] = useState<Stats>(getStats);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);

  const stopTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);
  useEffect(() => () => stopTimer(), [stopTimer]);

  function startPractice(m: Mode) {
    setMode(m);
    const pool = m === 'all' ? ALL_FRT_QUESTIONS : ALL_FRT_QUESTIONS.filter(q => q.type === m);
    const qs = shuffle(pool).slice(0, 20);
    setQuestions(qs); setIdx(0); setAnswers(new Array(qs.length).fill(null));
    setSelected(null); setShowExp(false); setIsExam(false); setView('practice');
  }

  function startExam() {
    // MKAT: 45 questions (20 min), all matrix3x3, difficulty-stratified
    const byDiff = (d: number) => ALL_FRT_QUESTIONS.filter(q => q.difficulty === d && q.type === 'matrix3x3');
    const qs = shuffle([
      ...shuffle(byDiff(1)).slice(0, 8),
      ...shuffle(byDiff(2)).slice(0, 12),
      ...shuffle(byDiff(3)).slice(0, 10),
      ...shuffle(byDiff(4)).slice(0, 10),
      ...shuffle(byDiff(5)).slice(0, 5),
    ]);
    setQuestions(qs); setIdx(0); setAnswers(new Array(qs.length).fill(null));
    setSelected(null); setShowExp(false); setIsExam(true);
    setTimeLeft(20 * 60); startRef.current = Date.now(); setView('exam');
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { stopTimer(); return 0; } return t - 1; });
    }, 1000);
  }

  function handleSelect(optIdx: number) {
    if (!isExam && answers[idx] !== null) return;
    setSelected(optIdx);
    if (!isExam) {
      const newAns = [...answers]; newAns[idx] = optIdx; setAnswers(newAns);
      setShowExp(true);
      const q = questions[idx]; const isCorrect = optIdx === q.answer;
      const newStats = { ...stats };
      newStats.byType[q.type] = {
        correct: newStats.byType[q.type].correct + (isCorrect ? 1 : 0),
        total: newStats.byType[q.type].total + 1,
      };
      newStats.totalAnswered++; newStats.totalCorrect += isCorrect ? 1 : 0;
      setStats(newStats); saveStats(newStats);
    }
  }

  function handleExamSelect(optIdx: number) {
    const newAns = [...answers]; newAns[idx] = optIdx; setAnswers(newAns);
    setSelected(optIdx);
  }

  function goNext() {
    if (idx < questions.length - 1) { setIdx(i => i+1); setSelected(answers[idx+1]); setShowExp(false); }
    else finishSession();
  }
  function goPrev() {
    if (idx > 0) { setIdx(i => i-1); setSelected(answers[idx-1]); setShowExp(false); }
  }

  function finishSession(qs = questions, ans = answers) {
    stopTimer();
    const score = qs.reduce((a, q, i) => a + (ans[i] === q.answer ? 1 : 0), 0);
    if (isExam) {
      const timeTaken = Math.round((Date.now() - startRef.current) / 1000);
      const newStats = { ...stats };
      qs.forEach((q, i) => {
        const ok = ans[i] === q.answer;
        newStats.byType[q.type] = { correct: newStats.byType[q.type].correct + (ok?1:0), total: newStats.byType[q.type].total+1 };
        newStats.totalAnswered++; newStats.totalCorrect += ok?1:0;
      });
      newStats.sessions = [{ date: new Date().toISOString(), score, total: qs.length, mode: 'exam', timeTaken }, ...newStats.sessions].slice(0, 20);
      setStats(newStats); saveStats(newStats);
    }
    setView('results');
  }

  const score = questions.reduce((a, q, i) => a + (answers[i] === q.answer ? 1 : 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <AnimatePresence mode="wait">
        {view === 'home' && <HomeView key="home" stats={stats} onPractice={startPractice} onExam={startExam} onStats={() => setView('stats')} />}
        {(view === 'practice' || view === 'exam') && questions.length > 0 && (
          <QuestionView
            key="q"
            q={questions[idx]} idx={idx} total={questions.length}
            selected={isExam ? answers[idx] : selected}
            showExp={showExp} isExam={isExam} timeLeft={timeLeft}
            answeredCount={answers.filter(a => a !== null).length}
            onSelect={isExam ? handleExamSelect : handleSelect}
            onNext={goNext} onPrev={goPrev}
            onFinish={() => finishSession()}
            onHome={() => { stopTimer(); setView('home'); }}
          />
        )}
        {view === 'results' && (
          <ResultsView key="r" questions={questions} answers={answers} score={score} isExam={isExam}
            timeTaken={isExam ? Math.round((Date.now() - startRef.current)/1000) : undefined}
            onHome={() => setView('home')} onReview={() => { setIdx(0); setSelected(answers[0]); setView('review'); }}
            onRetry={() => isExam ? startExam() : startPractice(mode)} />
        )}
        {view === 'review' && (
          <ReviewView key="rev" questions={questions} answers={answers} idx={idx}
            onNext={() => { setIdx(i => i+1); setSelected(answers[idx+1]); }}
            onPrev={() => { setIdx(i => i-1); setSelected(answers[idx-1]); }}
            onBack={() => setView('results')} onHome={() => setView('home')} />
        )}
        {view === 'stats' && <StatsView key="s" stats={stats} onBack={() => setView('home')} onReset={() => { if (confirm('통계를 초기화하시겠습니까?')) { setStats(EMPTY_STATS); saveStats(EMPTY_STATS); }}} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Home View ────────────────────────────────────────────────────────────────

function HomeView({ stats, onPractice, onExam, onStats }: {
  stats: Stats; onPractice: (m:Mode)=>void; onExam: ()=>void; onStats: ()=>void;
}) {
  const acc = stats.totalAnswered > 0 ? Math.round(stats.totalCorrect/stats.totalAnswered*100) : 0;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="min-h-screen flex flex-col">
      <header className="px-6 py-8 text-center relative">
        <button onClick={onStats} className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all">
          <BarChart2 size={16} />통계
        </button>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Grid3X3 size={30} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">멘사코리아 FRT 대비</h1>
        <p className="text-blue-300 text-sm">도형 추리 시험 (Figure Reasoning Test) · 1,000문제</p>
      </header>

      {/* Stats bar */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { label:'풀이 완료', value: stats.totalAnswered, color:'text-blue-300' },
            { label:'정답률', value: acc+'%', color:'text-emerald-400' },
            { label:'시험 횟수', value: stats.sessions.length, color:'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
              <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
              <p className="text-xs text-white/50 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mock Exam */}
      <div className="px-6 mb-6">
        <div className="max-w-lg mx-auto">
          <button onClick={onExam}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 rounded-2xl p-6 text-left transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 group">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1"><Clock size={18} className="text-blue-200" /><span className="text-blue-200 text-sm font-medium">실전 모의고사</span></div>
                <h3 className="text-xl font-bold">FRT 모의시험 시작</h3>
                <p className="text-blue-200 text-sm mt-1">45문제 · 20분 · MKAT 형식 · 6지선다</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play size={22} className="text-white ml-0.5" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Practice modes */}
      <div className="px-6 pb-6">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">유형별 연습</h2>
          <div className="grid grid-cols-2 gap-4">
            {([
              { mode:'all' as Mode, label:'전체 유형 연습', icon:<Zap size={22}/>, desc:'모든 유형 혼합 20문제', color:'from-indigo-500 to-purple-600', count: ALL_FRT_QUESTIONS.length },
              { mode:'matrix3x3' as Mode, label:'행렬 추론', icon:<Grid3X3 size={22}/>, desc:'3×3 도형 행렬 완성', color:'from-blue-500 to-cyan-600', count: ALL_FRT_QUESTIONS.filter(q=>q.type==='matrix3x3').length },
              { mode:'series' as Mode, label:'수열 완성', icon:<Hash size={22}/>, desc:'도형 수열 다음 찾기', color:'from-emerald-500 to-teal-600', count: ALL_FRT_QUESTIONS.filter(q=>q.type==='series').length },
              { mode:'oddOneOut' as Mode, label:'다른 하나 찾기', icon:<Target size={22}/>, desc:'패턴이 다른 도형 선택', color:'from-rose-500 to-pink-600', count: ALL_FRT_QUESTIONS.filter(q=>q.type==='oddOneOut').length },
            ] as { mode:Mode, label:string, icon:React.ReactNode, desc:string, color:string, count:number }[]).map(item => {
              const s = stats.byType[item.mode === 'all' ? 'matrix3x3' : item.mode] || {correct:0,total:0};
              return (
                <button key={item.mode} onClick={() => onPractice(item.mode)}
                  className="bg-white/10 hover:bg-white/20 rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 border border-white/10 hover:border-white/20 group">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br text-white', item.color)}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-sm mb-1">{item.label}</h3>
                  <p className="text-white/50 text-xs mb-2 leading-tight">{item.desc}</p>
                  <p className="text-xs text-white/30">{item.count}문제</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FRT Info */}
      <div className="px-6 pb-10">
        <div className="max-w-lg mx-auto bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex gap-3">
            <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">멘사코리아 FRT란?</p>
              <p className="text-xs text-white/60 leading-relaxed">
                멘사코리아 입회 시험(MKAT)은 <strong className="text-white/80">도형 추리 시험(FRT)</strong>을 사용합니다.
                총 45문제·20분·<strong className="text-white/80">6지선다</strong>, 3×3 행렬 완성 형식으로
                언어·문화·지식에 무관한 순수 패턴 인식 능력을 측정합니다.
                IQ 상위 2% (SD24 기준 148+)가 합격 기준입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Question View (Practice + Exam) ─────────────────────────────────────────

function QuestionView({ q, idx, total, selected, showExp, isExam, timeLeft, answeredCount,
  onSelect, onNext, onPrev, onFinish, onHome }: {
  q: FRTQuestion; idx: number; total: number;
  selected: number | null; showExp: boolean; isExam: boolean;
  timeLeft: number; answeredCount: number;
  onSelect: (i:number)=>void; onNext:()=>void; onPrev:()=>void;
  onFinish:()=>void; onHome:()=>void;
}) {
  const answered = selected !== null && !isExam;
  const isLast = idx === total - 1;

  const fmtTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-slate-900/50">
        <button onClick={onHome} className="p-2 text-white/50 hover:text-white transition-colors"><Home size={20}/></button>
        <div className="flex items-center gap-3">
          {isExam && (
            <span className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold',
              timeLeft < 300 ? 'bg-rose-500/20 text-rose-300' : 'bg-white/10 text-white/80')}>
              <Clock size={15}/>{fmtTime(timeLeft)}
            </span>
          )}
          <span className="text-sm text-white/60">{idx+1}/{total}</span>
        </div>
        {isExam
          ? <button onClick={onFinish} className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">제출</button>
          : <div className="w-16"/>
        }
      </div>

      {/* Progress */}
      <div className="h-1 bg-white/10">
        <motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
          animate={{ width:`${((idx+1)/total)*100}%`}} transition={{duration:0.3}}/>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-2xl mx-auto">
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {TYPE_LABEL[q.type] || q.type}
            </span>
            <span className="text-xs text-white/30">문제 {idx+1}</span>
          </div>

          {/* Question instruction */}
          <p className="text-white/70 text-sm mb-4">
            {q.type === 'matrix3x3' && '다음 3×3 도형 행렬에서 물음표(?) 자리에 들어갈 알맞은 도형을 고르시오.'}
            {q.type === 'series' && '다음 도형 수열에서 물음표(?) 자리에 들어갈 알맞은 도형을 고르시오.'}
            {q.type === 'oddOneOut' && '다음 6개의 도형 중 나머지와 패턴이 다른 하나를 고르시오.'}
          </p>

          {/* Figure Grid */}
          <AnimatePresence mode="wait">
            <motion.div key={q.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}>
              {q.type === 'matrix3x3' && <Matrix3x3 cells={q.cells}/>}
              {q.type === 'series' && <SeriesDisplay cells={q.cells}/>}
              {q.type === 'oddOneOut' && <OddOneOutDisplay cells={q.cells} selected={selected} isExam={isExam} onSelect={onSelect} answer={q.answer} showAnswer={showExp}/>}
            </motion.div>
          </AnimatePresence>

          {/* Options (for matrix and series) — 5지선다 */}
          {(q.type === 'matrix3x3' || q.type === 'series') && (
            <div className="mt-6">
              <p className="text-xs text-white/40 mb-3 uppercase tracking-widest">선택지 (6지선다)</p>
              <div className="flex flex-wrap justify-center gap-2">
                {q.options.map((opt, i) => {
                  let ring = 'ring-transparent';
                  let bg = 'bg-white/10 hover:bg-white/20';
                  if (selected === i) {
                    if (isExam) { ring = 'ring-blue-400'; bg = 'bg-blue-500/20'; }
                    else if (i === q.answer) { ring = 'ring-emerald-400'; bg = 'bg-emerald-500/15'; }
                    else { ring = 'ring-rose-400'; bg = 'bg-rose-500/15'; }
                  } else if (!isExam && showExp && i === q.answer) {
                    ring = 'ring-emerald-400'; bg = 'bg-emerald-500/15';
                  }
                  return (
                    <button key={i} onClick={() => onSelect(i)}
                      disabled={!isExam && selected !== null}
                      className={cn('rounded-2xl p-3 flex flex-col items-center gap-2 transition-all border border-white/10 ring-2 w-[15%] min-w-[60px]', bg, ring,
                        !(!isExam && selected !== null) && 'hover:-translate-y-0.5 cursor-pointer')}>
                      <div className="bg-white rounded-xl p-1.5">
                        <FigureCell fig={opt} size={48}/>
                      </div>
                      <span className="text-xs font-bold text-white/70">{['①','②','③','④','⑤','⑥'][i]}</span>
                      {!isExam && showExp && (
                        i === q.answer ? <CheckCircle size={14} className="text-emerald-400"/> :
                        i === selected ? <XCircle size={14} className="text-rose-400"/> : null
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Explanation */}
          {!isExam && showExp && (
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
              className={cn('mt-5 p-4 rounded-2xl border', selected===q.answer
                ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30')}>
              <div className="flex items-center gap-2 mb-1.5">
                {selected===q.answer
                  ? <CheckCircle size={16} className="text-emerald-400"/>
                  : <XCircle size={16} className="text-rose-400"/>}
                <span className={cn('text-sm font-bold', selected===q.answer ? 'text-emerald-400' : 'text-rose-400')}>
                  {selected===q.answer ? '정답입니다!' : '오답입니다'}
                </span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                <span className="font-bold text-white">해설: </span>{q.explanation}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-white/10 flex items-center justify-between gap-3 bg-slate-900/50">
        <button onClick={onPrev} disabled={idx===0}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl text-sm font-medium disabled:opacity-30 hover:bg-white/20 transition-all">
          <ChevronLeft size={18}/>이전
        </button>
        {isExam && <span className="text-xs text-white/40 flex-1 text-center">{answeredCount}/{total} 답변</span>}
        <button onClick={isLast ? (isExam ? onFinish : onNext) : onNext}
          disabled={!isExam && selected === null}
          className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
            isLast && isExam ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500' : 'bg-white/10 hover:bg-white/20',
            !isExam && selected === null && 'opacity-40 cursor-not-allowed')}>
          {isLast ? (isExam ? '제출하기' : '결과보기') : '다음'}<ChevronRight size={18}/>
        </button>
      </div>
    </motion.div>
  );
}

// ─── Figure Display Components ────────────────────────────────────────────────

function Matrix3x3({ cells }: { cells: Fig[] }) {
  return (
    <div className="bg-white rounded-2xl p-4 mx-auto w-fit shadow-xl">
      <div className="grid grid-cols-3 gap-2">
        {cells.map((fig, i) => (
          <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 p-1">
            <FigureCell fig={fig} size={64} />
          </div>
        ))}
        <div className="bg-blue-50 rounded-xl border-2 border-dashed border-blue-300 p-1 flex items-center justify-center">
          <FigureCell fig={null} size={64} isAnswer />
        </div>
      </div>
    </div>
  );
}

function SeriesDisplay({ cells }: { cells: Fig[] }) {
  return (
    <div className="bg-white rounded-2xl p-4 mx-auto w-fit shadow-xl">
      <div className="flex items-center gap-2">
        {cells.map((fig, i) => (
          <React.Fragment key={i}>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-1">
              <FigureCell fig={fig} size={64} />
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </React.Fragment>
        ))}
        <div className="bg-blue-50 rounded-xl border-2 border-dashed border-blue-300 p-1 flex items-center justify-center">
          <FigureCell fig={null} size={64} isAnswer />
        </div>
      </div>
    </div>
  );
}

function OddOneOutDisplay({ cells, selected, isExam, onSelect, answer, showAnswer }: {
  cells: Fig[]; selected: number | null; isExam: boolean;
  onSelect: (i: number) => void; answer: number; showAnswer: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {cells.map((fig, i) => {
        let ring = 'ring-transparent';
        let bg = 'bg-white';
        if (selected === i) {
          if (isExam) { ring = 'ring-blue-400'; }
          else if (i === answer) { ring = 'ring-emerald-400'; bg = 'bg-emerald-50'; }
          else { ring = 'ring-rose-400'; bg = 'bg-rose-50'; }
        } else if (!isExam && showAnswer && i === answer) {
          ring = 'ring-emerald-400'; bg = 'bg-emerald-50';
        }
        return (
          <button key={i} onClick={() => onSelect(i)}
            className={cn('rounded-2xl p-3 border-2 transition-all ring-2 shadow-lg', bg, ring,
              'hover:-translate-y-0.5 cursor-pointer')}>
            <div className="flex flex-col items-center gap-2">
              <FigureCell fig={fig} size={70} />
              <span className="text-xs font-bold text-slate-500">{['①','②','③','④','⑤','⑥'][i]}</span>
              {!isExam && showAnswer && (
                i === answer ? <CheckCircle size={14} className="text-emerald-500"/> :
                i === selected ? <XCircle size={14} className="text-rose-500"/> : null
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Results View ─────────────────────────────────────────────────────────────

function ResultsView({ questions, answers, score, isExam, timeTaken, onHome, onReview, onRetry }: {
  questions: FRTQuestion[]; answers: (number|null)[]; score: number; isExam: boolean;
  timeTaken?: number; onHome:()=>void; onReview:()=>void; onRetry:()=>void;
}) {
  const pct = Math.round(score/questions.length*100);
  const iq = isExam ? estimateIQ(score, questions.length) : null;
  const fmtTime = (s?: number) => s ? `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}` : '--:--';

  const byType = Object.keys(TYPE_LABEL).map(t => {
    const qs = questions.filter(q => q.type === t);
    const correct = qs.filter(q => { const i = questions.indexOf(q); return answers[i] === q.answer; }).length;
    return { type: t, label: TYPE_LABEL[t], correct, total: qs.length };
  }).filter(x => x.total > 0);

  return (
    <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className="min-h-screen p-6 flex flex-col items-center">
      <div className="max-w-lg w-full pt-8">
        <div className="text-center mb-8">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center shadow-2xl shadow-blue-500/40 mx-auto mb-4">
            <span className="text-4xl font-black">{score}</span>
            <span className="text-blue-200 text-sm">/ {questions.length}</span>
          </div>
          <p className="text-3xl font-black mb-1">{pct}점</p>
          {iq && <p className={cn('text-lg font-bold', iq.color)}>추정 IQ: {iq.iq}+ · {iq.label}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon:<CheckCircle size={20} className="text-emerald-400 mx-auto mb-1"/>, val:score, label:'정답', color:'text-emerald-400' },
            { icon:<XCircle size={20} className="text-rose-400 mx-auto mb-1"/>, val:questions.length-score, label:'오답', color:'text-rose-400' },
            { icon:<Clock size={20} className="text-blue-400 mx-auto mb-1"/>, val:fmtTime(timeTaken), label:'소요시간', color:'text-blue-400' },
          ].map((x,i) => (
            <div key={i} className="bg-white/10 rounded-2xl p-4 text-center">
              {x.icon}<p className={cn('text-xl font-bold', x.color)}>{x.val}</p><p className="text-xs text-white/50">{x.label}</p>
            </div>
          ))}
        </div>

        {byType.length > 0 && (
          <div className="bg-white/10 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-bold text-white/50 mb-4">유형별 결과</h3>
            {byType.map(t => (
              <div key={t.type} className="mb-3">
                <div className="flex justify-between mb-1"><span className="text-sm">{t.label}</span><span className="text-sm text-white/60">{t.correct}/{t.total}</span></div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{width:`${t.total>0?(t.correct/t.total*100):0}%`}}/>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <button onClick={onReview} className="w-full flex items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-all"><BookOpen size={18}/>오답 해설 보기</button>
          <button onClick={onRetry} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl font-bold"><RotateCcw size={18}/>다시 풀기</button>
          <button onClick={onHome} className="w-full flex items-center justify-center gap-2 py-4 text-white/50 hover:text-white transition-colors"><Home size={18}/>홈으로</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Review View ──────────────────────────────────────────────────────────────

function ReviewView({ questions, answers, idx, onNext, onPrev, onBack, onHome }: {
  questions: FRTQuestion[]; answers: (number|null)[]; idx: number;
  onNext:()=>void; onPrev:()=>void; onBack:()=>void; onHome:()=>void;
}) {
  const q = questions[idx];
  const userAns = answers[idx];
  const isCorrect = userAns === q.answer;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="min-h-screen flex flex-col">
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
        <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white text-sm"><ChevronLeft size={18}/>결과로</button>
        <span className="text-sm">{idx+1}/{questions.length}</span>
        <button onClick={onHome} className="p-2 text-white/50 hover:text-white"><Home size={18}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className={cn('flex items-center gap-2 p-3 rounded-2xl mb-4', isCorrect?'bg-emerald-500/15 border border-emerald-500/30':'bg-rose-500/15 border border-rose-500/30')}>
            {isCorrect ? <CheckCircle size={18} className="text-emerald-400"/> : <XCircle size={18} className="text-rose-400"/>}
            <span className={cn('font-bold text-sm', isCorrect?'text-emerald-400':'text-rose-400')}>{isCorrect?'정답':'오답'}</span>
            <span className="text-xs text-white/40 ml-1">{TYPE_LABEL[q.type]}</span>
          </div>

          <p className="text-white/60 text-xs mb-4">
            {q.type === 'matrix3x3' && '다음 3×3 도형 행렬에서 물음표(?) 자리에 들어갈 알맞은 도형'}
            {q.type === 'series' && '다음 도형 수열의 다음'}
            {q.type === 'oddOneOut' && '나머지와 패턴이 다른 하나'}
          </p>

          {q.type === 'matrix3x3' && <Matrix3x3 cells={q.cells}/>}
          {q.type === 'series' && <SeriesDisplay cells={q.cells}/>}
          {q.type === 'oddOneOut' && (
            <OddOneOutDisplay cells={q.cells} selected={userAns} isExam={false}
              onSelect={()=>{}} answer={q.answer} showAnswer={true}/>
          )}

          {(q.type === 'matrix3x3' || q.type === 'series') && (
            <div className="mt-4">
              <p className="text-xs text-white/40 mb-3 uppercase tracking-widest">선택지 (6지선다)</p>
              <div className="flex flex-wrap justify-center gap-2">
                {q.options.map((opt, i) => {
                  let ring = 'ring-transparent', bg = 'bg-white';
                  if (i === q.answer) { ring = 'ring-emerald-400'; bg = 'bg-emerald-50'; }
                  else if (i === userAns) { ring = 'ring-rose-400'; bg = 'bg-rose-50'; }
                  return (
                    <div key={i} className={cn('rounded-2xl p-2 border-2 ring-2 flex flex-col items-center gap-1.5 w-[15%] min-w-[52px]', bg, ring)}>
                      <FigureCell fig={opt} size={48}/>
                      <span className="text-xs font-bold text-slate-400">{['①','②','③','④','⑤','⑥'][i]}</span>
                      {i === q.answer && <CheckCircle size={12} className="text-emerald-500"/>}
                      {i === userAns && i !== q.answer && <XCircle size={12} className="text-rose-500"/>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-5 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
            <p className="text-sm font-bold text-blue-400 mb-2">해설</p>
            <p className="text-sm text-white/80 leading-relaxed">{q.explanation}</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/10 flex gap-3">
        <button onClick={onPrev} disabled={idx===0} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 rounded-xl font-medium disabled:opacity-30 hover:bg-white/20 transition-all text-sm"><ChevronLeft size={16}/>이전</button>
        <button onClick={onNext} disabled={idx===questions.length-1} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 rounded-xl font-medium disabled:opacity-30 hover:bg-white/20 transition-all text-sm">다음<ChevronRight size={16}/></button>
      </div>
    </motion.div>
  );
}

// ─── Stats View ───────────────────────────────────────────────────────────────

function StatsView({ stats, onBack, onReset }: { stats: Stats; onBack:()=>void; onReset:()=>void }) {
  const overall = stats.totalAnswered>0 ? Math.round(stats.totalCorrect/stats.totalAnswered*100) : 0;
  return (
    <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} className="min-h-screen p-6">
      <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"><ChevronLeft size={20}/><span className="text-sm">홈으로</span></button>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-black mb-6">학습 통계</h1>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl p-5">
            <Target size={20} className="text-blue-400 mb-2"/>
            <p className="text-3xl font-black text-blue-300">{overall}%</p>
            <p className="text-xs text-white/50 mt-1">전체 정답률</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl p-5">
            <Star size={20} className="text-emerald-400 mb-2"/>
            <p className="text-3xl font-black text-emerald-300">{stats.totalAnswered}</p>
            <p className="text-xs text-white/50 mt-1">총 풀이 수</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-bold text-white/50 mb-4">유형별 정답률</h3>
          {Object.entries(stats.byType).map(([type, s]) => {
            const acc = s.total>0 ? Math.round(s.correct/s.total*100) : null;
            return (
              <div key={type} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{TYPE_LABEL[type]||type}</span>
                  <span className="text-sm text-white/50">{acc!==null?`${acc}% (${s.correct}/${s.total})`:'미풀이'}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', acc!==null&&acc>=80?'bg-emerald-500':acc!==null&&acc>=60?'bg-amber-500':'bg-rose-500')}
                    style={{width:acc!==null?`${acc}%`:'0%'}}/>
                </div>
              </div>
            );
          })}
        </div>
        {stats.sessions.length>0 && (
          <div className="bg-white/10 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-bold text-white/50 mb-4">최근 시험 기록</h3>
            {stats.sessions.slice(0,5).map((s,i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium">{s.mode==='exam'?'모의시험':'연습'}</p>
                  <p className="text-xs text-white/40">{new Date(s.date).toLocaleDateString('ko-KR')}</p>
                </div>
                <p className="text-sm font-bold">{s.score}/{s.total} <span className="text-white/40 font-normal">({Math.round(s.score/s.total*100)}%)</span></p>
              </div>
            ))}
          </div>
        )}
        <button onClick={onReset} className="w-full py-3 text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors">통계 초기화</button>
      </div>
    </motion.div>
  );
}
