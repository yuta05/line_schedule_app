import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LocalStorageService } from '../../services/localStorageService';
import type { Store } from '../../types/store';
import type { Form } from '../../types/form';

interface StoreAdminProps {
  // 将来的な拡張用
}

const StoreAdmin: React.FC<StoreAdminProps> = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // 新しいForm用の状態（LIFF IDとGoogle Calendar API設定を含む）
  const [newForm, setNewForm] = useState({
    form_name: '',
    store_name: '',
    theme_color: '#13ca5e',
    liff_id: '',
    google_calendar_url: ''
  });

  const loadData = React.useCallback(() => {
    if (!storeId) return;
    
    const storeData = LocalStorageService.getStore(storeId);
    const formsData = LocalStorageService.getFormsByStoreId(storeId);
    
    if (!storeData) {
      navigate('/admin');
      return;
    }
    
    setStore(storeData);
    setForms(formsData);
  }, [storeId, navigate]);

  useEffect(() => {
    if (!storeId) {
      navigate('/admin');
      return;
    }
    loadData();
  }, [storeId, navigate, loadData]);

  const resetNewForm = () => {
    setNewForm({
      form_name: '',
      store_name: store?.name || '',
      theme_color: '#13ca5e',
      liff_id: '',
      google_calendar_url: ''
    });
  };

  const handleCreateForm = () => {
    if (!newForm.form_name || !store) {
      alert('フォーム名を入力してください');
      return;
    }

    const formId = LocalStorageService.generateFormId();
    
    const form: Form = {
      id: formId,
      store_id: store.id,
      config: {
        basic_info: {
          form_name: newForm.form_name,
          store_name: newForm.store_name || store.name,
          liff_id: newForm.liff_id,
          theme_color: newForm.theme_color,
          logo_url: ''
        },
        visit_options: [
          {
            id: 'visit_1',
            label: '1回目〈30分〉',
            duration: 30,
            price: 0,
            is_default: true
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
                  category_id: 'category_1'
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
          google_calendar_url: newForm.google_calendar_url
        },
        ui_settings: {
          theme_color: newForm.theme_color,
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

    LocalStorageService.saveForm(form);
    
    loadData();
    resetNewForm();
    setShowAddForm(false);
    
    const customerUrl = `${window.location.origin}/customer/${formId}`;
    const storeAdminUrl = `${window.location.origin}/${store.id}/admin`;
    
    alert(`フォーム「${form.config.basic_info.form_name}」を作成しました\n\nフォームID: ${formId}\n\n顧客用URL:\n${customerUrl}\n\n店舗管理者URL:\n${storeAdminUrl}`);
  };

  const handleDeleteForm = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;

    if (confirm(`フォーム「${form.config.basic_info.form_name}」を削除しますか？`)) {
      LocalStorageService.deleteForm(formId);
      loadData();
      alert('削除しました');
    }
  };

  const generateUrls = (formId: string) => {
    const customerUrl = `${window.location.origin}/customer/${formId}`;
    const adminUrl = `${window.location.origin}/${store?.id}/admin`;
    return { customerUrl, adminUrl };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('URLをコピーしました');
    });
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    header: {
      marginBottom: '30px',
      borderBottom: '2px solid #eee',
      paddingBottom: '20px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '10px'
    },
    breadcrumb: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '10px'
    },
    breadcrumbLink: {
      color: '#13ca5e',
      textDecoration: 'none',
      cursor: 'pointer'
    },
    description: {
      color: '#666',
      fontSize: '16px'
    },
    section: {
      marginBottom: '40px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#444'
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#13ca5e',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '14px',
      marginRight: '10px',
      marginBottom: '10px'
    },
    buttonSecondary: {
      padding: '8px 16px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      marginRight: '8px'
    },
    buttonDanger: {
      padding: '8px 16px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      marginLeft: '8px'
    },
    card: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      backgroundColor: 'white'
    },
    formGroup: {
      marginBottom: '15px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#333'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px'
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      minHeight: '80px'
    },
    storeInfo: {
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px'
    },
    formItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      marginBottom: '15px',
      backgroundColor: '#f8f9fa'
    },
    urlContainer: {
      marginTop: '10px',
      padding: '10px',
      backgroundColor: '#fff',
      borderRadius: '4px',
      fontSize: '12px',
      border: '1px solid #e9ecef'
    },
    urlLabel: {
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    urlText: {
      fontFamily: 'monospace',
      color: '#666',
      wordBreak: 'break-all' as const,
      marginBottom: '5px'
    }
  };

  if (!store) {
    return <div>読み込み中...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.breadcrumb}>
          <span 
            style={styles.breadcrumbLink}
            onClick={() => navigate('/admin')}
          >
            店舗一覧
          </span>
          {' > '}
          {store.name}
        </div>
        <h1 style={styles.title}>{store.name} 管理ページ</h1>
        <p style={styles.description}>
          この店舗の予約フォームを管理します。フォームの追加、編集、削除が可能です。
        </p>
      </div>

      {/* 店舗情報 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>店舗情報</h2>
        <div style={styles.storeInfo}>
          <h3>{store.name} <span style={{color: '#666', fontSize: '14px'}}>({store.id})</span></h3>
          <p><strong>オーナー:</strong> {store.owner_name} ({store.owner_email})</p>
          {store.phone && <p><strong>電話:</strong> {store.phone}</p>}
          {store.address && <p><strong>住所:</strong> {store.address}</p>}
          {store.website_url && <p><strong>サイト:</strong> <a href={store.website_url} target="_blank" rel="noopener noreferrer">{store.website_url}</a></p>}
          {store.description && <p><strong>説明:</strong> {store.description}</p>}
        </div>
      </div>

      {/* フォーム管理セクション */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>フォーム管理</h2>
        
        <button 
          style={styles.button}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'キャンセル' : '+ 新しいフォームを追加'}
        </button>

        {showAddForm && (
          <div style={styles.card}>
            <h3>新しいフォームを追加</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>フォーム名 *</label>
              <input
                type="text"
                style={styles.input}
                value={newForm.form_name}
                onChange={(e) => setNewForm({...newForm, form_name: e.target.value})}
                placeholder="例：美容室予約フォーム"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>店舗名（フォーム表示用）</label>
              <input
                type="text"
                style={styles.input}
                value={newForm.store_name}
                onChange={(e) => setNewForm({...newForm, store_name: e.target.value})}
                placeholder={store.name}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>LIFF ID</label>
              <input
                type="text"
                style={styles.input}
                value={newForm.liff_id}
                onChange={(e) => setNewForm({...newForm, liff_id: e.target.value})}
                placeholder="例：1234567890-abcdefgh"
              />
              <small style={{color: '#666'}}>LINE Front-end Framework ID（LINE連携用）</small>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Google Calendar API URL</label>
              <input
                type="url"
                style={styles.input}
                value={newForm.google_calendar_url}
                onChange={(e) => setNewForm({...newForm, google_calendar_url: e.target.value})}
                placeholder="例：https://script.google.com/macros/s/.../exec"
              />
              <small style={{color: '#666'}}>Googleカレンダー連携用のAPIエンドポイント</small>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>テーマカラー</label>
              <input
                type="color"
                style={{...styles.input, width: '100px'}}
                value={newForm.theme_color}
                onChange={(e) => setNewForm({...newForm, theme_color: e.target.value})}
              />
            </div>
            <button style={styles.button} onClick={handleCreateForm}>
              フォームを作成
            </button>
            <button style={styles.buttonSecondary} onClick={() => setShowAddForm(false)}>
              キャンセル
            </button>
          </div>
        )}

        {/* フォーム一覧 */}
        {forms.length > 0 ? (
          <div>
            <h3>フォーム一覧 ({forms.length}個)</h3>
            {forms.map(form => {
              const { customerUrl, adminUrl } = generateUrls(form.id);
              return (
                <div key={form.id} style={styles.formItem}>
                  <div style={{flex: 1}}>
                    <div><strong>{form.config.basic_info.form_name}</strong></div>
                    <div style={{fontSize: '12px', color: '#666'}}>ID: {form.id}</div>
                    <div style={{fontSize: '12px', color: '#666'}}>
                      ステータス: {form.status === 'active' ? '有効' : '無効'}
                    </div>
                    {form.config.basic_info.liff_id && (
                      <div style={{fontSize: '12px', color: '#666'}}>
                        LIFF ID: {form.config.basic_info.liff_id}
                      </div>
                    )}
                    {form.config.calendar_settings.google_calendar_url && (
                      <div style={{fontSize: '12px', color: '#666'}}>
                        Google Calendar API: 設定済み
                      </div>
                    )}
                    
                    <div style={styles.urlContainer}>
                      <div style={styles.urlLabel}>顧客用URL:</div>
                      <div style={styles.urlText}>{customerUrl}</div>
                      <button 
                        style={styles.buttonSecondary} 
                        onClick={() => copyToClipboard(customerUrl)}
                      >
                        コピー
                      </button>
                      
                      <div style={{...styles.urlLabel, marginTop: '10px'}}>店舗管理者URL:</div>
                      <div style={styles.urlText}>{adminUrl}</div>
                      <button 
                        style={styles.buttonSecondary} 
                        onClick={() => copyToClipboard(adminUrl)}
                      >
                        コピー
                      </button>
                    </div>
                  </div>
                  <div>
                    <button 
                      style={styles.buttonDanger}
                      onClick={() => handleDeleteForm(form.id)}
                    >
                      削除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.card}>
            <p>まだフォームが作成されていません。</p>
            <p>「+ 新しいフォームを追加」ボタンからフォームを作成してください。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreAdmin;
