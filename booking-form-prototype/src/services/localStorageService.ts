import type { Form, FormConfig, MenuSelections } from '../types/form';
import type { Store, StoreWithForms } from '../types/store';

const STORAGE_KEYS = {
  FORMS: 'booking_forms_prototype',
  STORES: 'booking_stores_prototype',
  USER_INPUTS: 'user_inputs_cache',
  MENU_SELECTIONS: 'menu_selections_cache'
};

const getInitialStores = (): Store[] => [
  {
    id: 'store_0001',
    name: '美容室A（東京店）',
    owner_name: '田中太郎',
    owner_email: 'tanaka@example.com',
    phone: '03-1234-5678',
    address: '東京都渋谷区1-2-3',
    description: '東京にある美容室です。ブライダルエステとシェービングを専門としています。',
    website_url: 'https://beauty-a.example.com',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// FormIDを英数文字列（長め）で生成するユーティリティ
const generateSecureFormId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'form_';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getInitialData = (): Form[] => [
  {
    id: 'form_AbC123dEf456GhI7',
    store_id: 'store_0001',
    config: {
      basic_info: {
        form_name: '美容室予約フォーム',
        store_name: '美容室A（東京店）',
        liff_id: 'sample-liff-id-1',
        theme_color: '#13ca5e'
      },
      visit_options: [
        { id: 'first_visit', label: '1回目〈30分〉', duration: 30, price: 0, is_default: false },
        { id: 'repeat_visit', label: '2回目以降〈0分〉', duration: 0, price: 0, is_default: true }
      ],
      gender_selection: {
        enabled: false,
        required: false,
        options: [
          { value: 'male', label: '男性' },
          { value: 'female', label: '女性' }
        ]
      },
      menu_structure: {
        structure_type: 'category_based',
        categories: [
          {
            id: 'bridal',
            name: 'ブライダルコース',
            display_name: '◆ブライダルコース◆',
            selection_mode: 'single',
            menus: [
              { 
                id: 'japanese_plan', 
                name: '和装プラン〈30分〉', 
                price: 15000, 
                duration: 30, 
                category_id: 'bridal',
                treatment_id: 'treatment1',
                gender_filter: 'female'
              },
              { 
                id: 'western_plan_a', 
                name: '洋装プランA〈60分〉', 
                price: 15000, 
                duration: 60, 
                category_id: 'bridal',
                treatment_id: 'treatment2',
                gender_filter: 'both'
              },
              { 
                id: 'western_plan_b', 
                name: '洋装プランB〈120分〉', 
                price: 15000, 
                duration: 120, 
                category_id: 'bridal',
                treatment_id: 'treatment3',
                gender_filter: 'male'
              },
                treatment_id: 'treatment3'
              }
            ],
            options: [
              { 
                id: 'eyebrow_cut', 
                name: '眉カット〈30分〉', 
                price: 15000, 
                duration: 30, 
                category_id: 'bridal'
              },
              { 
                id: 'basic_massage', 
                name: 'ベーシックマッサージ〈30分〉', 
                price: 15000, 
                duration: 30, 
                category_id: 'bridal'
              }
            ]
          },
          {
            id: 'shaving',
            name: 'シェービングコース',
            display_name: '◆シェービングコース◆',
            selection_mode: 'single',
            menus: [
              { 
                id: 'relax_course', 
                name: 'リラックスコース〈60分〉', 
                price: 15000, 
                duration: 60, 
                category_id: 'shaving',
                treatment_id: 'treatment5'
              },
              { 
                id: 'basic_course', 
                name: 'ベーシックコース〈30分〉', 
                price: 15000, 
                duration: 30, 
                category_id: 'shaving',
                treatment_id: 'treatment6'
              }
            ],
            options: [
              { 
                id: 'neckline', 
                name: '襟足〈30分〉', 
                price: 15000, 
                duration: 30, 
                category_id: 'shaving'
              },
              { 
                id: 'decollete', 
                name: 'デコルテ〈30分〉', 
                price: 15000, 
                duration: 30, 
                category_id: 'shaving'
              }
            ]
          }
        ],
        display_options: {
          show_price: true,
          show_duration: true,
          show_description: false,
          show_treatment_info: true
        }
      },
      calendar_settings: {
        business_hours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { closed: true, open: '', close: '' },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '20:00', closed: false },
          saturday: { open: '10:00', close: '17:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: false }
        },
        advance_booking_days: 30,
        google_calendar_url: 'https://script.google.com/macros/s/AKfycbwuRvsTr8NVHbJ16xXay7CbMvs2-X4wYjdOmGGhS0CavLd3xJpAnnqnzHtf3yJeqjru/exec'
      },
      ui_settings: {
        theme_color: '#13ca5e',
        button_style: 'rounded',
        show_repeat_booking: true,
        show_side_nav: true
      },
      validation_rules: {
        required_fields: ['name', 'phone', 'visit_option', 'menu'],
        phone_format: 'japanese',
        name_max_length: 50
      }
    },
    status: 'active',
    draft_status: 'none',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    last_published_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'form_XyZ789pQr012StU3',
    store_id: 'store_0001',
    config: {
      basic_info: {
        form_name: 'エステ予約フォーム',
        store_name: '美容室A（東京店）',
        liff_id: 'sample-liff-id-2',
        theme_color: '#e91e63'
      },
      visit_options: [
        { id: 'first_visit', label: '1回目〈30分〉', duration: 30, price: 0 },
        { id: 'repeat_visit', label: '2回目以降〈0分〉', duration: 0, price: 0, is_default: true }
      ],
      gender_selection: {
        enabled: false,
        required: false,
        options: [
          { value: 'male', label: '男性' },
          { value: 'female', label: '女性' }
        ]
      },
      menu_structure: {
        structure_type: 'category_based',
        categories: [
          {
            id: 'massage',
            name: 'マッサージコース',
            display_name: '◆マッサージコース◆',
            selection_mode: 'multiple',
            menus: [
              { 
                id: 'facial', 
                name: 'フェイシャル〈60分〉', 
                price: 8000, 
                duration: 60, 
                category_id: 'massage'
              },
              { 
                id: 'body_care', 
                name: 'ボディケア〈90分〉', 
                price: 12000, 
                duration: 90, 
                category_id: 'massage'
              }
            ],
            options: [
              { 
                id: 'head_spa', 
                name: 'ヘッドスパ〈45分〉', 
                price: 5000, 
                duration: 45, 
                category_id: 'massage'
              }
            ]
          }
        ],
        display_options: {
          show_price: true,
          show_duration: true,
          show_description: true,
          show_treatment_info: false
        }
      },
      calendar_settings: {
        business_hours: {
          monday: { open: '10:00', close: '19:00', closed: false },
          tuesday: { open: '10:00', close: '19:00', closed: false },
          wednesday: { open: '10:00', close: '19:00', closed: false },
          thursday: { closed: true, open: '', close: '' },
          friday: { open: '10:00', close: '19:00', closed: false },
          saturday: { open: '09:00', close: '18:00', closed: false },
          sunday: { open: '09:00', close: '18:00', closed: false }
        },
        advance_booking_days: 30,
        google_calendar_url: 'https://script.google.com/macros/s/AKfycbwuRvsTr8NVHbJ16xXay7CbMvs2-X4wYjdOmGGhS0CavLd3xJpAnnqnzHtf3yJeqjru/exec'
      },
      ui_settings: {
        theme_color: '#e91e63',
        button_style: 'rounded',
        show_repeat_booking: true,
        show_side_nav: false
      },
      validation_rules: {
        required_fields: ['name', 'phone', 'visit_option', 'menu'],
        phone_format: 'japanese',
        name_max_length: 50
      }
    },
    status: 'active',
    draft_status: 'none',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    last_published_at: '2024-01-01T00:00:00Z'
  }
];

