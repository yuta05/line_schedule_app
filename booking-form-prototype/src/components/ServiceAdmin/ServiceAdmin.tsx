import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalStorageService } from '../../services/localStorageService';
import type { Store } from '../../types/store';
import type { Form } from '../../types/form';

interface ServiceAdminProps {
  // 将来的な拡張用
}

const ServiceAdmin: React.FC<ServiceAdminProps> = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [allForms, setAllForms] = useState<Form[]>([]);
  const [showAddStore, setShowAddStore] = useState(false);

  // 新しいStore用の状態
  const [newStore, setNewStore] = useState({
    name: '',
    owner_name: '',
    owner_email: '',
    phone: '',
    address: '',
    description: '',
    website_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storeData = LocalStorageService.getStores();
    const formData = LocalStorageService.getForms();
    setStores(storeData);
    setAllForms(formData);
  };

  const resetNewStore = () => {
    setNewStore({
      name: '',
      owner_name: '',
      owner_email: '',
      phone: '',
      address: '',
      description: '',
      website_url: ''
    });
  };

  const handleCreateStore = () => {
    if (!newStore.name || !newStore.owner_name || !newStore.owner_email) {
      alert('必須項目を入力してください（店舗名、オーナー名、メールアドレス）');
      return;
    }

    const store: Store = {
      id: LocalStorageService.generateStoreId(),
      name: newStore.name,
      owner_name: newStore.owner_name,
      owner_email: newStore.owner_email,
      phone: newStore.phone,
      address: newStore.address,
      description: newStore.description,
      website_url: newStore.website_url,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    LocalStorageService.saveStore(store);
    loadData();
    resetNewStore();
    setShowAddStore(false);
    alert(`店舗「${store.name}」を作成しました（ID: ${store.id}）`);
  };

  const handleDeleteStore = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (!store) return;

    const storeForms = allForms.filter(f => f.store_id === storeId);
    const confirmMessage = storeForms.length > 0 
      ? `店舗「${store.name}」と関連する${storeForms.length}個のフォームを削除しますか？`
      : `店舗「${store.name}」を削除しますか？`;
    
    if (confirm(confirmMessage)) {
      LocalStorageService.deleteStore(storeId);
      loadData();
      alert('削除しました');
    }
  };

  const getFormsByStore = (storeId: string) => {
    return allForms.filter(form => form.store_id === storeId);
  };

  const handleStoreClick = (storeId: string) => {
    navigate(`/admin/${storeId}`);
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
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s ease'
    },
    cardHover: {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
      marginBottom: '10px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>サービス管理者ページ</h1>
        <p style={styles.description}>
          店舗の管理を行います。店舗をクリックして詳細管理ページに移動できます。
        </p>
      </div>

      {/* 店舗管理セクション */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>店舗管理</h2>
        
        <button 
          style={styles.button}
          onClick={() => setShowAddStore(!showAddStore)}
        >
          {showAddStore ? 'キャンセル' : '+ 新しい店舗を追加'}
        </button>

        {showAddStore && (
          <div style={styles.card}>
            <h3>新しい店舗を追加</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>店舗名 *</label>
              <input
                type="text"
                style={styles.input}
                value={newStore.name}
                onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                placeholder="例：美容室B（大阪店）"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>オーナー名 *</label>
              <input
                type="text"
                style={styles.input}
                value={newStore.owner_name}
                onChange={(e) => setNewStore({...newStore, owner_name: e.target.value})}
                placeholder="例：佐藤花子"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>メールアドレス *</label>
              <input
                type="email"
                style={styles.input}
                value={newStore.owner_email}
                onChange={(e) => setNewStore({...newStore, owner_email: e.target.value})}
                placeholder="例：sato@example.com"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>電話番号</label>
              <input
                type="tel"
                style={styles.input}
                value={newStore.phone}
                onChange={(e) => setNewStore({...newStore, phone: e.target.value})}
                placeholder="例：06-1234-5678"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>住所</label>
              <input
                type="text"
                style={styles.input}
                value={newStore.address}
                onChange={(e) => setNewStore({...newStore, address: e.target.value})}
                placeholder="例：大阪府大阪市中央区1-2-3"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>ウェブサイトURL</label>
              <input
                type="url"
                style={styles.input}
                value={newStore.website_url}
                onChange={(e) => setNewStore({...newStore, website_url: e.target.value})}
                placeholder="例：https://beauty-b.example.com"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>店舗説明</label>
              <textarea
                style={styles.textarea}
                value={newStore.description}
                onChange={(e) => setNewStore({...newStore, description: e.target.value})}
                placeholder="店舗の特徴やサービス内容を入力してください"
              />
            </div>
            <button style={styles.button} onClick={handleCreateStore}>
              店舗を作成
            </button>
            <button style={styles.buttonSecondary} onClick={() => setShowAddStore(false)}>
              キャンセル
            </button>
          </div>
        )}

        {/* 店舗一覧 */}
        {stores.map(store => {
          const storeForms = getFormsByStore(store.id);
          return (
            <div 
              key={store.id} 
              style={styles.card}
              onClick={() => handleStoreClick(store.id)}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={styles.storeInfo}>
                <h3>{store.name} <span style={{color: '#666', fontSize: '14px'}}>({store.id})</span></h3>
                <p><strong>オーナー:</strong> {store.owner_name} ({store.owner_email})</p>
                {store.phone && <p><strong>電話:</strong> {store.phone}</p>}
                {store.address && <p><strong>住所:</strong> {store.address}</p>}
                {store.website_url && <p><strong>サイト:</strong> <a href={store.website_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>{store.website_url}</a></p>}
                {store.description && <p><strong>説明:</strong> {store.description}</p>}
                <p><strong>フォーム数:</strong> {storeForms.length}個</p>
                <p style={{color: '#666', fontSize: '12px'}}>クリックして詳細管理ページへ</p>
              </div>

              <div style={{display: 'flex', gap: '10px'}} onClick={(e) => e.stopPropagation()}>
                <button 
                  style={styles.buttonDanger}
                  onClick={() => handleDeleteStore(store.id)}
                >
                  店舗を削除
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceAdmin;
