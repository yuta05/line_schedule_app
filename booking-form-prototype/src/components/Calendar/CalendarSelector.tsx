import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  AccessTime,
  Event
} from '@mui/icons-material';
import type { CalendarDay, TimeSlot } from '../../types/form';
import { GoogleCalendarService } from '../../services/googleCalendarService';

interface CalendarSelectorProps {
  onDateTimeSelect: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  onDateTimeSelect,
  selectedDate,
  selectedTime
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 月の日付リストを生成
  const generateMonthDates = (date: Date): string[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates: string[] = [];
    for (let day = firstDay.getDate(); day <= lastDay.getDate(); day++) {
      const currentDate = new Date(year, month, day);
      // 過去の日付は除外
      if (currentDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
        dates.push(currentDate.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  // 月が変更されたときに空き時間を取得
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const dates = generateMonthDates(currentMonth);
        const slots = await GoogleCalendarService.getAvailableSlotsBatch(dates);
        setAvailableSlots(slots);
      } catch (err) {
        setError('カレンダー情報の取得に失敗しました');
        console.error('Calendar fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [currentMonth]);

  // 日付選択ハンドラ
  const handleDateSelect = (calendarDay: CalendarDay) => {
    if (!calendarDay.is_business_day) return;
    setSelectedDay(calendarDay);
  };

  // 時間選択ハンドラ
  const handleTimeSelect = (time: string) => {
    if (selectedDay) {
      onDateTimeSelect(selectedDay.date, time);
    }
  };

  // 月移動ハンドラ
  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  // 利用可能な時間スロットの数を取得
  const getAvailableSlotCount = (calendarDay: CalendarDay): number => {
    return calendarDay.time_slots.filter(slot => slot.available).length;
  };

  // 日付の表示状態を判定
  const getDayStatus = (calendarDay: CalendarDay) => {
    if (!calendarDay.is_business_day) return 'closed';
    if (calendarDay.is_holiday) return 'holiday';
    
    const availableCount = getAvailableSlotCount(calendarDay);
    if (availableCount === 0) return 'full';
    if (availableCount <= 3) return 'limited';
    return 'available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'limited': return 'warning';
      case 'full': return 'error';
      case 'holiday': return 'info';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return '空きあり';
      case 'limited': return '残りわずか';
      case 'full': return '満席';
      case 'holiday': return '祝日';
      case 'closed': return '定休日';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* カレンダーヘッダー */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton onClick={handlePrevMonth}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6">
            {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Paper>

      {/* カレンダーグリッド */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {/* 曜日ヘッダー */}
          {['日', '月', '火', '水', '木', '金', '土'].map((dayName, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                {dayName}
              </Typography>
            </Box>
          ))}
          
          {/* カレンダー日付 */}
          {availableSlots.map((calendarDay) => {
            const dayOfMonth = new Date(calendarDay.date).getDate();
            const status = getDayStatus(calendarDay);
            const isSelected = selectedDay?.date === calendarDay.date;
            
            return (
              <Box key={calendarDay.date} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant={isSelected ? 'contained' : 'outlined'}
                  sx={{
                    minWidth: '40px',
                    height: '60px',
                    p: 1,
                    flexDirection: 'column',
                    border: isSelected ? 2 : 1,
                    borderColor: isSelected ? 'primary.main' : getStatusColor(status),
                    bgcolor: isSelected ? 'primary.main' : 'transparent',
                    '&:hover': {
                      bgcolor: calendarDay.is_business_day ? 'primary.light' : 'transparent'
                    }
                  }}
                  disabled={!calendarDay.is_business_day || status === 'full'}
                  onClick={() => handleDateSelect(calendarDay)}
                >
                  <Typography variant="body2" sx={{ 
                    color: isSelected ? 'white' : 'inherit',
                    fontWeight: isSelected ? 'bold' : 'normal'
                  }}>
                    {dayOfMonth}
                  </Typography>
                  <Chip
                    size="small"
                    label={getStatusText(status)}
                    color={getStatusColor(status) as 'success' | 'warning' | 'error' | 'info' | 'default'}
                    sx={{ 
                      fontSize: '8px', 
                      height: '16px',
                      '& .MuiChip-label': { px: 0.5 }
                    }}
                  />
                </Button>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* 時間選択 */}
      {selectedDay && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Event sx={{ mr: 1 }} />
            <Typography variant="h6">
              {new Date(selectedDay.date).toLocaleDateString('ja-JP', {
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })} の空き時間
            </Typography>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 1 }}>
            {selectedDay.time_slots
              .filter(slot => slot.available)
              .map((slot: TimeSlot) => (
                <Button
                  key={slot.time}
                  fullWidth
                  variant={selectedTime === slot.time ? 'contained' : 'outlined'}
                  startIcon={<AccessTime />}
                  onClick={() => handleTimeSelect(slot.time)}
                  sx={{
                    justifyContent: 'flex-start',
                    bgcolor: selectedTime === slot.time ? 'primary.main' : 'transparent'
                  }}
                >
                  {slot.time}
                </Button>
              ))}
          </Box>
          
          {selectedDay.time_slots.filter(slot => slot.available).length === 0 && (
            <Alert severity="info">
              この日は空き時間がありません。他の日をお選びください。
            </Alert>
          )}
        </Paper>
      )}

      {/* 選択状況表示 */}
      {selectedDate && selectedTime && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>選択日時:</strong> {new Date(selectedDate).toLocaleDateString('ja-JP')} {selectedTime}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default CalendarSelector;