export class LocalStorageService {
  // ✅ Store管理
  static getStores(): Store[] {
    return this.getFromStorage(STORAGE_KEYS.STORES, getInitialStores());
  }

  static getStore(storeId: string): Store | null {
    const stores = this.getStores();
    return stores.find(store => store.id === storeId) || null;
  }

  static saveStore(store: Store): void {
    const stores = this.getStores();
    const existingIndex = stores.findIndex(s => s.id === store.id);
    
    if (existingIndex >= 0) {
      stores[existingIndex] = { ...store, updated_at: new Date().toISOString() };
    } else {
      stores.push(store);
    }
    
    this.saveToStorage(STORAGE_KEYS.STORES, stores);
  }

  static deleteStore(storeId: string): boolean {
    const stores = this.getStores();
    const storeIndex = stores.findIndex(s => s.id === storeId);
    
    if (storeIndex === -1) return false;
    
    // Store削除時に、関連するフォームも削除
    const forms = this.getForms();
    const updatedForms = forms.filter(form => form.store_id !== storeId);
    this.saveToStorage(STORAGE_KEYS.FORMS, updatedForms);
    
    stores.splice(storeIndex, 1);
    this.saveToStorage(STORAGE_KEYS.STORES, stores);
    
    return true;
  }

  static getAllStoresWithForms(): StoreWithForms[] {
    const stores = this.getStores();
    const allForms = this.getForms();
    
    return stores.map(store => {
      const storeForms = allForms.filter(form => form.store_id === store.id);
      const activeForms = storeForms.filter(form => form.status === 'active');
      
      return {
        ...store,
        forms: storeForms,
        total_forms: storeForms.length,
        active_forms: activeForms.length
      };
    });
  }

