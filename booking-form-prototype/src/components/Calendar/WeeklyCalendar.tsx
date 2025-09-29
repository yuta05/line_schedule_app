import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  AccessTime,
  EventBusy,
  CheckCircle
} from '@mui/icons-material';
import type { BusinessHours, TimeSlot, CalendarDay } from '../../types/form';

interface DaySettings {
  open: string;
  close: string;
  closed: boolean;
}

interface WeeklyCalendarProps {
  businessHours: BusinessHours;
  selectedDateTime: Date | null;
  onDateTimeSelect: (dateTime: Date) => void;
  totalDuration: number; // 予約所要時間（分）
  advanceBookingDays?: number;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  businessHours,
  selectedDateTime,
  onDateTimeSelect,
  totalDuration,
  advanceBookingDays = 30
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [weekData, setWeekData] = useState<CalendarDay[]>([]);

  const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];

  // 時間スロットを生成（30分間隔）
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 9; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // 時間文字列をDateオブジェクトに変換
  const parseTime = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // 週の開始日を取得（日曜日）
  const getStartOfWeek = (date: Date): Date => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return start;
  };

  // 過去の日付かチェック
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // 過去の日時かチェック
  const isPastDateTime = (date: Date, timeSlot: string): boolean => {
    const now = new Date();
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime <= now;
  };

  // 予約可能期間を超えているかチェック
  const isExceedAdvanceBooking = (date: Date): boolean => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + advanceBookingDays);
    return date > maxDate;
  };

  // 祝日かチェック（簡易実装）
  const isHoliday = (): boolean => {
    // 実際の実装では祝日APIを使用
    return false;
  };

  // 日付の時間スロットを生成
  const generateTimeSlotsForDay = useCallback((date: Date, daySettings: DaySettings | undefined): TimeSlot[] => {
    if (!daySettings || daySettings.closed || isPastDate(date) || isExceedAdvanceBooking(date)) {
      return timeSlots.map((time: string) => ({ time, available: false, reason: '営業時間外' }));
    }

    const openTime = parseTime(daySettings.open);
    const closeTime = parseTime(daySettings.close);

    return timeSlots.map((timeSlot: string) => {
      const slotTime = parseTime(timeSlot);
      const endTime = new Date(slotTime.getTime() + totalDuration * 60000);

      const isAvailable = slotTime >= openTime && endTime <= closeTime && !isPastDateTime(date, timeSlot);
      
      return {
        time: timeSlot,
        available: isAvailable,
        reason: !isAvailable ? (slotTime < openTime || endTime > closeTime ? '営業時間外' : '過去の時間') : undefined
      };
    });
  }, [timeSlots, totalDuration]);

  // 週データを生成
  const generateWeekData = useCallback(() => {
    setLoading(true);
    const startOfWeek = getStartOfWeek(currentWeek);
    const weekDays: CalendarDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
      const daySettings = businessHours[dayOfWeek] as DaySettings | undefined;
      
      const calendarDay: CalendarDay = {
        date: date.toISOString().split('T')[0],
        day_of_week: date.getDay(),
        is_holiday: isHoliday(),
        is_business_day: !daySettings?.closed && !isPastDate(date),
        time_slots: generateTimeSlotsForDay(date, daySettings)
      };
      
      weekDays.push(calendarDay);
    }

    setWeekData(weekDays);
    setLoading(false);
  }, [currentWeek, businessHours, generateTimeSlotsForDay]);

  useEffect(() => {
    generateWeekData();
  }, [generateWeekData]);

  // 前週に移動
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  // 翌週に移動
  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  // 前月に移動
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentWeek);
    prevMonth.setMonth(currentWeek.getMonth() - 1);
    setCurrentWeek(prevMonth);
  };

  // 翌月に移動
  const goToNextMonth = () => {
    const nextMonth = new Date(currentWeek);
    nextMonth.setMonth(currentWeek.getMonth() + 1);
    setCurrentWeek(nextMonth);
  };

  // 日時選択ハンドラ
  const handleTimeSlotClick = (day: CalendarDay, timeSlot: TimeSlot) => {
    if (!timeSlot.available) return;

    const [hours, minutes] = timeSlot.time.split(':').map(Number);
    const selectedDate = new Date(day.date);
    selectedDate.setHours(hours, minutes, 0, 0);
    
    onDateTimeSelect(selectedDate);
  };

  // 選択された時間かチェック
  const isSelectedTime = (day: CalendarDay, timeSlot: TimeSlot): boolean => {
    if (!selectedDateTime) return false;
    
    const slotDate = new Date(day.date);
    const [hours, minutes] = timeSlot.time.split(':').map(Number);
    slotDate.setHours(hours, minutes, 0, 0);
    
    return slotDate.getTime() === selectedDateTime.getTime();
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      {/* 月表示 */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {currentWeek.getFullYear()}年{(currentWeek.getMonth() + 1)}月
        </Typography>
      </Box>

      {/* 月移動ボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={goToPreviousMonth}
          startIcon={<ChevronLeft />}
        >
          前月
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={goToNextMonth}
          endIcon={<ChevronRight />}
        >
          翌月
        </Button>
      </Box>

      {/* 週移動ボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
        <Button
          variant="contained"
          size="small"
          onClick={goToPreviousWeek}
          startIcon={<ChevronLeft />}
        >
          前週
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={goToNextWeek}
          endIcon={<ChevronRight />}
        >
          翌週
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={2} sx={{ overflow: 'auto' }}>
          <Box sx={{ minWidth: 600 }}>
            {/* ヘッダー（曜日表示） */}
            <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ width: 80, p: 1, fontWeight: 'bold', textAlign: 'center', borderRight: 1, borderColor: 'divider' }}>
                時間
              </Box>
              {weekData.map((day, index) => (
                <Box 
                  key={day.date} 
                  sx={{ 
                    flex: 1, 
                    p: 1, 
                    textAlign: 'center', 
                    borderRight: index < 6 ? 1 : 0, 
                    borderColor: 'divider',
                    bgcolor: day.day_of_week === 0 ? 'error.light' : day.day_of_week === 6 ? 'info.light' : 'background.default'
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {dayLabels[day.day_of_week]}
                  </Typography>
                  <Typography variant="caption">
                    {new Date(day.date).getDate()}
                  </Typography>
                  {!day.is_business_day && (
                    <Chip 
                      label="休" 
                      size="small" 
                      color="default" 
                      sx={{ mt: 0.5, fontSize: '0.7rem' }} 
                    />
                  )}
                </Box>
              ))}
            </Box>

            {/* 時間スロット */}
            {timeSlots.map((timeSlot) => (
              <Box key={timeSlot} sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ width: 80, p: 1, textAlign: 'center', borderRight: 1, borderColor: 'divider', fontSize: '0.8rem' }}>
                  {timeSlot}
                </Box>
                {weekData.map((day, index) => {
                  const dayTimeSlot = day.time_slots.find(ts => ts.time === timeSlot);
                  const isSelected = isSelectedTime(day, dayTimeSlot!);
                  
                  return (
                    <Box 
                      key={`${day.date}-${timeSlot}`}
                      sx={{ 
                        flex: 1, 
                        p: 0.5, 
                        textAlign: 'center', 
                        borderRight: index < 6 ? 1 : 0, 
                        borderColor: 'divider',
                        cursor: dayTimeSlot?.available ? 'pointer' : 'not-allowed',
                        bgcolor: isSelected ? 'primary.main' : dayTimeSlot?.available ? 'success.light' : 'grey.200',
                        '&:hover': dayTimeSlot?.available ? { bgcolor: isSelected ? 'primary.dark' : 'success.main' } : {},
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => dayTimeSlot && handleTimeSlotClick(day, dayTimeSlot)}
                    >
                      {dayTimeSlot?.available ? (
                        isSelected ? (
                          <CheckCircle sx={{ fontSize: 16, color: 'white' }} />
                        ) : (
                          <Typography variant="caption" sx={{ color: 'white' }}>○</Typography>
                        )
                      ) : (
                        <EventBusy sx={{ fontSize: 12, color: 'text.disabled' }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* 凡例 */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: 'success.light', borderRadius: 0.5 }} />
          <Typography variant="caption">予約可能</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: 'primary.main', borderRadius: 0.5 }} />
          <Typography variant="caption">選択中</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: 'grey.200', borderRadius: 0.5 }} />
          <Typography variant="caption">予約不可</Typography>
        </Box>
      </Box>

      {selectedDateTime && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <AccessTime sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
            選択中: {selectedDateTime.toLocaleDateString('ja-JP')} {selectedDateTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
            （所要時間: {Math.floor(totalDuration / 60)}時間{totalDuration % 60}分）
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default WeeklyCalendar;
