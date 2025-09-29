'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form } from '@/types/form';
import BusinessRulesEditor from '@/components/FormEditor/BusinessRulesEditor';
import MenuStructureEditor from '@/components/FormEditor/MenuStructureEditor';

// フォーム構造の互換性を保つためのヘルパー関数
function getFormName(form: Form): string {
  return (form as any).form_name || form.config?.basic_info?.form_name || 'フォーム';
}

function getFormConfig(form: Form) {
  // 新しい簡易フォーム形式の場合、config構造を模擬
  if ((form as any).form_name && !form.config) {
    return {
      basic_info: {
        form_name: (form as any).form_name || 'フォーム',
        theme_color: (form as any).basic_info?.theme_color || '#3B82F6',
        store_name: (form as any).basic_info?.store_name || '',
        liff_id: (form as any).basic_info?.liff_id || (form as any).line_settings?.liff_id || ''
      },
      gender_selection: (form as any).basic_info?.show_gender_selection ? {
        enabled: true,
        required: false,
        options: [
          { value: 'male', label: '男性' },
          { value: 'female', label: '女性' }
        ]
      } : { enabled: false, required: false, options: [] },
      visit_count_selection: {
        enabled: (form as any).ui_settings?.show_visit_count || false,
        required: false,
        options: []
      },
      coupon_selection: {
        enabled: (form as any).ui_settings?.show_coupon_selection || false,
        coupon_name: '',
        options: []
      },
      menu_structure: (form as any).menu_structure || { categories: [] },
      calendar_settings: (form as any).business_rules || {},
      ui_settings: (form as any).ui_settings || {}
    };
  }
  return form.config;
}

