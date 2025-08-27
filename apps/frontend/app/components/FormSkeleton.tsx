'use client';
import { useEffect, useState } from 'react';
import liff from '@line/liff';
import { getUIConfig } from '../../lib/config';

export default function FormSkeleton({ 
  selectedLabel, 
  menuSelection 
}: { 
  selectedLabel: string;
  menuSelection: {
    visitCount: '1回目〈30分〉' | '2回目以降〈0分〉' | '';
    course: string;
    menus: string[];
    options: string[];
  };
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [visitCount, setVisit] = useState<'1回目〈30分〉' | '2回目以降〈0分〉' | ''>('');
  const [course, setCourse] = useState('');
  const [menu, setMenu] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [dateText, setDateText] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ui = getUIConfig();

  // 初期読み込み（localStorage）
  useEffect(() => {
    try {
      setName(localStorage.getItem('name') || '');
      setPhone(localStorage.getItem('phone') || '');
      setDateText(localStorage.getItem('selectedDateText') || '');
    } catch {}
  }, []);

  // カレンダー選択の反映＋保存
  useEffect(() => {
    if (selectedLabel) {
      setDateText(selectedLabel);
      try { localStorage.setItem('selectedDateText', selectedLabel); } catch {}
    }
  }, [selectedLabel]);

  // 入力の保存（最低限）
  useEffect(() => { try { localStorage.setItem('name', name); } catch {} }, [name]);
  useEffect(() => { try { localStorage.setItem('phone', phone); } catch {} }, [phone]);
  useEffect(() => { try { localStorage.setItem('selectedDateText', dateText); } catch {} }, [dateText]);
  useEffect(() => { try { localStorage.setItem('consent', consent ? '1' : '0'); } catch {} }, [consent]);

  // 前回と同じメニューで予約
  const applyPreviousSelection = () => {
    try {
      const lastMenu = localStorage.getItem('lastMenuSelection');
      if (!lastMenu) { alert('前回のメニューは見つかりません'); return; }
      const data = JSON.parse(lastMenu) as typeof menuSelection;
      alert(`前回の選択を適用しました: ${[data.visitCount, data.course, [...data.menus, ...data.options].join(', ')].join(' / ')}`);
    } catch {}
  };

  const send = async () => {
    setError(null);
    // バリデーション
    if (!name.trim()) { setError('お名前は必須です'); return; }
    if (!phone.trim()) { setError('電話番号は必須です'); return; }
    if (!menuSelection.visitCount) { setError('ご来店回数を選択してください'); return; }
    if (!menuSelection.course) { setError('コースを選択してください'); return; }
    if (menuSelection.menus.length === 0) { setError('メニューを選択してください'); return; }
    if (!selectedLabel && !dateText.trim()) { setError('希望日時を選択してください'); return; }
    if (!consent) { setError('注意事項に同意が必要です'); return; }

    const text = `【予約フォーム】\nお名前：${name}\n電話番号：${phone}\nご来店回数：${menuSelection.visitCount}\nコース：${menuSelection.course}\nメニュー：${menuSelection.menus.join(', ')},${menuSelection.options.join(', ')}\n希望日時：\n ${dateText}\nメッセージ：${message}`;
    try {
      await liff.sendMessages([{ type: 'text', text }]);
      alert('当日キャンセルは無いようにお願いいたします。');
      liff.closeWindow();
    } catch (e) {
      alert('送信に失敗しました。LIFF内で開いているかご確認ください。');
      // フォールバック（開発用）
      console.log(text);
    }
  };

  return (
    <section style={{ marginTop: 24 }}>
      <h2>入力（簡易版）</h2>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <div style={{ padding: 12, background: '#fffbe6', border: '1px solid #f0e6a6', marginBottom: 12, fontSize: 14 }}>
        {ui.notice}
      </div>
      <div>
        <input placeholder="お名前" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <input placeholder="電話番号" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div style={{ padding: 12, backgroundColor: '#f0f8ff', border: '1px solid #ccc', marginBottom: 16 }}>
        <strong>選択内容確認:</strong><br/>
        来店回数: {menuSelection.visitCount || '未選択'}<br/>
        コース: {menuSelection.course || '未選択'}<br/>
        メニュー: {menuSelection.menus.length > 0 ? menuSelection.menus.join(', ') : '未選択'}<br/>
        オプション: {menuSelection.options.length > 0 ? menuSelection.options.join(', ') : 'なし'}
      </div>
      <div>
        <input placeholder="希望日時（例: 2025年08月30日 14:00）" value={dateText} onChange={e => setDateText(e.target.value)} />
      </div>
      <div>
        <textarea placeholder="メッセージ" value={message} onChange={e => setMessage(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> {ui.consent}
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={applyPreviousSelection}>前回と同じメニューで予約する</button>
      </div>
      <button onClick={send}>予約を行う</button>
    </section>
  );
}