  static generateStoreId(): string {
    const stores = this.getStores();
    const storeIds = stores.map(store => store.id);
    const maxStoreNumber = Math.max(
      ...storeIds.map(id => parseInt(id.replace('store_', '')) || 0)
    );
    return `store_${(maxStoreNumber + 1).toString().padStart(4, '0')}`;
  }

  static generateFormId(): string {
    // 英数文字列（長め）で生成
    return generateSecureFormId();
  }

  // ✅ フォーム管理
  static getForms(): Form[] {
    return this.getFromStorage(STORAGE_KEYS.FORMS, getInitialData());
  }

  static getForm(formId: string): Form | null {
    const forms = this.getForms();
    const form = forms.find(form => form.id === formId) || null;
    
    if (form) {
      // 既存データに性別選択設定がない場合、デフォルト値を追加
      if (!form.config.gender_selection) {
        form.config.gender_selection = {
          enabled: false,
          required: false,
          options: [
            { value: 'male', label: '男性' },
            { value: 'female', label: '女性' }
          ]
        };
      }
      
      // カテゴリーにgender_conditionがない場合、デフォルト値を追加
      form.config.menu_structure.categories.forEach(category => {
        if (!category.gender_condition) {
          category.gender_condition = 'all';
        }
      });
    }
    
    return form;
  }

  static updateForm(formId: string, config: FormConfig): void {
    const forms = this.getForms();
    const formIndex = forms.findIndex(form => form.id === formId);
    
    if (formIndex >= 0) {
      forms[formIndex].config = config;
      forms[formIndex].updated_at = new Date().toISOString();
      forms[formIndex].last_published_at = new Date().toISOString();
      forms[formIndex].draft_status = 'none';
      this.saveToStorage(STORAGE_KEYS.FORMS, forms);
    }
  }

  // 下書きとして保存
  static saveDraft(formId: string, config: FormConfig): void {
    const forms = this.getForms();
    const formIndex = forms.findIndex(form => form.id === formId);
    
    if (formIndex >= 0) {
      forms[formIndex].draft_config = config;
      forms[formIndex].updated_at = new Date().toISOString();
      forms[formIndex].draft_status = 'draft';
      this.saveToStorage(STORAGE_KEYS.FORMS, forms);
    }
  }

  // 下書きを公開（本番に反映）
  static publishDraft(formId: string): void {
    const forms = this.getForms();
    const formIndex = forms.findIndex(form => form.id === formId);
    
    if (formIndex >= 0 && forms[formIndex].draft_config) {
      forms[formIndex].config = forms[formIndex].draft_config!;
      forms[formIndex].draft_config = undefined;
      forms[formIndex].draft_status = 'none';
      forms[formIndex].updated_at = new Date().toISOString();
      forms[formIndex].last_published_at = new Date().toISOString();
      this.saveToStorage(STORAGE_KEYS.FORMS, forms);
    }
  }

  // 下書きを破棄
  static discardDraft(formId: string): void {
    const forms = this.getForms();
    const formIndex = forms.findIndex(form => form.id === formId);
    
    if (formIndex >= 0) {
      forms[formIndex].draft_config = undefined;
      forms[formIndex].draft_status = 'none';
      forms[formIndex].updated_at = new Date().toISOString();
      this.saveToStorage(STORAGE_KEYS.FORMS, forms);
    }
  }

  // ✅ store_0001 のフォームを取得
  static getStoreAForms(): Form[] {
    return this.getForms().filter(form => form.store_id === 'store_0001');
  }

  // ✅ 任意の店舗のフォームを取得（将来拡張用）
  static getFormsByStoreId(storeId: string): Form[] {
    return this.getForms().filter(form => form.store_id === storeId);
  }

  // ✅ ユーザー入力キャッシュ（既存フォーム再現）
  static saveUserInput(formId: string, fieldId: string, value: string | number | boolean): void {
    const cache = this.getUserInputCache();
    if (!cache[formId]) cache[formId] = {};
    cache[formId][fieldId] = value;
    this.saveToStorage(STORAGE_KEYS.USER_INPUTS, cache);
  }

  static getUserInput(formId: string, fieldId: string): string | number | boolean | null {
    const cache = this.getUserInputCache();
    return cache[formId]?.[fieldId] || null;
  }

  // ✅ メニュー選択履歴（前回と同じメニュー機能）
  static savePreviousSelection(formId: string, selection: Partial<MenuSelections>): void {
    const cache = this.getMenuSelectionsCache();
    cache[formId] = {
      ...selection,
      saved_at: new Date().toISOString()
    };
    this.saveToStorage(STORAGE_KEYS.MENU_SELECTIONS, cache);
  }