export default function FormEditPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const formId = params.formId as string;
  
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'menu' | 'business' | 'options'>('basic');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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
        
        setForm(formData);
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

  const handleSave = async () => {
    if (!form) return;
    
    setSaveStatus('saving');
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const updatedForm = await response.json();
        setForm(updatedForm);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        const error = await response.json();
        console.error('Save error:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handlePreview = () => {
    router.push(`/${storeId}/forms/${formId}/preview`);
  };

  const handlePublish = async () => {
    if (!form) return;
    
    if (window.confirm('フォームを公開しますか？')) {
      setSaveStatus('saving');
      try {
        const publishedForm = {
          ...form,
          status: 'active' as const,
          draft_status: 'published' as const,
          last_published_at: new Date().toISOString()
        };

        const response = await fetch(`/api/forms/${formId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(publishedForm),
        });

        if (response.ok) {
          const updatedForm = await response.json();
          setForm(updatedForm);
          setSaveStatus('saved');
          alert('フォームを公開しました');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          const error = await response.json();
          console.error('Publish error:', error);
          setSaveStatus('error');
          alert('公開に失敗しました');
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch (error) {
        console.error('Publish error:', error);
        setSaveStatus('error');
        alert('公開に失敗しました');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    }
  };

  const handleUnpublish = async () => {
    if (!form) return;
    
    if (window.confirm('フォームを非公開にしますか？')) {
      setSaveStatus('saving');
      try {
        const unpublishedForm = {
          ...form,
          status: 'inactive' as const
        };

        const response = await fetch(`/api/forms/${formId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(unpublishedForm),
        });

        if (response.ok) {
          const updatedForm = await response.json();
          setForm(updatedForm);
          setSaveStatus('saved');
          alert('フォームを非公開にしました');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          const error = await response.json();
          console.error('Unpublish error:', error);
          setSaveStatus('error');
          alert('非公開に失敗しました');
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch (error) {
        console.error('Unpublish error:', error);
        setSaveStatus('error');
        alert('非公開に失敗しました');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    }
  };

  const handleVercelDeploy = async () => {
    if (!form) return;
    
    if (window.confirm('Vercelに静的フォームをデプロイしますか？\n既存のフォームがある場合は上書きされます。')) {
      setSaveStatus('saving');
      try {
        const response = await fetch(`/api/forms/${formId}/deploy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ storeId, formId }),
        });

        if (response.ok) {
          const result = await response.json();
          setSaveStatus('saved');
          
          // フォームデータを再フェッチしてstatic_deploy情報を更新
          try {
            const refreshResponse = await fetch(`/api/forms/${formId}`);
            if (refreshResponse.ok) {
              const updatedForm = await refreshResponse.json();
              setForm(updatedForm);
            }
          } catch (error) {
            console.error('Form refresh error:', error);
          }
          
          // デプロイ結果を表示
          if (result.deployUrl) {
            alert(`Vercelデプロイが完了しました！\n\n静的URL: ${window.location.origin}${result.deployUrl}\n\nこのURLは高速で安定したアクセスが可能です。`);
          } else {
            alert('Vercelデプロイが開始されました。\n数分後にデプロイが完了します。');
          }
          
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          const error = await response.json();
          console.error('Deploy error:', error);
          setSaveStatus('error');
          alert(`デプロイに失敗しました: ${error.message || '不明なエラー'}`);
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch (error) {
        console.error('Deploy error:', error);
        setSaveStatus('error');
        alert('デプロイに失敗しました');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
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
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/${storeId}/admin`)}
                className="text-blue-600 hover:text-blue-800"
              >
                ← 戻る
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {(form as any).form_name || form.config?.basic_info?.form_name || 'フォーム'} - 編集
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">ID: {form.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    form.status === 'active' 
                      ? 'text-green-600 bg-green-100' 
                      : 'text-gray-600 bg-gray-100'
                  }`}>
                    {form.status === 'active' ? '公開中' : '非公開'}
                  </span>
                  {form.status === 'active' && (
                    <button
                      onClick={() => {
                        const publicUrl = `${window.location.origin}/form/${form.id}`;
                        navigator.clipboard.writeText(publicUrl);
                        alert('公開URLをクリップボードにコピーしました');
                      }}
                      className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200"
                    >
                      URLをコピー
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePreview}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                プレビュー
              </button>
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saveStatus === 'saving' ? '保存中...' : '保存'}
              </button>
              <button
                onClick={handleVercelDeploy}
                disabled={saveStatus === 'saving'}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <span>🚀</span>
                <span>Vercelデプロイ</span>
              </button>
              
              {/* デプロイ済みURL表示 */}
              {form.static_deploy && form.static_deploy.status === 'deployed' && (
                <div className="bg-green-50 px-4 py-3 rounded-md border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-green-600 text-sm font-medium">✅ 静的フォームデプロイ済み</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(form.static_deploy.deployed_at).toLocaleString('ja-JP')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a 
                      href={form.static_deploy.deploy_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline break-all"
                    >
                      {window.location.origin}{form.static_deploy.deploy_url}
                    </a>
                    <button
                      onClick={() => form.static_deploy && navigator.clipboard.writeText(window.location.origin + form.static_deploy.deploy_url)}
                      className="text-gray-500 hover:text-gray-700 text-sm p-1 flex-shrink-0"
                      title="URLをコピー"
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}
              {form.status === 'inactive' ? (
                <button
                  onClick={handlePublish}
                  disabled={saveStatus === 'saving'}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  公開
                </button>
              ) : (
                <button
                  onClick={handleUnpublish}
                  disabled={saveStatus === 'saving'}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  非公開にする
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              基本情報
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'menu'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              メニュー構成
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'business'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              営業時間・ルール
            </button>
            <button
              onClick={() => setActiveTab('options')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'options'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              オプション設定
            </button>
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* 公開URL表示 */}
            {form.status === 'active' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">
                  🎉 フォームが公開されています
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-700">公開URL:</span>
                  <code className="flex-1 bg-white px-2 py-1 rounded text-sm text-gray-800 border">
                    {typeof window !== 'undefined' && `${window.location.origin}/form/${form.id}`}
                  </code>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        const publicUrl = `${window.location.origin}/form/${form.id}`;
                        navigator.clipboard.writeText(publicUrl);
                        alert('公開URLをクリップボードにコピーしました');
                      }
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    コピー
                  </button>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(`/form/${form.id}`, '_blank');
                      }
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    開く
                  </button>
                </div>
                {form.last_published_at && (
                  <p className="text-xs text-green-600 mt-1">
                    公開日時: {new Date(form.last_published_at).toLocaleString('ja-JP')}
                  </p>
                )}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">基本情報設定</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    フォーム名
                  </label>
                  <input
                    type="text"
                    value={(form as any).form_name || form.config?.basic_info?.form_name || 'フォーム'}
                    onChange={(e) => {
                      if ((form as any).form_name && !form.config) {
                        // 新しい簡易フォーム形式の場合
                        setForm({
                          ...form,
                          form_name: e.target.value
                        } as any);
                      } else {
                        // 従来のconfig形式の場合
                        setForm({
                          ...form,
                          config: {
                            ...form.config,
                            basic_info: {
                              ...form.config.basic_info,
                              form_name: e.target.value
                            }
                          }
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    テーマカラー
                  </label>
                  <input
                    type="color"
                    value={(form as any).basic_info?.theme_color || form.config?.basic_info?.theme_color || '#3B82F6'}
                    onChange={(e) => {
                      if ((form as any).form_name && !form.config) {
                        // 新しい簡易フォーム形式の場合
                        setForm({
                          ...form,
                          basic_info: {
                            ...(form as any).basic_info,
                            theme_color: e.target.value
                          }
                        } as any);
                      } else {
                        // 従来のconfig形式の場合
                        setForm({
                          ...form,
                          config: {
                            ...form.config,
                            basic_info: {
                              ...form.config.basic_info,
                              theme_color: e.target.value
                            }
                          }
                        });
                      }
                    }}
                    className="w-20 h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <MenuStructureEditor 
              form={form}
              onUpdate={setForm}
            />
          </div>
        )}

        {activeTab === 'business' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <BusinessRulesEditor 
              form={form}
              onUpdate={setForm}
            />
          </div>
        )}

        {activeTab === 'options' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">オプション設定</h2>
              
              {/* ご来店回数設定 */}
              <div className="border-b border-gray-200 pb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">ご来店回数選択</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.config.visit_count_selection?.enabled || false}
                      onChange={(e) => {
                        const updatedForm = {
                          ...form,
                          config: {
                            ...form.config,
                            visit_count_selection: {
                              enabled: e.target.checked,
                              required: form.config.visit_count_selection?.required || false,
                              options: form.config.visit_count_selection?.options || [
                                { value: 'first', label: '初回' },
                                { value: 'repeat', label: '2回目以降' }
                              ]
                            }
                          }
                        };
                        setForm(updatedForm);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">有効にする</span>
                  </label>
                </div>
                
                {form.config.visit_count_selection?.enabled && (
                  <div className="space-y-4 ml-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={form.config.visit_count_selection.required}
                        onChange={(e) => {
                          const updatedForm = {
                            ...form,
                            config: {
                              ...form.config,
                              visit_count_selection: {
                                ...form.config.visit_count_selection,
                                required: e.target.checked
                              }
                            }
                          };
                          setForm(updatedForm);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">必須項目にする</span>
                    </label>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        選択肢の設定
                      </label>
                      <div className="space-y-2">
                        {form.config.visit_count_selection.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) => {
                                const updatedOptions = [...form.config.visit_count_selection!.options];
                                updatedOptions[index] = { ...option, label: e.target.value };
                                const updatedForm = {
                                  ...form,
                                  config: {
                                    ...form.config,
                                    visit_count_selection: {
                                      ...form.config.visit_count_selection!,
                                      options: updatedOptions
                                    }
                                  }
                                };
                                setForm(updatedForm);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="選択肢のテキスト"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* クーポン利用有無設定 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">クーポン利用有無</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.config.coupon_selection?.enabled || false}
                      onChange={(e) => {
                        const updatedForm = {
                          ...form,
                          config: {
                            ...form.config,
                            coupon_selection: {
                              enabled: e.target.checked,
                              coupon_name: form.config.coupon_selection?.coupon_name || '',
                              options: form.config.coupon_selection?.options || [
                                { value: 'use', label: '利用する' },
                                { value: 'not_use', label: '利用しない' }
                              ]
                            }
                          }
                        };
                        setForm(updatedForm);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">有効にする</span>
                  </label>
                </div>
                
                {form.config.coupon_selection?.enabled && (
                  <div className="space-y-4 ml-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        クーポン名（任意）
                      </label>
                      <input
                        type="text"
                        value={form.config.coupon_selection.coupon_name || ''}
                        onChange={(e) => {
                          const updatedForm = {
                            ...form,
                            config: {
                              ...form.config,
                              coupon_selection: {
                                ...form.config.coupon_selection!,
                                coupon_name: e.target.value
                              }
                            }
                          };
                          setForm(updatedForm);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="例：2周年記念"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        設定すると「{form.config.coupon_selection.coupon_name || '[クーポン名]'}クーポン利用有無」として表示されます
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 保存状態表示 */}
      {saveStatus === 'saved' && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          保存しました
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          保存に失敗しました
        </div>
      )}
    </div>
  );
}
