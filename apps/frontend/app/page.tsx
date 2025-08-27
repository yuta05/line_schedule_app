'use client';

import { useEffect, useMemo, useState } from 'react';
import liff from '@line/liff';
import FormSkeleton from './components/FormSkeleton';
import Calendar, { DayAvailability as DayAvail } from './components/Calendar';
import MenuSelector from './components/MenuSelector';
import { calculateTotalMinutes, parseLastAcceptableEnd, getUIConfig } from '../lib/config';

type RawEvent = {
  title?: string;
  summary?: string;
  startTime: string;
  endTime: string;
};

type DayAvailability = {
  dateISO: string;
  availableTimes: string[];
};

export default function Page() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<DayAvail[]>([]);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [menuSelection, setMenuSelection] = useState({
    visitCount: '' as '1回目〈30分〉' | '2回目以降〈0分〉' | '',
    course: '',
    menus: [] as string[],
    options: [] as string[]
  });
  const ui = useMemo(() => getUIConfig(), []);

  // 前回選択の保存
  useEffect(() => {
    try { localStorage.setItem('lastMenuSelection', JSON.stringify(menuSelection)); } catch {}
  }, [menuSelection]);

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  const availabilityUrl = process.env.NEXT_PUBLIC_GAS_AVAILABILITY_URL || '/api/availability';

  useEffect(() => {
    (async () => {
      try {
        if (!liffId) throw new Error('LIFF ID is not set');
        await liff.init({ liffId });
        setReady(true);
      } catch (e: any) {
        setError(e?.message ?? 'LIFF init failed');
      }
    })();
  }, [liffId]);

  const period = useMemo(() => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    return { start: start.toISOString(), end: end.toISOString() };
  }, []);

  useEffect(() => {
    (async () => {
      if (!availabilityUrl) return;
      try {
        const url = `${availabilityUrl}?startTime=${encodeURIComponent(period.start)}&endTime=${encodeURIComponent(period.end)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('availability fetch failed');
        const raw: unknown = await res.json();
        if (!Array.isArray(raw)) throw new Error('unexpected availability format');
        const events = (raw as RawEvent[]).map(x => ({
          title: x.title ?? x.summary ?? '',
          startTime: x.startTime,
          endTime: x.endTime,
        }));

        // Compute day-by-day available 30-min slots between 09:00-18:00
        const startDate = new Date(period.start);
        const views: DayAvailability[] = [];
        for (let i = 0; i < 7; i++) {
          const day = new Date(startDate);
          day.setDate(day.getDate() + i);
          const dateISO = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate())).toISOString();

          // windows tagged as "営業日"
          const businessWindows = events
            .filter(ev => (ev.title || '').includes('営業日'))
            .filter(ev => sameDate(new Date(ev.startTime), day))
            .map(ev => ({ start: new Date(ev.startTime), end: new Date(ev.endTime) }));

          const nonBusiness = events
            .filter(ev => !(ev.title || '').includes('営業日'))
            .filter(ev => sameDate(new Date(ev.startTime), day))
            .map(ev => ({ start: new Date(ev.startTime), end: new Date(ev.endTime) }));

          const times = generateTimes(['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']);

          const availableTimes: string[] = [];
          const totalMinutes = calculateTotalMinutes(menuSelection.visitCount, menuSelection.menus, menuSelection.options);
          const lastAcceptable = parseLastAcceptableEnd();

          for (const t of times) {
            const slotStart = new Date(day);
            slotStart.setHours(t.h, t.m, 0, 0);
            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + totalMinutes);

            const inBusiness = businessWindows.length > 0
              ? businessWindows.some(w => slotStart >= w.start && slotEnd <= w.end)
              : (day.getDay() !== 0); // if no business window, allow except Sundays

            const overlapsOther = nonBusiness.some(w => slotStart < w.end && w.start < slotEnd);
            const endsBeforeLimit = slotEnd.getHours() < lastAcceptable.hours || 
              (slotEnd.getHours() === lastAcceptable.hours && slotEnd.getMinutes() <= lastAcceptable.minutes);
            const isFuture = slotStart > new Date();

            if (inBusiness && !overlapsOther && endsBeforeLimit && isFuture) {
              availableTimes.push(`${String(t.h).padStart(2,'0')}:${String(t.m).padStart(2,'0')}`);
            }
          }

          views.push({ dateISO, availableTimes });
        }

        setDays(views);
      } catch (e: any) {
        setError(e?.message ?? 'availability error');
      }
    })();
  }, [availabilityUrl, period.start, period.end, menuSelection]);

  function sameDate(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function generateTimes(list: string[]): Array<{ h: number; m: number }> {
    return list.map(s => {
      const [hh, mm] = s.split(':');
      return { h: Number(hh), m: Number(mm) };
    });
  }

  return (
    <main style={{ padding: 16 }}>
      <h1>予約フォーム（準備中）</h1>
      {!ready && !error && <p>LIFF 初期化中…</p>}
      {error && <p style={{ color: 'red' }}>エラー: {error}</p>}
      {ready && (
        <div>
          <MenuSelector 
            onSelectionChange={setMenuSelection}
            preset={(() => {
              try { return JSON.parse(localStorage.getItem('lastMenuSelection') || 'null'); } catch { return null; }
            })()}
          />
          
          {menuSelection.menus.length > 0 ? (
          <div style={{ marginTop: 24 }}>
            <h3>空き状況カレンダー</h3>
            <p>所要時間: {calculateTotalMinutes(menuSelection.visitCount, menuSelection.menus, menuSelection.options)}分</p>
            <Calendar days={days} onSelect={(label) => setSelectedLabel(label)} />
            <div style={{ marginTop: 12 }}>
              <strong>選択中の日時:</strong> {selectedLabel || '未選択'}
            </div>
          </div>
          ) : (
            <div style={{ marginTop: 24, color: '#666' }}>メニューを選ぶと空き状況が表示されます。</div>
          )}

          <FormSkeleton 
            selectedLabel={selectedLabel} 
            menuSelection={menuSelection}
          />
        </div>
      )}
    </main>
  );
}


