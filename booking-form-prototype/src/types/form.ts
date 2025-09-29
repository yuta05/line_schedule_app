// 予約フォームの型定義
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  duration: number;          // 分単位
  description?: string;
  treatment_info?: string;   // 治療情報
  image_url?: string;
  image_name?: string;       // 画像ファイル名
  category_id?: string;      // カテゴリID
  gender_filter?: 'male' | 'female' | 'both';  // 性別フィルタ（新規追加）
  options?: MenuOption[];    // メニューオプション（新規追加）
}

// メニューオプション（新規追加）
export interface MenuOption {
  id: string;
  name: string;
  price: number;
  duration: number;          // 分単位
  description?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  display_name: string;     // 表示名
  items: MenuItem[];
  menus: MenuItem[];        // メインメニュー一覧
  options?: MenuItem[];     // オプションメニュー一覧
  gender_filter?: 'male' | 'female' | 'both';  // カテゴリレベルの性別フィルタ
  gender_condition?: 'male' | 'female' | 'all';  // 性別条件
  selection_mode: 'single' | 'multiple';
}

export interface VisitOption {
  id: string;
  label: string;             // "1回目〈30分〉"
  duration: number;
  price: number;
  is_default?: boolean;
}

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

export interface FormConfig {
  basic_info: {
    form_name: string;
    store_name: string;
    liff_id: string;
    theme_color: string;
    logo_url?: string;
  };
  
  visit_options: VisitOption[];
  
  gender_selection: {
    enabled: boolean;           // 性別選択を有効にするか
    required: boolean;          // 性別選択を必須にするか
    options: Array<{
      value: 'male' | 'female';
      label: string;           // "男性", "女性"
    }>;
  };
  
  menu_structure: {
    structure_type: 'category_based';
    categories: MenuCategory[];
    display_options: {
      show_price: boolean;
      show_duration: boolean;
      show_description: boolean;
      show_treatment_info: boolean;  // 治療説明表示
    };
  };
  
  calendar_settings: {
    business_hours: BusinessHours;
    advance_booking_days: number;
    google_calendar_url?: string;
  };
  
  ui_settings: {
    theme_color: string;
    button_style: 'rounded' | 'square';
    show_repeat_booking: boolean;    // 前回と同じメニュー
    show_side_nav: boolean;
    custom_css?: string;
  };
  
  validation_rules: {
    required_fields: string[];
    phone_format: 'japanese' | 'international';
    name_max_length: number;
  };
}

export interface Form {
  id: string;          // form_abcd1234efgh5678 (英数ランダム文字列)
  store_id: string;    // store_1, store_2, ...
  config: FormConfig;
  draft_config?: FormConfig;  // 下書き設定
  status: 'active' | 'inactive' | 'paused';
  draft_status: 'none' | 'draft' | 'ready_to_publish';  // 下書きステータス
  created_at: string;
  updated_at: string;
  last_published_at?: string;  // 最終公開日時
}

// 顧客情報
export interface CustomerInfo {
  name: string;
  phone: string;
  message?: string;
}

// メニュー選択状態
export interface MenuSelections {
  visit_option: VisitOption | null;
  gender?: 'male' | 'female';       // 選択された性別
  selected_menus: MenuItem[];
  selected_options: MenuOption[];   // 選択されたオプション（新規追加）
  customer_info: CustomerInfo;
  selected_datetime: Date | null;
}

// 料金計算結果
export interface PriceCalculation {
  menu_price: number;
  options_price: number;
  visit_fee: number;
  total_price: number;
  duration_minutes: number;
}

// カレンダー関連
export interface TimeSlot {
  time: string;              // "09:00"
  available: boolean;
  reason?: string;           // 不可理由
}

export interface CalendarDay {
  date: string;              // ISO形式
  day_of_week: number;       // 0-6
  is_holiday: boolean;
  is_business_day: boolean;
  time_slots: TimeSlot[];
}

// Google Calendar APIレスポンス
export interface GoogleCalendarEvent {
  summary: string;
  startTime: string;
  endTime: string;
  title?: string;
}
