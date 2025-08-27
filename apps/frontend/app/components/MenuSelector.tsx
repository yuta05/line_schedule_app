'use client';
import { useState, useEffect } from 'react';
import { getMenuConfig, type MenuConfig } from '../../lib/config';

export default function MenuSelector({
  onSelectionChange,
  preset,
}: {
  onSelectionChange: (data: {
    visitCount: '1回目〈30分〉' | '2回目以降〈0分〉' | '';
    course: string;
    menus: string[];
    options: string[];
  }) => void;
  preset?: {
    visitCount: '1回目〈30分〉' | '2回目以降〈0分〉' | '';
    course: string;
    menus: string[];
    options: string[];
  } | null;
}) {
  const [config, setConfig] = useState<MenuConfig | null>(null);
  const [visitCount, setVisitCount] = useState<'1回目〈30分〉' | '2回目以降〈0分〉' | ''>('');
  const [course, setCourse] = useState('');
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    setConfig(getMenuConfig());
  }, []);

  useEffect(() => {
    onSelectionChange({ visitCount, course, menus: selectedMenus, options: selectedOptions });
  }, [visitCount, course, selectedMenus, selectedOptions, onSelectionChange]);

  // 外部からのプリセット適用
  useEffect(() => {
    if (!preset) return;
    setVisitCount(preset.visitCount || '');
    setCourse(preset.course || '');
    setSelectedMenus(preset.menus || []);
    setSelectedOptions(preset.options || []);
  }, [preset]);

  const toggleMenu = (menuName: string) => {
    setSelectedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    );
  };

  const toggleOption = (optionName: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionName) 
        ? prev.filter(o => o !== optionName)
        : [...prev, optionName]
    );
  };

  if (!config) return <div>設定読み込み中...</div>;

  return (
    <section style={{ marginTop: 16 }}>
      <h3>メニュー選択</h3>
      
      <div style={{ marginBottom: 16 }}>
        <h4>ご来店回数</h4>
        <button 
          onClick={() => setVisitCount('1回目〈30分〉')}
          style={{ 
            marginRight: 8, 
            backgroundColor: visitCount === '1回目〈30分〉' ? '#dfd' : '#f9f9f9',
            border: '1px solid #ccc',
            padding: '8px 12px'
          }}
        >
          1回目〈30分〉
        </button>
        <button 
          onClick={() => setVisitCount('2回目以降〈0分〉')}
          style={{ 
            backgroundColor: visitCount === '2回目以降〈0分〉' ? '#dfd' : '#f9f9f9',
            border: '1px solid #ccc',
            padding: '8px 12px'
          }}
        >
          2回目以降〈0分〉
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4>コース</h4>
        <button onClick={() => setCourse('ブライダルコース')} style={{ marginRight: 8, backgroundColor: course === 'ブライダルコース' ? '#dfd' : '#f9f9f9', border: '1px solid #ccc', padding: '8px 12px' }}>ブライダルコース</button>
        <button onClick={() => setCourse('シェービングコース')} style={{ marginRight: 8, backgroundColor: course === 'シェービングコース' ? '#dfd' : '#f9f9f9', border: '1px solid #ccc', padding: '8px 12px' }}>シェービングコース</button>
        <button onClick={() => setCourse('マッサージコース')} style={{ backgroundColor: course === 'マッサージコース' ? '#dfd' : '#f9f9f9', border: '1px solid #ccc', padding: '8px 12px' }}>マッサージコース</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4>メニュー（複数選択可）</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {config.menus.map(menu => (
            <button
              key={menu.name}
              onClick={() => toggleMenu(menu.name)}
              style={{
                backgroundColor: selectedMenus.includes(menu.name) ? '#dfd' : '#f9f9f9',
                border: '1px solid #ccc',
                padding: '8px 12px',
                fontSize: '14px'
              }}
            >
              {menu.name}〈{menu.minutes}分〉
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4>オプション（複数選択可）</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {config.options.map(option => (
            <button
              key={option.name}
              onClick={() => toggleOption(option.name)}
              style={{
                backgroundColor: selectedOptions.includes(option.name) ? '#dfd' : '#f9f9f9',
                border: '1px solid #ccc',
                padding: '8px 12px',
                fontSize: '14px'
              }}
            >
              {option.name}〈{option.minutes}分〉
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0f8ff', border: '1px solid #ccc' }}>
        <strong>選択中:</strong><br/>
        来店回数: {visitCount || '未選択'}<br/>
        コース: {course || '未選択'}<br/>
        メニュー: {selectedMenus.length > 0 ? selectedMenus.join(', ') : '未選択'}<br/>
        オプション: {selectedOptions.length > 0 ? selectedOptions.join(', ') : 'なし'}
      </div>
    </section>
  );
}
