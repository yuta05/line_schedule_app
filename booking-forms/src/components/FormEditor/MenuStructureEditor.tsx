'use client';

import React, { useState } from 'react';
import { Form, MenuCategory, MenuItem, MenuOption, SubMenuItem } from '@/types/form';

interface MenuStructureEditorProps {
  form: Form;
  onUpdate: (form: Form) => void;
}

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (menuItem: MenuItem) => void;
  menuItem?: MenuItem;
  categoryId: string;
  genderEnabled: boolean;  // 性別機能が有効かどうか
}

interface MenuOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (option: MenuOption) => void;
  option?: MenuOption;
}

interface SubMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subMenuItem: SubMenuItem) => void;
  subMenuItem?: SubMenuItem;
}

const SubMenuItemModal: React.FC<SubMenuItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subMenuItem
}) => {
  const [name, setName] = useState(subMenuItem?.name || '');
  const [price, setPrice] = useState(subMenuItem?.price.toString() || '');
  const [duration, setDuration] = useState(subMenuItem?.duration.toString() || '');
  const [description, setDescription] = useState(subMenuItem?.description || '');
  const [image, setImage] = useState(subMenuItem?.image || '');

  React.useEffect(() => {
    if (subMenuItem) {
      setName(subMenuItem.name);
      setPrice(subMenuItem.price.toString());
      setDuration(subMenuItem.duration.toString());
      setDescription(subMenuItem.description || '');
      setImage(subMenuItem.image || '');
    } else {
      setName('');
      setPrice('');
      setDuration('');
      setDescription('');
      setImage('');
    }
  }, [subMenuItem]);

  const handleSave = () => {
    const newSubMenuItem: SubMenuItem = {
      id: subMenuItem?.id || `submenu_${Date.now()}`,
      name,
      price: parseInt(price) || 0,
      duration: parseInt(duration) || 0,
      description: description || undefined,
      image: image || undefined
    };
    onSave(newSubMenuItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {subMenuItem ? 'サブメニュー編集' : '新規サブメニュー追加'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                サブメニュー名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  料金（円）
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所要時間（分）
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明（オプション）
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                画像URL（オプション）
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                サブメニューの詳細表示で使用される画像のURLを入力してください
              </p>
              {image && (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={image} 
                    alt="プレビュー" 
                    className="w-32 h-32 object-cover rounded-md border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuOptionModal: React.FC<MenuOptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  option
}) => {
  const [name, setName] = useState(option?.name || '');
  const [price, setPrice] = useState(option?.price.toString() || '');
  const [duration, setDuration] = useState(option?.duration.toString() || '');
  const [description, setDescription] = useState(option?.description || '');
  const [isDefault, setIsDefault] = useState(option?.is_default || false);

  React.useEffect(() => {
    if (option) {
      setName(option.name);
      setPrice(option.price.toString());
      setDuration(option.duration.toString());
      setDescription(option.description || '');
      setIsDefault(option.is_default || false);
    } else {
      setName('');
      setPrice('');
      setDuration('');
      setDescription('');
      setIsDefault(false);
    }
  }, [option]);

  const handleSave = () => {
    const newOption: MenuOption = {
      id: option?.id || `option_${Date.now()}`,
      name,
      price: parseInt(price) || 0,
      duration: parseInt(duration) || 0,
      description: description || undefined,
      is_default: isDefault
    };
    onSave(newOption);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {option ? 'オプション編集' : '新規オプション追加'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                オプション名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  追加料金（円）
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  追加時間（分）
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明（オプション）
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_default"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                デフォルトで選択する
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  menuItem,
  categoryId,
  genderEnabled
}) => {
  const [name, setName] = useState(menuItem?.name || '');
  const [price, setPrice] = useState(menuItem?.price?.toString() || '');
  const [duration, setDuration] = useState(menuItem?.duration?.toString() || '');
  const [description, setDescription] = useState(menuItem?.description || '');
  const [image, setImage] = useState(menuItem?.image || '');
  const [genderFilter, setGenderFilter] = useState<'male' | 'female' | 'both'>(menuItem?.gender_filter || 'both');
  const [options, setOptions] = useState<MenuOption[]>(menuItem?.options || []);
  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<MenuOption | undefined>();
  const [hasSubmenu, setHasSubmenu] = useState(menuItem?.has_submenu || false);
  const [subMenuItems, setSubMenuItems] = useState<SubMenuItem[]>(menuItem?.sub_menu_items || []);
  const [subMenuModalOpen, setSubMenuModalOpen] = useState(false);
  const [selectedSubMenuItem, setSelectedSubMenuItem] = useState<SubMenuItem | undefined>();

  React.useEffect(() => {
    if (menuItem) {
      setName(menuItem.name);
      setPrice(menuItem.price?.toString() || '');
      setDuration(menuItem.duration?.toString() || '');
      setDescription(menuItem.description || '');
      setImage(menuItem.image || '');
      setGenderFilter(menuItem.gender_filter || 'both');
      setOptions(menuItem.options || []);
      setHasSubmenu(menuItem.has_submenu || false);
      setSubMenuItems(menuItem.sub_menu_items || []);
    } else {
      setName('');
      setPrice('');
      setDuration('');
      setDescription('');
      setImage('');
      setGenderFilter('both');
      setOptions([]);
      setHasSubmenu(false);
      setSubMenuItems([]);
    }
  }, [menuItem]);

  const handleSave = () => {
    const newMenuItem: MenuItem = {
      id: menuItem?.id || `menu_${Date.now()}`,
      name,
      price: hasSubmenu ? undefined : (parseInt(price) || 0),
      duration: hasSubmenu ? undefined : (parseInt(duration) || 0),
      description: description || undefined,
      image: image || undefined,
      category_id: categoryId,
      gender_filter: genderEnabled ? genderFilter : undefined,
      options: hasSubmenu ? undefined : (options.length > 0 ? options : undefined),
      has_submenu: hasSubmenu,
      sub_menu_items: hasSubmenu ? subMenuItems : undefined
    };
    onSave(newMenuItem);
    onClose();
  };

  const handleAddSubMenuItem = () => {
    setSelectedSubMenuItem(undefined);
    setSubMenuModalOpen(true);
  };

  const handleEditSubMenuItem = (subMenuItem: SubMenuItem) => {
    setSelectedSubMenuItem(subMenuItem);
    setSubMenuModalOpen(true);
  };

  const handleSaveSubMenuItem = (subMenuItem: SubMenuItem) => {
    if (selectedSubMenuItem?.id) {
      setSubMenuItems(prev => prev.map(item => item.id === selectedSubMenuItem.id ? subMenuItem : item));
    } else {
      setSubMenuItems(prev => [...prev, subMenuItem]);
    }
  };

  const handleDeleteSubMenuItem = (subMenuItemId: string) => {
    if (window.confirm('このサブメニューを削除しますか？')) {
      setSubMenuItems(prev => prev.filter(item => item.id !== subMenuItemId));
    }
  };

  const handleAddOption = () => {
    setSelectedOption(undefined);
    setOptionModalOpen(true);
  };

  const handleEditOption = (option: MenuOption) => {
    setSelectedOption(option);
    setOptionModalOpen(true);
  };

  const handleSaveOption = (option: MenuOption) => {
    if (selectedOption?.id) {
      setOptions(prev => prev.map(opt => opt.id === selectedOption.id ? option : opt));
    } else {
      setOptions(prev => [...prev, option]);
    }
  };

  const handleDeleteOption = (optionId: string) => {
    if (window.confirm('このオプションを削除しますか？')) {
      setOptions(prev => prev.filter(opt => opt.id !== optionId));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {menuItem ? 'メニュー編集' : '新規メニュー追加'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

                        <div className="space-y-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b pb-2">基本情報</h4>
                
                {/* サブメニューのOn/Offトグル */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="has_submenu"
                      checked={hasSubmenu}
                      onChange={(e) => setHasSubmenu(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="has_submenu" className="ml-2 block text-sm font-medium text-gray-900">
                      サブメニューを使用する
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    有効にすると、このメニュー内に複数の選択肢を作成できます
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メニュー名
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {!hasSubmenu && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          料金（円）
                        </label>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          所要時間（分）
                        </label>
                        <input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明（オプション）
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 画像URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    画像URL（オプション）
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    メニューの詳細表示で使用される画像のURLを入力してください
                  </p>
                  {image && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={image} 
                        alt="プレビュー" 
                        className="w-32 h-32 object-cover rounded-md border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 性別フィルター */}
                {genderEnabled && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🧑‍🤝‍🧑 性別フィルター
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      このメニューを表示する対象を選択してください
                    </p>
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value as 'male' | 'female' | 'both')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="both">👫 全員に表示（デフォルト）</option>
                      <option value="male">👨 男性にのみ表示</option>
                      <option value="female">👩 女性にのみ表示</option>
                    </select>
                  </div>
                )}
              </div>

              {/* サブメニュー管理 */}
              {hasSubmenu && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">サブメニュー管理</h4>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      サブメニューを使用する場合、料金と時間はサブメニューで設定します
                    </p>
                    <button
                      onClick={handleAddSubMenuItem}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      サブメニュー追加
                    </button>
                  </div>

                  {subMenuItems.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center bg-gray-50 rounded-md">
                      まだサブメニューがありません
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {subMenuItems.map((subMenuItem, index) => (
                        <div key={subMenuItem.id || `submenu-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{subMenuItem.name}</h5>
                            <p className="text-sm text-gray-600">
                              ¥{subMenuItem.price.toLocaleString()} • {subMenuItem.duration}分
                            </p>
                            {subMenuItem.description && (
                              <p className="text-xs text-gray-500 mt-1">{subMenuItem.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditSubMenuItem(subMenuItem)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteSubMenuItem(subMenuItem.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* オプション設定 */}
              {!hasSubmenu && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2 flex-1">
                    メニューオプション
                  </h4>
                  <button
                    onClick={handleAddOption}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    オプション追加
                  </button>
                </div>

                {options.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center bg-gray-50 rounded-md">
                    まだオプションがありません
                  </p>
                ) : (
                  <div className="space-y-2">
                    {options.map((option) => (
                      <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-gray-900">{option.name}</h5>
                            {option.is_default && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                デフォルト
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            +¥{option.price.toLocaleString()} • +{option.duration}分
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditOption(option)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteOption(option.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>

      <MenuOptionModal
        isOpen={optionModalOpen}
        onClose={() => setOptionModalOpen(false)}
        onSave={handleSaveOption}
        option={selectedOption}
      />

      <SubMenuItemModal
        isOpen={subMenuModalOpen}
        onClose={() => setSubMenuModalOpen(false)}
        onSave={handleSaveSubMenuItem}
        subMenuItem={selectedSubMenuItem}
      />
    </>
  );
};

const MenuStructureEditor: React.FC<MenuStructureEditorProps> = ({ form, onUpdate }) => {
  // カテゴリーなしで直接メニューを管理
  const [menus, setMenus] = useState<MenuItem[]>(() => {
    // 既存のカテゴリー構造からメニューを抽出
    const allMenus: MenuItem[] = [];
    
    // 新旧フォーム形式に対応
    const menuStructure = (form as any).menu_structure || form.config?.menu_structure;
    if (menuStructure?.categories) {
      menuStructure.categories.forEach((category: any) => {
        if (category.menus) {
          allMenus.push(...category.menus);
        }
      });
    }
    
    return allMenus;
  });
  
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | undefined>();

  const handleAddMenuItem = () => {
    setSelectedMenuItem(undefined);
    setMenuModalOpen(true);
  };

  const handleEditMenuItem = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setMenuModalOpen(true);
  };

  const handleSaveMenuItem = (menuItem: MenuItem) => {
    const updatedMenus = selectedMenuItem?.id
      ? menus.map(menu => menu.id === selectedMenuItem.id ? menuItem : menu)
      : [...menus, menuItem];
    
    setMenus(updatedMenus);
    updateForm(updatedMenus);
  };

  const handleDeleteMenuItem = (menuItemId: string) => {
    if (window.confirm('このメニューを削除しますか？')) {
      const updatedMenus = menus.filter(menu => menu.id !== menuItemId);
      setMenus(updatedMenus);
      updateForm(updatedMenus);
    }
  };

  const updateForm = (updatedMenus: MenuItem[]) => {
    // カテゴリーなしの構造として保存するため、デフォルトカテゴリーを作成
    const defaultCategory: MenuCategory = {
      id: 'default',
      name: 'メニュー',
      display_name: 'メニュー',
      menus: updatedMenus,
      options: [],
      selection_mode: 'single',
      gender_condition: 'all'
    };

    let updatedForm;
    
    if ((form as any).form_name && !form.config) {
      // 新しい簡易フォーム形式の場合
      updatedForm = {
        ...form,
        menu_structure: {
          ...(form as any).menu_structure,
          categories: [defaultCategory]
        }
      } as any;
    } else {
      // 従来のconfig形式の場合
      updatedForm = {
        ...form,
        config: {
          ...form.config,
          menu_structure: {
            ...form.config.menu_structure,
            categories: [defaultCategory]
          }
        }
      };
    }
    onUpdate(updatedForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900">メニュー管理</h2>
        </div>
        <button
          onClick={handleAddMenuItem}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>メニュー追加</span>
        </button>
      </div>

      {/* 性別選択機能設定 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              🧑‍🤝‍🧑 性別選択機能
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              お客様に性別を選択してもらい、メニューを性別で絞り込む
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.config.gender_selection?.enabled || false}
              onChange={(e) => {
                const updatedForm = {
                  ...form,
                  config: {
                    ...form.config,
                    gender_selection: {
                      enabled: e.target.checked,
                      required: form.config.gender_selection?.required || false,
                      options: form.config.gender_selection?.options || [
                        { value: 'male', label: '男性' },
                        { value: 'female', label: '女性' }
                      ]
                    }
                  }
                };
                onUpdate(updatedForm);
              }}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${
              form.config.gender_selection?.enabled 
                ? 'bg-blue-600' 
                : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                form.config.gender_selection?.enabled 
                  ? 'translate-x-5' 
                  : 'translate-x-0'
              } mt-0.5 ml-0.5`}></div>
            </div>
          </label>
        </div>
        
        {form.config.gender_selection?.enabled && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={form.config.gender_selection.required}
                onChange={(e) => {
                  const updatedForm = {
                    ...form,
                    config: {
                      ...form.config,
                      gender_selection: {
                        ...form.config.gender_selection,
                        required: e.target.checked
                      }
                    }
                  };
                  onUpdate(updatedForm);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
              />
              <span className="text-gray-700">性別選択を必須にする</span>
            </label>
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
              ✅ メニュー編集時に「性別フィルター」設定が表示されます
            </div>
          </div>
        )}
      </div>

      {/* 前回と同じメニューで予約する設定 */}
      <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <span className="text-purple-600 mr-2">🔁</span>
              前回と同じメニューで予約するボタン
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              フォーム上部に「前回と同じメニューで予約する」ボタンを表示
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.config.ui_settings?.show_repeat_booking || false}
              onChange={(e) => {
                const updatedForm = {
                  ...form,
                  config: {
                    ...form.config,
                    ui_settings: {
                      ...form.config.ui_settings,
                      show_repeat_booking: e.target.checked
                    }
                  }
                };
                onUpdate(updatedForm);
              }}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${
              form.config.ui_settings?.show_repeat_booking 
                ? 'bg-purple-600' 
                : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                form.config.ui_settings?.show_repeat_booking 
                  ? 'translate-x-5' 
                  : 'translate-x-0'
              } mt-0.5 ml-0.5`}></div>
            </div>
          </label>
        </div>
        
        {form.config.ui_settings?.show_repeat_booking && (
          <div className="mt-3 pt-3 border-t border-purple-200">
            <div className="p-2 bg-purple-100 border border-purple-300 rounded text-xs text-purple-700">
              ✅ お客様が以前選択したメニューを自動で復元できます
            </div>
          </div>
        )}
      </div>

      {menus.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">まだメニューがありません</h3>
          <p className="text-gray-500 mb-4">「メニュー追加」ボタンから最初のメニューを作成してください</p>
        </div>
      ) : (
        <div className="space-y-4">
          {menus.map((menu) => (
            <div key={menu.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h5 className="text-lg font-medium text-gray-900">{menu.name}</h5>
                  {menu.gender_filter && menu.gender_filter !== 'both' && (
                    <span className={`px-2 py-1 text-xs rounded ${
                      menu.gender_filter === 'male' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-pink-100 text-pink-800'
                    }`}>
                      {menu.gender_filter === 'male' ? '男性専用' : '女性専用'}
                    </span>
                  )}
                  {menu.sub_menu_items && menu.sub_menu_items.length > 0 && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      {menu.sub_menu_items.length}サブメニュー
                    </span>
                  )}
                  {menu.options && menu.options.length > 0 && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                      {menu.options.length}オプション
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {menu.has_submenu && menu.sub_menu_items && menu.sub_menu_items.length > 0 ? (
                    // サブメニューがある場合は価格範囲を表示
                    (() => {
                      const prices = menu.sub_menu_items.map(sub => sub.price).filter(p => p > 0);
                      const durations = menu.sub_menu_items.map(sub => sub.duration).filter(d => d > 0);
                      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                      const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
                      const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
                      
                      let priceText = '';
                      if (minPrice > 0 && maxPrice > 0) {
                        priceText = minPrice === maxPrice ? `¥${minPrice.toLocaleString()}` : `¥${minPrice.toLocaleString()}～¥${maxPrice.toLocaleString()}`;
                      }
                      
                      let durationText = '';
                      if (minDuration > 0 && maxDuration > 0) {
                        durationText = minDuration === maxDuration ? `${minDuration}分` : `${minDuration}～${maxDuration}分`;
                      }
                      
                      return [priceText, durationText].filter(Boolean).join(' • ');
                    })()
                  ) : (
                    `${menu.price ? `¥${menu.price.toLocaleString()}` : '価格未設定'} • ${menu.duration || 0}分`
                  )}
                </p>
                {menu.description && (
                  <p className="text-sm text-gray-500 mb-2">{menu.description}</p>
                )}
                {menu.sub_menu_items && menu.sub_menu_items.length > 0 && (
                  <div className="text-xs text-gray-500 mb-1">
                    サブメニュー: {menu.sub_menu_items.map(sub => sub.name).join(', ')}
                  </div>
                )}
                {menu.options && menu.options.length > 0 && (
                  <div className="text-xs text-gray-500">
                    オプション: {menu.options.map(opt => opt.name).join(', ')}
                  </div>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEditMenuItem(menu)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteMenuItem(menu.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MenuItemModal
        isOpen={menuModalOpen}
        onClose={() => setMenuModalOpen(false)}
        onSave={handleSaveMenuItem}
        menuItem={selectedMenuItem}
        categoryId="default"
        genderEnabled={form.config.gender_selection?.enabled || false}
      />
    </div>
  );
};

export default MenuStructureEditor;
