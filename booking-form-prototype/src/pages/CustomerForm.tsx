import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import WeeklyCalendar from '../components/Calendar/WeeklyCalendar';
import type { Form } from '../types/form';
import { LocalStorageService } from '../services/localStorageService';

const CustomerForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get('preview') === 'true';

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  // フォーム状態
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [visitCount, setVisitCount] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [message, setMessage] = useState('');

  // 価格計算用
  const [menuPrice, setMenuPrice] = useState(0);
  const [optionsPrice, setOptionsPrice] = useState(0);

  // 時間計算用
  const [selectedMenuTime, setSelectedMenuTime] = useState(0);
  const [selectedOptionsTime, setSelectedOptionsTime] = useState(0);
  const [selectedVisitTime, setSelectedVisitTime] = useState(0);

  // UI状態
  const [activeMenuCategory, setActiveMenuCategory] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const loadForm = () => {
      if (!formId) return;

      const loadedForm = LocalStorageService.getForm(formId);
      if (loadedForm) {
        setForm(loadedForm);
        console.log('CustomerForm loaded:', {
          formId,
          isPreviewMode,
          hasDraft: !!loadedForm.draft_config,
          draftStatus: loadedForm.draft_status,
          configFormName: loadedForm.config?.basic_info?.form_name,
          draftFormName: loadedForm.draft_config?.basic_info?.form_name
        });
      }
      setLoading(false);
    };

    loadForm();
  }, [formId, isPreviewMode]);

  const getActiveConfig = () => {
    if (!form) return null;
    return isPreviewMode && form.draft_config ? form.draft_config : form.config;
  };

  const activeConfig = getActiveConfig();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: "'Poppins', sans-serif"
      }}>
        読み込み中...
      </div>
    );
  }

  if (!form || !activeConfig) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: "'Poppins', sans-serif"
      }}>
        フォームが見つかりません
      </div>
    );
  }

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
  };

  const handleVisitSelect = (visit: string) => {
    setVisitCount(visit);
    // 来店オプションから時間を取得
    const visitOption = activeConfig.visit_options.find((opt: any) => opt.label === visit);
    setSelectedVisitTime(visitOption?.duration || 0);
  };

  const handleMenuCategorySelect = (categoryName: string) => {
    setActiveMenuCategory(categoryName);
    setSelectedMenu(categoryName);
    // メニューとオプションをリセット
    setSelectedSymptom([]);
    setSelectedOptions([]);
    setMenuPrice(0);
    setOptionsPrice(0);
    setSelectedMenuTime(0);
    setSelectedOptionsTime(0);
    setSelectedDateTime(null);
  };

  const handleMenuItemSelect = (menuItem: any) => {
    setSelectedSymptom([menuItem.name]);
    setMenuPrice(menuItem.price || 0);
    setSelectedMenuTime(menuItem.duration || 0);
    setShowCalendar(true);
  };

  const handleOptionSelect = (option: any, isSelected: boolean) => {
    if (isSelected) {
      setSelectedOptions([...selectedOptions, option.name]);
      setOptionsPrice(optionsPrice + (option.price || 0));
      setSelectedOptionsTime(selectedOptionsTime + (option.duration || 0));
    } else {
      setSelectedOptions(selectedOptions.filter(opt => opt !== option.name));
      setOptionsPrice(optionsPrice - (option.price || 0));
      setSelectedOptionsTime(selectedOptionsTime - (option.duration || 0));
    }
  };

  const handleSubmit = () => {
    // バリデーション
    if (!name.trim()) {
      alert('お名前を入力してください。');
      return;
    }
    if (!phone.trim()) {
      alert('電話番号を入力してください。');
      return;
    }
    if (!visitCount) {
      alert('ご来店回数を選択してください。');
      return;
    }
    if (selectedSymptom.length === 0) {
      alert('メニューを選択してください。');
      return;
    }
    if (!selectedDateTime) {
      alert('希望日時を選択してください。');
      return;
    }

    // LINEトークにメッセージを送信
    const messageText = `【予約フォーム】\nお名前：${name}\n電話番号：${phone}\nご来店回数：${visitCount}\nコース：${selectedMenu}\nメニュー：${selectedSymptom.join(', ')}${selectedOptions.length > 0 ? ', ' + selectedOptions.join(', ') : ''}\n希望日時：${selectedDateTime}\nメッセージ：${message}`;

    if (typeof window !== 'undefined' && (window as any).liff) {
      (window as any).liff.sendMessages([{
        type: 'text',
        text: messageText
      }]).then(() => {
        alert('予約を送信しました。');
        (window as any).liff.closeWindow();
      }).catch((err: any) => {
        console.error('メッセージの送信に失敗しました', err);
        alert('送信に失敗しました。もう一度お試しください。');
      });
    } else {
      // 開発環境では console.log
      console.log('予約内容:', messageText);
      alert('予約内容をコンソールに出力しました（開発環境）');
    }
  };

  // 性別に基づいてメニューカテゴリをフィルタリング
  const getFilteredCategories = () => {
    if (!activeConfig?.menu_structure?.categories) return [];
    
    return activeConfig.menu_structure.categories.filter((category: any) => {
      // カテゴリレベルの性別フィルタをチェック
      if (category.gender_filter && category.gender_filter !== 'both') {
        return !selectedGender || selectedGender === category.gender_filter;
      }
      
      // カテゴリ内に表示可能なメニューがあるかチェック
      if (category.items) {
        return category.items.some((item: any) => {
          if (item.gender_filter && item.gender_filter !== 'both') {
            return !selectedGender || selectedGender === item.gender_filter;
          }
          return true;
        });
      }
      
      return true;
    });
  };

  // 性別に基づいてメニューアイテムをフィルタリング
  const getFilteredMenuItems = (category: any) => {
    if (!category?.items) return category?.menus || [];
    
    return category.items.filter((item: any) => {
      if (item.gender_filter && item.gender_filter !== 'both') {
        return !selectedGender || selectedGender === item.gender_filter;
      }
      return true;
    });
  };

  const renderGenderSelection = () => {
    if (!activeConfig.gender_selection?.enabled) return null;

    return (
      <div>
        <div className="label">
          性別選択<span className="required">必須</span>
        </div>
        <div className="visit-buttons">
          {activeConfig.gender_selection.options.map((option: any) => (
            <button 
              key={option.value}
              type="button" 
              className={selectedGender === option.value ? 'active' : ''}
              onClick={() => handleGenderSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderVisitOptions = () => {
    if (!activeConfig.visit_options || activeConfig.visit_options.length === 0) return null;

    return (
      <div>
        <div className="label">
          ご来店回数<span className="required">必須</span>
        </div>
        <div className="visit-buttons">
          {activeConfig.visit_options.map((option: any) => (
            <button 
              key={option.id}
              type="button" 
              className={visitCount === option.label ? 'active' : ''}
              onClick={() => handleVisitSelect(option.label)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderMenuCategories = () => {
    if (!activeConfig.menu_structure?.categories) return null;

    const filteredCategories = getFilteredCategories();

    return (
      <div>
        <div className="label">
          メニューをお選びください<span className="required">必須</span>
        </div>
        <div className="info-text">
          ※メニューを選択すると<br />空き状況のカレンダーが表示されます
        </div>
        <div className="menu-sections">
          {filteredCategories.map((category: any) => (
            <button 
              key={category.id}
              type="button"
              className={activeMenuCategory === (category.display_name || category.name) ? 'active' : ''}
              onClick={() => handleMenuCategorySelect(category.display_name || category.name)}
            >
              {category.display_name || category.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderMenuItems = () => {
    if (!activeMenuCategory || !activeConfig.menu_structure?.categories) return null;

    const category = activeConfig.menu_structure.categories.find(
      (cat: any) => cat.display_name === activeMenuCategory
    );

    if (!category) return null;

    return (
      <div id={category.id} className="menu-section active">
        <div className="labeltyuuou">
          <span className="highlight-text">◆{category.display_name}◆</span>
        </div>
        <div className="symptoms">
          {category.menus.map((item: any) => (
            <button 
              key={item.id}
              type="button"
              className={selectedSymptom.includes(item.name) ? 'active' : ''}
              onClick={() => handleMenuItemSelect(item)}
              data-price={item.price}
            >
              {item.name}
              {item.price && `（${item.price}円`}
              {item.duration && `/${item.duration}分）`}
            </button>
          ))}
        </div>

        {category.options && category.options.length > 0 && (
          <>
            <div className="labeltyuuou">
              <span className="highlight-text">オプション</span>
            </div>
            <div className="irradiations">
              {category.options.map((option: any) => (
                <button 
                  key={option.id}
                  type="button"
                  className={selectedOptions.includes(option.name) ? 'active' : ''}
                  onClick={() => {
                    const isSelected = selectedOptions.includes(option.name);
                    handleOptionSelect(option, !isSelected);
                  }}
                  data-price={option.price}
                >
                  {option.name}
                  {option.price && `（${option.price}円`}
                  {option.duration && `/${option.duration}分）`}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderSummary = () => {
    const totalMinutes = selectedMenuTime + selectedOptionsTime + selectedVisitTime;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalAmount = menuPrice + optionsPrice;

    const labelStyle = "color:#0c0c0c; font-size:14px; border:1px solid #0c0c0c; padding:0px 3px; border-radius:4px;";

    return (
      <div id="displayInfo">
        <div className="info-row">
          <p><span style={{color: labelStyle}}><strong>お名前</strong></span> {name}</p>
        </div>
        <hr />
        <div className="info-row">
          <p>
            <span style={{color: labelStyle}}><strong>来店回数</strong></span> {visitCount || '未選択'}
          </p>
        </div>
        <hr />
        <div className="info-row">
          <p>
            <span style={{color: labelStyle}}><strong>コース</strong></span> {selectedMenu || '未選択'}
          </p>
        </div>
        <hr />
        <div className="info-row">
          <p>
            <span style={{color: labelStyle}}><strong>メニュー</strong></span><br />
            {selectedSymptom.length > 0 ? selectedSymptom.join(', ') : '未選択'}
          </p>
        </div>
        <hr />
        <div className="info-row">
          <p>
            <span style={{color: labelStyle}}><strong>オプション</strong></span><br />
            {selectedOptions.length > 0 ? selectedOptions.join(', ') : 'なし'}
          </p>
        </div>
        <hr />
        <div className="info-row">
          <p>
            <span style={{color: labelStyle}}><strong>所要時間</strong></span> {hours > 0 ? `${hours}時間` : ''}{minutes}分
          </p>
        </div>
        <hr />
        <div className="info-row">
          <p>
            <span style={{color: labelStyle}}><strong>希望日時</strong></span> {selectedDateTime ? selectedDateTime.toLocaleDateString('ja-JP') + ' ' + selectedDateTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '未選択'}
          </p>
        </div>
        <hr />
        <div className="info-row">
          <p>
            <span style={{color: labelStyle}}><strong>合計金額</strong></span> ¥{totalAmount.toLocaleString()}
          </p>
        </div>
        <hr />
      </div>
    );
  };

  return (
    <>
      <style>{`
        body {
          font-family: 'Poppins', sans-serif;
          background-color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          height: 100vh;
          margin: 0;
          padding-top: 5px;
          overflow-x: hidden;
        }

        .container {
          background-color: #fdfdfd;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          width: 90%;
          max-width: 500px;
          padding: 25px;
          box-sizing: border-box;
          margin: 0 auto;
        }

        h1 {
          background: linear-gradient(135deg, ${activeConfig?.basic_info?.theme_color || '#13ca5e'}, ${activeConfig?.basic_info?.theme_color || '#13ca5e'});
          color: white;
          padding: 20px;
          border-radius: 0 0px 0px 0px;
          text-align: center;
          display: block;
          margin: -20px -15px 20px -15px;
          font-size: 26px;
          font-weight: 100;
          box-shadow: inset 0 -5px 10px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
        }

        .label {
          display: block;
          margin-bottom: 20px;
          padding: 3px;
          font-weight: 400;
          background-color: ${activeConfig?.basic_info?.theme_color || '#13ca5e'};
          color: #ffffff;
          border-radius: 0px;
          font-size: 18px;
          text-align: center;
          text-indent: 20px;
          position: relative;
          overflow: hidden;
          border-top: 1px solid black;
          border-bottom: 1px solid black;
        }

        .labeltyuuou {
          display: block;
          margin-bottom: 20px;
          padding: 3px;
          background-color: ${activeConfig?.basic_info?.theme_color || '#13ca5e'};
          color: #ffffff;
          border-radius: 0px;
          font-size: 18px;
          text-align: center;
          text-indent: 0px;
          position: relative;
          overflow: hidden;
          border-top: 1px solid black;
          border-bottom: 1px solid black;
        }

        .labelContent {
          display: block;
          margin-bottom: 10px;
          padding: 3px;
          font-weight: 400;
          background-color: #ffffff;
          color: rgb(20, 20, 20);
          border-radius: 0px;
          font-size: 18px;
          text-align: center;
          text-indent: 0px;
          position: relative;
          overflow: hidden;
          border-top: 1px solid black;
          border-bottom: 1px solid black;
        }

        .required {
          color: #ffffff;
          font-weight: lighter;
          font-size: 0.6em;
          margin-left: 5px;
          vertical-align: 0.8em;
          background-color: rgb(255, 15, 15);
          padding: 0 5px;
          border-radius: 3px;
          margin-right: 5px;
        }

        input[type="text"],
        input[type="tel"],
        input[type="datetime-local"],
        textarea {
          width: 100%;
          padding: 12px;
          margin-bottom: 10px;
          border: 1px solid #555555;
          border-radius: 3px;
          box-sizing: border-box;
          font-size: 16px;
          transition: all 0.3s;
          position: relative;
          top: -5px;
        }

        .visit-buttons,
        .menu-sections {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }

        .visit-buttons button,
        .menu-sections button {
          flex: 1;
          padding: 10px;
          border: 1px solid #2e2e2e;
          border-radius: 4px;
          background-color: #f7f7f7;
          cursor: pointer;
          box-sizing: border-box;
          text-align: center;
          white-space: nowrap;
        }

        .visit-buttons button.active,
        .menu-sections button.active {
          background-color: #ffffff;
          color: #141414;
        }

        .symptoms,
        .irradiations {
          display: block;
        }

        .symptoms button,
        .irradiations button {
          display: block;
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #000000;
          border-radius: 4px;
          background-color: #ffffff;
          cursor: pointer;
          box-sizing: border-box;
          text-align: center;
          white-space: nowrap;
        }

        .symptoms button.active,
        .irradiations button.active {
          background-color: #ffffff;
          color: #000000;
          outline: 1px solid #2b2b2b;
          outline-offset: 2px;
          box-shadow: 0 0 0 3px ${activeConfig?.basic_info?.theme_color || '#13ca5e'};
        }

        .info-text {
          position: relative;
          top: -20px;
          margin-top: 0;
          margin-bottom: 0px;
          font-size: 13px;
          color: #000000;
          line-height: 1.5;
          text-align: center;
          word-wrap: break-word;
          background-color: #f3f3f3;
          padding: 0px;
          border-radius: 0 0 4px 4px;
          border: 1px solid black;
          border-top: none;
        }

        .submit-button {
          width: 100%;
          padding: 15px;
          font-size: 18px;
          background-color: ${activeConfig?.basic_info?.theme_color || '#13ca5e'};
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 12px;
        }

        .submit-button:hover {
          background-color: ${activeConfig?.basic_info?.theme_color || '#13ca5e'};
          opacity: 0.9;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: -6px 0;
        }

        hr {
          margin: -5px 0;
        }

        .menu-section {
          display: none;
        }

        .menu-section.active {
          display: block;
        }

        @media (max-width: 768px) {
          .container {
            padding: 15px;
          }
          
          h1 {
            font-size: 22px;
          }
          
          input,
          button {
            font-size: 14px;
          }
          
          .info-text {
            font-size: 11.5px;
            top: -20px;
            line-height: 2.0;
          }
        }
      `}</style>

      <div className="container">
        <h1>
          {activeConfig.basic_info?.form_name || 'フォーム'}
          <br />
          予約フォーム
          {isPreviewMode && (
            <div style={{ fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '5px', marginTop: '10px', borderRadius: '3px' }}>
              プレビューモード
            </div>
          )}
        </h1>

        <div className="label">
          お客様名<span className="required">必須</span>
        </div>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="お名前を入力してください" 
        />

        <div className="label">
          電話番号<span className="required">必須</span>
        </div>
        <input 
          type="tel" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="電話番号を入力してください" 
        />

        {renderGenderSelection()}
        {renderVisitOptions()}
        {renderMenuCategories()}
        {renderMenuItems()}

        {showCalendar && selectedSymptom.length > 0 && (
          <div>
            <div className="label">
              希望日時<span className="required">必須</span>
            </div>
            <div style={{ 
              padding: '20px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <WeeklyCalendar
                businessHours={activeConfig.calendar_settings.business_hours}
                selectedDateTime={selectedDateTime}
                onDateTimeSelect={setSelectedDateTime}
                totalDuration={selectedMenuTime + selectedOptionsTime + selectedVisitTime}
                advanceBookingDays={activeConfig.calendar_settings.advance_booking_days}
              />
            </div>
          </div>
        )}

        <div className="labelContent">
          メッセージ<br />（質問等お気軽にご記入ください）
        </div>
        <textarea 
          rows={4} 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="メッセージを入力してください"
        />

        <div className="labelContent">ご予約内容</div>
        {renderSummary()}

        <button className="submit-button" onClick={handleSubmit}>
          予約を行う
        </button>
      </div>
    </>
  );
};

export default CustomerForm;
