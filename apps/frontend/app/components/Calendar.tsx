'use client';
import { useMemo } from 'react';

export type DayAvailability = { dateISO: string; availableTimes: string[] };

export default function Calendar({
  days,
  onSelect,
}: {
  days: DayAvailability[];
  onSelect: (dateLabel: string) => void;
}) {
  const weekDates = useMemo(() => days.map(d => new Date(d.dateISO)), [days]);
  const header = ['時間', ...weekDates.map(d => `${d.getMonth() + 1}/${d.getDate()}`)];
  const times = useMemo(
    () => ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'],
    []
  );

  return (
    <div style={{ overflowX: 'auto', border: '1px solid #ccc' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {header.map((h, i) => (
              <th key={i} style={{ border: '1px solid #ddd', padding: 6, background: '#f7f7f7' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((t) => (
            <tr key={t}>
              <td style={{ border: '1px solid #eee', padding: 6 }}>{t}</td>
              {days.map((d) => {
                const ok = d.availableTimes.includes(t);
                const date = new Date(d.dateISO);
                const label = `${date.getFullYear()}年${String(date.getMonth()+1).padStart(2,'0')}月${String(date.getDate()).padStart(2,'0')}日 ${t}`;
                return (
                  <td
                    key={d.dateISO + t}
                    onClick={() => ok && onSelect(label)}
                    style={{
                      border: '1px solid #eee',
                      padding: 6,
                      cursor: ok ? 'pointer' : 'not-allowed',
                      color: ok ? '#d00' : '#999',
                      textAlign: 'center',
                    }}
                  >
                    {ok ? '◯' : '×'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


