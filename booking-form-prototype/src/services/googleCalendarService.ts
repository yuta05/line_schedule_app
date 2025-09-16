import type { CalendarDay, TimeSlot } from '../types/form';

interface CalendarAPIResponse {
  timeSlots?: Array<{
    time: string;
    available: boolean;
    reason?: string;
  }>;
  isHoliday?: boolean;
  isBusinessDay?: boolean;
}

interface TimeSlotAPI {
  time: string;
  available: boolean;
  reason?: string;
}

export class GoogleCalendarService {
  private static readonly CALENDAR_API_URL = import.meta.env.DEV 
    ? '/api/gas' // Use proxy in development
    : 'https://script.google.com/macros/s/AKfycbwuRvsTr8NVHbJ16xXay7CbMvs2-X4wYjdOmGGhS0CavLd3xJpAnnqnzHtf3yJeqjru/exec';

  /**
   * Google Calendar APIから空き時間を取得
   */
  static async getAvailableSlots(date: string): Promise<CalendarDay> {
    try {
      const response = await fetch(`${this.CALENDAR_API_URL}?date=${date}&action=getAvailability`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if the response has an error
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Google Calendar APIのレスポンスを内部形式に変換
      return this.transformCalendarResponse(data, date);
    } catch (error) {
      console.error('Google Calendar API error:', error);
      // During development, show a helpful message
      if (import.meta.env.DEV) {
        console.warn('Using demo data due to API error. This is normal during development.');
      }
      // フォールバック: デモ用の空き時間を返す
      return this.generateDemoSlots(date);
    }
  }

  /**
   * 複数日の空き時間を一括取得
   */
  static async getAvailableSlotsBatch(dates: string[]): Promise<CalendarDay[]> {
    try {
      const promises = dates.map(date => this.getAvailableSlots(date));
      return await Promise.all(promises);
    } catch (error) {
      console.error('Batch calendar fetch error:', error);
      return dates.map(date => this.generateDemoSlots(date));
    }
  }

  /**
   * 予約をGoogle Calendarに送信
   */
  static async createReservation(reservationData: {
    date: string;
    time: string;
    duration: number;
    customerName: string;
    customerPhone: string;
    menuNames: string[];
    storeId: string;
    formId: string;
  }): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      const response = await fetch(this.CALENDAR_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createReservation',
          ...reservationData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: result.success || false,
        eventId: result.eventId,
        error: result.error
      };
    } catch (error) {
      console.error('Create reservation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 営業時間を考慮した空き時間生成（デモ用）
   */
  private static generateDemoSlots(date: string): CalendarDay {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // 営業時間設定（店舗による）
    const businessHours = {
      start: isWeekend ? 10 : 9,  // 平日9時、土日10時
      end: isWeekend ? 18 : 19,   // 平日19時、土日18時
      breakStart: 12,             // 昼休み開始
      breakEnd: 13               // 昼休み終了
    };

    const timeSlots: TimeSlot[] = [];
    
    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // 昼休み時間は除外
        const isBreakTime = hour >= businessHours.breakStart && hour < businessHours.breakEnd;
        
        // ランダムに一部の時間を予約済みとして設定（デモ用）
        const isBooked = Math.random() < 0.3;
        
        timeSlots.push({
          time,
          available: !isBreakTime && !isBooked,
          reason: isBreakTime ? '昼休み' : isBooked ? '予約済み' : undefined
        });
      }
    }

    return {
      date,
      day_of_week: dayOfWeek,
      is_holiday: this.isHoliday(dateObj),
      is_business_day: dayOfWeek !== 0, // 日曜定休
      time_slots: timeSlots
    };
  }

  /**
   * Google Calendar APIレスポンスの変換
   */
  private static transformCalendarResponse(apiResponse: CalendarAPIResponse, date: string): CalendarDay {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // APIレスポンスが空の場合はデモデータを返す
    if (!apiResponse || !apiResponse.timeSlots) {
      return this.generateDemoSlots(date);
    }

    const timeSlots: TimeSlot[] = apiResponse.timeSlots.map((slot: TimeSlotAPI) => ({
      time: slot.time,
      available: slot.available !== false,
      reason: slot.reason
    }));

    return {
      date,
      day_of_week: dayOfWeek,
      is_holiday: apiResponse.isHoliday || this.isHoliday(dateObj),
      is_business_day: apiResponse.isBusinessDay !== false && dayOfWeek !== 0,
      time_slots: timeSlots
    };
  }

  /**
   * 祝日判定（簡易版）
   */
  private static isHoliday(date: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 基本的な祝日のみ（実際にはより複雑な判定が必要）
    const holidays = [
      { month: 1, day: 1 },   // 元日
      { month: 1, day: 2 },   // 正月
      { month: 1, day: 3 },   // 正月
      { month: 5, day: 3 },   // 憲法記念日
      { month: 5, day: 4 },   // みどりの日
      { month: 5, day: 5 },   // こどもの日
      { month: 12, day: 31 }, // 大晦日
    ];

    return holidays.some(holiday => holiday.month === month && holiday.day === day);
  }

  /**
   * 日付範囲を生成（今日から指定日数後まで）
   */
  static generateDateRange(days: number = 30): string[] {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }

  /**
   * 営業時間チェック
   */
  static isBusinessTime(date: string, time: string): boolean {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    // 日曜定休
    if (dayOfWeek === 0) return false;
    
    const [hour, minute] = time.split(':').map(Number);
    const timeInMinutes = hour * 60 + minute;
    
    const isWeekend = dayOfWeek === 6;
    const startTime = isWeekend ? 10 * 60 : 9 * 60;   // 平日9:00、土曜10:00
    const endTime = isWeekend ? 18 * 60 : 19 * 60;     // 平日19:00、土曜18:00
    const breakStart = 12 * 60;                        // 12:00
    const breakEnd = 13 * 60;                          // 13:00
    
    // 営業時間内かつ昼休み時間外
    return timeInMinutes >= startTime && 
           timeInMinutes < endTime && 
           !(timeInMinutes >= breakStart && timeInMinutes < breakEnd);
  }
}