  static getPreviousSelection(formId: string): Partial<MenuSelections> | null {
    const cache = this.getMenuSelectionsCache();
    return cache[formId] || null;
  }

  // ✅ フォーム複製機能
  static duplicateForm(formId: string, newName: string): string {
    const forms = this.getForms();
    const sourceForm = forms.find(f => f.id === formId);
    
    if (!sourceForm) throw new Error('Source form not found');

    const newFormId = this.generateFormId();
    const duplicatedForm: Form = {
      ...sourceForm,
      id: newFormId,
      config: {
        ...sourceForm.config,
        basic_info: {
          ...sourceForm.config.basic_info,
          form_name: newName
        }
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    forms.push(duplicatedForm);
    this.saveToStorage(STORAGE_KEYS.FORMS, forms);
    
    return newFormId;
  }

  // ✅ 新しいフォーム作成機能
  static createNewForm(formName: string): string {
    const newFormId = this.generateFormId();
    const newStoreId = this.generateStoreId();
    
    const newForm: Form = {
      id: newFormId,
      store_id: newStoreId,
      config: {
        basic_info: {
          form_name: formName,
          store_name: '新しい店舗',
          liff_id: '',
          theme_color: '#1976d2',
          logo_url: ''
        },
        visit_options: [
          {
            id: 'visit_1',
            label: '1回目〈30分〉',
            duration: 30,
            price: 0,
            is_default: true
          },
          {
            id: 'visit_2',
            label: '2回目〈30分〉',
            duration: 30,
            price: 0
          }
        ],
        gender_selection: {
          enabled: false,
          required: false,
          options: [
            { value: 'male', label: '男性' },
            { value: 'female', label: '女性' }
          ]
        },
        menu_structure: {
          structure_type: 'category_based',
          categories: [
            {
              id: 'category_1',
              name: 'basic',
              display_name: '◆基本メニュー◆',
              menus: [
                {
                  id: 'menu_1',
                  name: 'サンプルメニュー',
                  price: 5000,
                  duration: 60,
                  category_id: 'category_1',
                  description: 'サンプル説明'
                }
              ],
              options: [],
              selection_mode: 'single'
            }
          ],
          display_options: {
            show_price: true,
            show_duration: true,
            show_description: true,
            show_treatment_info: false
          }
        },
        calendar_settings: {
          business_hours: {
            monday: { open: '09:00', close: '18:00', closed: false },
            tuesday: { open: '09:00', close: '18:00', closed: false },
            wednesday: { open: '09:00', close: '18:00', closed: false },
            thursday: { open: '09:00', close: '18:00', closed: false },
            friday: { open: '09:00', close: '18:00', closed: false },
            saturday: { open: '09:00', close: '17:00', closed: false },
            sunday: { open: '10:00', close: '16:00', closed: true }
          },
          advance_booking_days: 30,
          google_calendar_url: ''
        },
        ui_settings: {
          theme_color: '#1976d2',
          button_style: 'rounded',
          show_repeat_booking: false,
          show_side_nav: true,
          custom_css: ''
        },
        validation_rules: {
          required_fields: ['name', 'phone'],
          phone_format: 'japanese',
          name_max_length: 50
        }
      },
      status: 'active',
      draft_status: 'none',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const forms = this.getForms();
    forms.push(newForm);
    this.saveToStorage(STORAGE_KEYS.FORMS, forms);
    
    return newFormId;
  }

  // ✅ フォーム削除機能
  static deleteForm(formId: string): boolean {
    const forms = this.getForms();
    const formIndex = forms.findIndex(f => f.id === formId);
    
    if (formIndex === -1) {
      throw new Error('Form not found');
    }

    forms.splice(formIndex, 1);
    this.saveToStorage(STORAGE_KEYS.FORMS, forms);
    
    return true;
  }

  static saveForm(form: Form): void {
    const forms = this.getForms();
    const existingIndex = forms.findIndex(f => f.id === form.id);
    
    if (existingIndex >= 0) {
      forms[existingIndex] = form;
    } else {
      forms.push(form);
    }
    
    this.saveToStorage(STORAGE_KEYS.FORMS, forms);
  }

  // プライベートメソッド
  private static getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  private static saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }

  private static getUserInputCache(): Record<string, Record<string, string | number | boolean>> {
    return this.getFromStorage(STORAGE_KEYS.USER_INPUTS, {});
  }

  private static getMenuSelectionsCache(): Record<string, Partial<MenuSelections> & { saved_at?: string }> {
    return this.getFromStorage(STORAGE_KEYS.MENU_SELECTIONS, {});
  }
}
