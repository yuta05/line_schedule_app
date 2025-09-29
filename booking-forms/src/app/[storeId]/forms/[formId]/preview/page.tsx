'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form } from '@/types/form';

export default function FormPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const formId = params.formId as string;
  
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');

  // フォーム状態管理
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    visit_count: '',
    coupon: '',
    selected_menu: null as any,
    selected_submenu: null as any,
    selected_options: [] as any[],
    selected_date: '',
    selected_time: '',
    message: ''
  });

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/forms/${formId}`);
        
        if (!response.ok) {
          setError('フォームが見つかりません');
          return;
        }
        
        const formData = await response.json();
        
        // 店舗IDが一致するかチェック
        if (formData.store_id !== storeId) {
          setError('アクセス権限がありません');
          return;
        }
        
        // プレビューでは下書きがあれば下書きを使用
        const previewForm = {
          ...formData,
          config: formData.draft_config || formData.config
        };
        
        setForm(previewForm);
      } catch (err) {
        console.error('Form fetch error:', err);
        setError('フォームの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (formId && storeId) {
      fetchForm();
    }
  }, [formId, storeId]);



  const handleVercelDeploy = async () => {
    if (!form) return;

    setDeployStatus('deploying');
    try {
      const response = await fetch(`/api/forms/${formId}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: form.store_id,
          formId: form.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setDeployStatus('success');
        alert(`デプロイが完了しました！\nURL: ${window.location.origin}${result.deployUrl}`);
        
        // フォームを再取得してデプロイ情報を更新
        const fetchResponse = await fetch(`/api/forms/${formId}`);
        if (fetchResponse.ok) {
          const updatedForm = await fetchResponse.json();
          setForm({
            ...updatedForm,
            config: updatedForm.draft_config || updatedForm.config
          });
        }
      } else {
        const error = await response.json();
        console.error('Deploy error:', error);
        setDeployStatus('error');
        alert('デプロイに失敗しました: ' + (error.error || '不明なエラー'));
      }
    } catch (error) {
      console.error('Deploy error:', error);
      setDeployStatus('error');
      alert('デプロイに失敗しました');
    } finally {
      setTimeout(() => setDeployStatus('idle'), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-lg font-medium mb-4">
            {error || 'フォームが見つかりません'}
          </div>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* プレビューヘッダー */}
      <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500 text-white px-2 py-1 rounded text-sm font-medium">
              プレビュー
            </div>
            <span className="text-yellow-800 text-sm">
              これはプレビュー表示です。実際の公開ページとは異なる場合があります。
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push(`/${storeId}/forms/${formId}`)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              編集に戻る
            </button>
            <button
              onClick={handleVercelDeploy}
              disabled={deployStatus === 'deploying'}
              className={`px-3 py-1 rounded text-sm ${
                deployStatus === 'deploying' 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {deployStatus === 'deploying' ? 'デプロイ中...' : 'Vercelデプロイ'}
            </button>
            <button
              onClick={() => {
                const url = form?.static_deploy?.deploy_url 
                  ? `${window.location.origin}${form.static_deploy.deploy_url}`
                  : `/form/${formId}`;
                window.open(url, '_blank');
              }}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              {form?.static_deploy?.deploy_url ? '静的URL' : '本番URL'}
            </button>
          </div>
        </div>
      </div>

          {/* フォームプレビュー（実際の顧客向けフォームと同じテンプレート） */}
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* フォーム設定情報 */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">フォーム設定情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">フォームID:</span> {form.id}
              </div>
              <div>
                <span className="font-medium text-gray-700">ステータス:</span> {form.status === 'active' ? '公開中' : '非公開'}
              </div>
            </div>
          </div>

          {/* ヘッダー */}
          <div 
            className="rounded-lg shadow-sm p-6 mb-6 text-white"
            style={{ backgroundColor: form.config.basic_info.theme_color }}
          >
            <h1 className="text-2xl font-bold mb-2">
              {form.config.basic_info.form_name}
            </h1>
            <p className="opacity-90">
              {form.config.basic_info.store_name || 'ご予約フォーム'}
            </p>
          </div>

          {/* インタラクティブなプレビューフォーム */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">ご予約内容</h2>
            
            {/* お客様名 */}
            <div className="mb-6" id="name">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="山田太郎"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 電話番号 */}
            <div className="mb-6" id="phone">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="090-1234-5678"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* 性別選択 */}
            {form.config.gender_selection.enabled && (
              <div className="mb-6" id="gender">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  性別 {form.config.gender_selection.required && <span className="text-red-500">*</span>}
                </label>
                <div className="flex space-x-4">
                  {form.config.gender_selection.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({...formData, gender: option.value})}
                      className={`flex-1 py-3 px-4 border-2 rounded-md font-medium transition-colors ${
                        formData.gender === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ご来店回数選択 */}
            {form.config.visit_count_selection?.enabled && (
              <div className="mb-6" id="visit_count">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ご来店回数 {form.config.visit_count_selection.required && <span className="text-red-500">*</span>}
                </label>
                <div className="flex space-x-4">
                  {form.config.visit_count_selection.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({...formData, visit_count: option.value})}
                      className={`flex-1 py-3 px-4 border-2 rounded-md font-medium transition-colors ${
                        formData.visit_count === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* クーポン利用有無選択 */}
            {form.config.coupon_selection?.enabled && (
              <div className="mb-6" id="coupon">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {form.config.coupon_selection.coupon_name 
                    ? `${form.config.coupon_selection.coupon_name}クーポン利用有無`
                    : 'クーポン利用有無'
                  }
                </label>
                <div className="flex space-x-4">
                  {form.config.coupon_selection.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({...formData, coupon: option.value})}
                      className={`flex-1 py-3 px-4 border-2 rounded-md font-medium transition-colors ${
                        formData.coupon === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* メニュー選択 */}
            {form.config.menu_structure.categories.length > 0 && (
              <div className="mb-6" id="menu">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メニューをお選びください
                </label>
                <div className="space-y-4">
                  {form.config.menu_structure.categories.map((category) => (
                    <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="space-y-2">
                        {category.menus.map((menu) => (
                          <div key={menu.id} className="space-y-3">
                            {/* メニューがサブメニューを持つ場合 */}
                            {menu.has_submenu && menu.sub_menu_items && menu.sub_menu_items.length > 0 ? (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData({
                                      ...formData, 
                                      selected_menu: formData.selected_menu?.id === menu.id ? null : menu,
                                      selected_submenu: null
                                    });
                                  }}
                                  className={`w-full flex items-center justify-between p-3 border-2 rounded-md font-medium transition-colors ${
                                    formData.selected_menu?.id === menu.id
                                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <svg 
                                      className={`mr-2 h-5 w-5 transition-transform ${
                                        formData.selected_menu?.id === menu.id ? 'rotate-90' : ''
                                      }`}
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <div>
                                      <div className="text-left">{menu.name}</div>
                                      {menu.description && (
                                        <div className="text-sm opacity-70 text-left">{menu.description}</div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-sm opacity-70">
                                    サブメニューを選択
                                  </div>
                                </button>

                                {/* サブメニュー選択 */}
                                {formData.selected_menu?.id === menu.id && (
                                  <div className="ml-6 mt-3 space-y-2 border-l-2 border-blue-200 pl-4">
                                    <div className="text-sm font-medium text-gray-700 mb-3">サブメニューを選択してください</div>
                                    {menu.sub_menu_items.map((subMenu) => (
                                      <button
                                        key={subMenu.id}
                                        type="button"
                                        onClick={() => setFormData({...formData, selected_submenu: subMenu})}
                                        className={`w-full flex items-center justify-between p-3 border-2 rounded-md font-medium transition-colors ${
                                          formData.selected_submenu?.id === subMenu.id
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                        }`}
                                      >
                                        <div>
                                          <div className="text-left">{subMenu.name}</div>
                                          {subMenu.description && (
                                            <div className="text-sm opacity-70 text-left">{subMenu.description}</div>
                                          )}
                                        </div>
                                        <div className="text-right ml-4">
                                          {form.config.menu_structure.display_options.show_price && (
                                            <div className="font-semibold">¥{subMenu.price.toLocaleString()}</div>
                                          )}
                                          {form.config.menu_structure.display_options.show_duration && (
                                            <div className="text-sm opacity-70">{subMenu.duration}分</div>
                                          )}
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* 通常のメニュー表示 */
                              <button
                                type="button"
                                onClick={() => setFormData({...formData, selected_menu: menu, selected_submenu: null})}
                                className={`w-full flex items-center justify-between p-3 border-2 rounded-md font-medium transition-colors ${
                                  formData.selected_menu?.id === menu.id
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                }`}
                              >
                                <div>
                                  <div className="text-left">{menu.name}</div>
                                  {menu.description && (
                                    <div className="text-sm opacity-70 text-left">{menu.description}</div>
                                  )}
                                </div>
                                <div className="text-right ml-4">
                                  {form.config.menu_structure.display_options.show_price && menu.price !== undefined && (
                                    <div className="font-semibold">¥{menu.price.toLocaleString()}</div>
                                  )}
                                  {form.config.menu_structure.display_options.show_duration && menu.duration !== undefined && (
                                    <div className="text-sm opacity-70">{menu.duration}分</div>
                                  )}
                                </div>
                              </button>
                            )}
                            
                            {/* メニューオプション（サブメニューを使わない場合のみ表示） */}
                            {!menu.has_submenu && menu.options && menu.options.length > 0 && formData.selected_menu?.id === menu.id && (
                              <div className="ml-6 pl-4 border-l-2 border-blue-200 space-y-2">
                                <div className="text-sm font-medium text-gray-700 mb-3">オプション</div>
                                {menu.options.map((option) => (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                      const isSelected = formData.selected_options.some(opt => opt.id === option.id);
                                      if (isSelected) {
                                        setFormData({
                                          ...formData,
                                          selected_options: formData.selected_options.filter(opt => opt.id !== option.id)
                                        });
                                      } else {
                                        setFormData({
                                          ...formData,
                                          selected_options: [...formData.selected_options, option]
                                        });
                                      }
                                    }}
                                    className={`w-full flex items-center justify-between p-2 border-2 rounded-md text-sm font-medium transition-colors ${
                                      formData.selected_options.some(opt => opt.id === option.id)
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <div>
                                        <div className="text-left">
                                          {option.name}
                                          {option.is_default && (
                                            <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                                              おすすめ
                                            </span>
                                          )}
                                        </div>
                                        {option.description && (
                                          <div className="text-xs opacity-70 text-left">{option.description}</div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right ml-2">
                                      {form.config.menu_structure.display_options.show_price && (
                                        <div className="font-medium">
                                          {option.price > 0 ? `+¥${option.price.toLocaleString()}` : '無料'}
                                        </div>
                                      )}
                                      {form.config.menu_structure.display_options.show_duration && option.duration > 0 && (
                                        <div className="text-xs opacity-70">+{option.duration}分</div>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 希望日時 */}
            <div className="mb-6" id="datetime">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                希望日時 <span className="text-red-500">*</span>
              </label>
              <div className="text-sm text-gray-600 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                ※ プレビューでは簡易選択です。実際のフォームでは空き状況に基づいたカレンダーが表示されます
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.selected_date}
                  onChange={(e) => setFormData({...formData, selected_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
                <select
                  value={formData.selected_time}
                  onChange={(e) => setFormData({...formData, selected_time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">時間を選択</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                </select>
              </div>
            </div>

            {/* メッセージ */}
            <div className="mb-6" id="message">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メッセージ（任意）
              </label>
              <textarea
                rows={3}
                placeholder="ご質問やご要望がございましたらこちらにご記入ください"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 予約内容確認 */}
            <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ご予約内容</h3>
              <div className="space-y-3">
                {formData.name && (
                  <div className="flex justify-between items-center">
                    <span><strong>お名前:</strong> {formData.name}</span>
                    <button 
                      onClick={() => scrollToElement('name')}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      修正
                    </button>
                  </div>
                )}
                {formData.phone && (
                  <div className="flex justify-between items-center">
                    <span><strong>電話番号:</strong> {formData.phone}</span>
                    <button 
                      onClick={() => scrollToElement('phone')}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      修正
                    </button>
                  </div>
                )}
                {formData.gender && (
                  <div className="flex justify-between items-center">
                    <span><strong>性別:</strong> {form.config.gender_selection.options.find(opt => opt.value === formData.gender)?.label}</span>
                    <button 
                      onClick={() => scrollToElement('gender')}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      修正
                    </button>
                  </div>
                )}
                {formData.visit_count && (
                  <div className="flex justify-between items-center">
                    <span><strong>ご来店回数:</strong> {form.config.visit_count_selection?.options.find(opt => opt.value === formData.visit_count)?.label}</span>
                    <button 
                      onClick={() => scrollToElement('visit_count')}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      修正
                    </button>
                  </div>
                )}
                {formData.coupon && (
                  <div className="flex justify-between items-center">
                    <span><strong>クーポン:</strong> {form.config.coupon_selection?.options.find(opt => opt.value === formData.coupon)?.label}</span>
                    <button 
                      onClick={() => scrollToElement('coupon')}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      修正
                    </button>
                  </div>
                )}
                {(formData.selected_menu || formData.selected_submenu) && (
                  <div className="flex justify-between items-start">
                    <div>
                      <strong>メニュー:</strong>
                      <div className="mt-1">
                        {formData.selected_submenu ? (
                          <div>
                            <div className="text-sm text-gray-600">{formData.selected_menu.name} &gt;</div>
                            <div className="font-medium">{formData.selected_submenu.name}</div>
                            <div className="text-sm text-gray-600">
                              ¥{formData.selected_submenu.price.toLocaleString()} / {formData.selected_submenu.duration}分
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">{formData.selected_menu.name}</div>
                            {formData.selected_menu.price && (
                              <div className="text-sm text-gray-600">
                                ¥{formData.selected_menu.price.toLocaleString()} / {formData.selected_menu.duration}分
                              </div>
                            )}
                          </div>
                        )}
                        {formData.selected_options.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium">オプション:</div>
                            {formData.selected_options.map(option => (
                              <div key={option.id} className="text-sm text-gray-600 ml-2">
                                • {option.name} (+¥{option.price.toLocaleString()})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => scrollToElement('menu')}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      修正
                    </button>
                  </div>
                )}
                {(formData.selected_date || formData.selected_time) && (
                  <div className="flex justify-between items-center">
                    <span><strong>希望日時:</strong> {formData.selected_date} {formData.selected_time}</span>
                    <button 
                      onClick={() => scrollToElement('datetime')}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      修正
                    </button>
                  </div>
                )}
                {formData.message && (
                  <div className="flex justify-between items-start">
                    <div>
                      <strong>メッセージ:</strong>
                      <div className="mt-1 text-sm text-gray-600">{formData.message}</div>
                    </div>
                    <button 
                      onClick={() => scrollToElement('message')}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      修正
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 予約ボタン */}
            <button
              type="button"
              className="w-full py-3 rounded-md text-white font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: form.config.basic_info.theme_color }}
              onClick={() => {
                alert('プレビューでは実際の予約はできません。\n\n選択された内容:\n' + 
                  Object.entries(formData)
                    .filter(([, value]) => value && value !== '')
                    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
                    .join('\n')
                );
              }}
            >
              予約する（プレビュー）
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
