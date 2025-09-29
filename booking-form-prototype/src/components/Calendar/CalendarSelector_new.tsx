import React, { useState, useEffect } from 'react';
import type { CalendarDay, TimeSlot } from '../../types/form';
import { GoogleCalendarService } from '../../services/googleCalendarService';

interface CalendarSelectorProps {
  onDateTimeSelect: (dateTime: string) => void;
  selectedDate?: string;
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  onDateTimeSelect,
  selectedDate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);

  // 時間スロットリスト（9:00-18:00, 30分間隔）
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  // 週の日付リストを生成（7日間）
  const generateWeekDates = (startDate: Date): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      dates.push(currentDate);
    }
    return dates;
  };

  // データを取得する関数
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setLoading(true);
      
      try {
        const weekDates = generateWeekDates(currentDate);
        const dateStrings = weekDates.map(date => date.toISOString().split('T')[0]);
        const slots = await GoogleCalendarService.getAvailableSlotsBatch(dateStrings);
        setAvailableSlots(slots);
      } catch (err) {
        console.error('Calendar fetch error:', err);
        // エラー時はダミーデータを使用
        const weekDates = generateWeekDates(currentDate);
        const dummySlots: CalendarDay[] = weekDates.map(date => {
          const dateString = date.toISOString().split('T')[0];
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          return {
            date: dateString,
            day_of_week: date.getDay(),
            is_business_day: !isWeekend, // 平日のみ営業
            is_holiday: false,
            time_slots: timeSlots.map(time => ({
              time,
              available: !isWeekend && Math.random() > 0.3 // 平日のみランダムに空きを設定
            }))
          };
        });
        setAvailableSlots(dummySlots);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [currentDate]);

  // 日時選択ハンドラ
  const handleDateTimeSelect = (date: Date, time: string) => {
    const calendarDay = availableSlots.find(slot => slot.date === date.toISOString().split('T')[0]);
    if (!calendarDay?.is_business_day) return;
    
    const timeSlot = calendarDay.time_slots.find(slot => slot.time === time);
    if (!timeSlot?.available) return;

    const dateTime = `${date.toISOString().split('T')[0]}T${time}:00`;
    setSelectedDateTime(dateTime);
    onDateTimeSelect(dateTime);
  };

  // ナビゲーション関数
  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // セルの状態を判定
  const getCellStatus = (date: Date, time: string) => {
    const now = new Date();
    const slotDateTime = new Date(`${date.toISOString().split('T')[0]}T${time}:00`);
    
    // 過去の時間は無効
    if (slotDateTime < now) return 'unavailable';
    
    const calendarDay = availableSlots.find(slot => slot.date === date.toISOString().split('T')[0]);
    if (!calendarDay?.is_business_day) return 'unavailable';
    
    const timeSlot = calendarDay.time_slots.find(slot => slot.time === time);
    return timeSlot?.available ? 'available' : 'unavailable';
  };

  // 週の日付を取得
  const weekDates = generateWeekDates(currentDate);

  return (
    <>
      <style>{`
        .calendar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          position: relative;
          width: 100%;
        }

        .calendar {
          flex: 1;
          background-color: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          width: 100%;
        }

        .calendar table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .calendar th,
        .calendar td {
          font-size: 12.5px;
          text-align: center;
          padding: 5px;
          cursor: pointer;
          vertical-align: top;
          width: auto;
          box-sizing: border-box;
          border: 2px solid #696969;
        }

        .calendar th:first-child,
        .calendar td:first-child {
          width: 17%;
          font-size: 12.5px;
        }

        .calendar th {
          background-color: #f7f7f7;
        }

        .calendar td:hover {
          background-color: #ddd;
        }

        .calendar td.selected {
          background-color: #13ca5e;
          color: #fff;
        }

        .calendar td.available {
          color: #13ca5e;
        }

        .calendar td.unavailable {
          background-color: #d3d3d3;
          cursor: not-allowed;
        }

        .week-button-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 10px;
        }

        .week-button {
          padding: 10px 20px;
          background-color: #444444;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .week-button:hover {
          background-color: #333;
        }

        .month-button-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 10px;
        }

        .month-button {
          padding: 10px 20px;
          background-color: #444;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .month-button:hover {
          background-color: #333;
        }

        .current-month {
          text-align: center;
          display: block;
          position: absolute;
          left: 50%;
          transform: translate(-50%, -10px);
          background-color: #13ca5e;
          color: #fff;
          padding: 3px 12px;
          border-radius: 8px;
          font-size: 1.4rem;
          font-weight: bold;
          box-shadow: 0 2px 6px rgba(47, 103, 167, 0.2);
        }

        .current-month-container {
          position: relative;
          height: 40px;
          margin-bottom: 10px;
        }

        .loading-spinner {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        @media (max-width: 768px) {
          .calendar th,
          .calendar td {
            font-size: 11px;
            padding: 3px;
          }
          
          .week-button,
          .month-button {
            padding: 8px 15px;
            font-size: 14px;
          }
        }
      `}</style>

      <div className="calendar-container">
        {/* 月表示 */}
        <div className="current-month-container">
          <span className="current-month">
            <span className="year">{currentDate.getFullYear()}年</span><br />
            <span className="month">{currentDate.getMonth() + 1}月</span>
          </span>
        </div>

        {/* 月移動ボタン */}
        <div className="month-button-container">
          <button className="month-button" onClick={handlePrevMonth}>前月</button>
          <button className="month-button" onClick={handleNextMonth}>翌月</button>
        </div>

        {/* 週移動ボタン */}
        <div className="week-button-container">
          <button className="week-button" onClick={handlePrevWeek}>前週</button>
          <button className="week-button" onClick={handleNextWeek}>翌週</button>
        </div>

        {/* カレンダーテーブル */}
        {loading ? (
          <div className="loading-spinner">読み込み中...</div>
        ) : (
          <div className="calendar">
            <table>
              <thead>
                <tr>
                  <th>時間</th>
                  {weekDates.map((date, index) => {
                    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
                    const dayString = `${date.getDate()}<br />(${dayOfWeek[date.getDay()]})`;
                    
                    return (
                      <th 
                        key={index}
                        dangerouslySetInnerHTML={{ __html: dayString }}
                        style={{
                          color: date.getDay() === 0 ? 'red' : 
                                 date.getDay() === 6 ? 'blue' : 'inherit'
                        }}
                      />
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time}>
                    <td>{time}</td>
                    {weekDates.map((date, dateIndex) => {
                      const status = getCellStatus(date, time);
                      const isSelected = selectedDateTime === `${date.toISOString().split('T')[0]}T${time}:00`;
                      const cellClass = `${status} ${isSelected ? 'selected' : ''}`;
                      const content = status === 'available' ? '○' : '×';
                      
                      return (
                        <td
                          key={`${dateIndex}-${time}`}
                          className={cellClass}
                          onClick={() => status === 'available' ? handleDateTimeSelect(date, time) : undefined}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default CalendarSelector;
