'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Store } from '@/types/store';
import { Form } from '@/types/form';

export default function StoreAdminPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  
  const [store, setStore] = useState<Store | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 店舗情報取得
        const storeResponse = await fetch(`/api/stores/${storeId}`);
        if (!storeResponse.ok) {
          setError('店舗が見つかりません');
          return;
        }
        const storeData = await storeResponse.json();
        setStore(storeData);
        
        // フォーム一覧取得
        const formsResponse = await fetch(`/api/stores/${storeId}/forms`);
        if (formsResponse.ok) {
          const formsData = await formsResponse.json();
          setForms(formsData);
        }
        
      } catch (err) {
        console.error('Data fetch error:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchData();
    }
  }, [storeId]);

  const getFormStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getFormStatusText = (status: string) => {
    switch (status) {
      case 'active': return '公開中';
      case 'inactive': return '非公開';
      case 'paused': return '一時停止';
      default: return '不明';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-lg font-medium mb-4">
            {error || '店舗が見つかりません'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {store.name} - 管理ダッシュボード
              </h1>
              <p className="text-gray-600">
                フォーム管理・店舗設定
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">店舗ID: {store.id}</p>
              <p className="text-sm text-gray-500">オーナー: {store.owner_name}</p>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">フォーム数</h3>
            <div className="text-3xl font-bold text-blue-600 mb-1">{forms.length}</div>
            <p className="text-sm text-gray-600">作成済みフォーム</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">公開中</h3>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {forms.filter(f => f.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">アクティブフォーム</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">今月の予約</h3>
            <div className="text-3xl font-bold text-purple-600 mb-1">0</div>
            <p className="text-sm text-gray-600">※実装予定</p>
          </div>
        </div>

        {/* フォーム管理セクション */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">フォーム管理</h2>
            <div className="text-sm text-gray-500">
              ※ フォームの作成はサービス管理者が行います
            </div>
          </div>

          {/* フォーム一覧 */}
          <div className="space-y-4">
            {forms.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-lg font-medium mb-2">
                  まだフォームが作成されていません
                </div>
                <p className="text-sm mb-4">
                  サービス管理者にフォーム作成を依頼してください
                </p>
                <div className="text-xs text-gray-400">
                  フォームが作成されると、こちらで編集・管理できるようになります
                </div>
              </div>
            ) : (
              forms.map((form) => (
                <div key={form.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {(form as any).form_name || form.config?.basic_info?.form_name || 'フォーム'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFormStatusColor(form.status)}`}>
                          {getFormStatusText(form.status)}
                        </span>
                        {form.draft_status === 'draft' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-orange-600 bg-orange-100">
                            下書きあり
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">フォームID:</span> {form.id}
                        </div>
                        <div>
                          <span className="font-medium">作成日:</span> {new Date(form.created_at).toLocaleDateString('ja-JP')}
                        </div>
                        <div>
                          <span className="font-medium">最終更新:</span> {new Date(form.updated_at).toLocaleDateString('ja-JP')}
                        </div>
                        <div>
                          <span className="font-medium">メニューカテゴリー:</span> {(form as any).menu_structure?.categories?.length || form.config?.menu_structure?.categories?.length || 0}個
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => router.push(`/${storeId}/forms/${form.id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => router.push(`/${storeId}/forms/${form.id}/preview`)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                      >
                        プレビュー
                      </button>
                      <button
                        onClick={() => window.open(`/form/${form.id}`, '_blank')}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                      >
                        本番URL
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 店舗設定 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">店舗設定</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">基本情報</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div><span className="font-medium">店舗名:</span> {store.name}</div>
                <div><span className="font-medium">オーナー:</span> {store.owner_name}</div>
                <div><span className="font-medium">メール:</span> {store.owner_email}</div>
                <div><span className="font-medium">電話:</span> {store.phone || '未設定'}</div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">設定メニュー</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  営業時間設定
                </button>
                <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  店舗情報編集
                </button>
                <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  通知設定
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
