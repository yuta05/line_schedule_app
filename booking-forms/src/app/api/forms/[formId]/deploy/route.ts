import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const body = await request.json();
    const { storeId } = body;

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // フォームデータを読み込み
    const formsPath = join(process.cwd(), 'data', `forms_${storeId}.json`);
    if (!existsSync(formsPath)) {
      return NextResponse.json(
        { error: 'Forms file not found' },
        { status: 404 }
      );
    }

    const formsData = JSON.parse(readFileSync(formsPath, 'utf8'));
    const form = formsData.find((f: { id: string; store_id: string }) => f.id === formId && f.store_id === storeId);

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // 静的HTMLを生成
    const staticHtml = generateStaticFormHTML(form);
    
    // 静的ファイルを保存
    const deployDir = join(process.cwd(), 'public', 'static-forms');
    if (!existsSync(deployDir)) {
      mkdirSync(deployDir, { recursive: true });
    }

    const htmlPath = join(deployDir, `${formId}.html`);
    writeFileSync(htmlPath, staticHtml, 'utf8');

    // デプロイ情報をフォームに記録
    const updatedForm = {
      ...form,
      static_deploy: {
        deployed_at: new Date().toISOString(),
        deploy_url: `/static-forms/${formId}.html`,
        status: 'deployed'
      }
    };

    const updatedForms = formsData.map((f: { id: string }) => 
      f.id === formId ? updatedForm : f
    );

    writeFileSync(formsPath, JSON.stringify(updatedForms, null, 2));

    return NextResponse.json({
      success: true,
      deployUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/static-forms/${formId}.html`,
      deployedAt: updatedForm.static_deploy.deployed_at
    });

  } catch (error) {
    console.error('Deploy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateStaticFormHTML(form: any): string {
        // --- メニュー選択・サブメニュー・オプションのHTML構造を追加 ---
        const menuHtml = form.config.menu_structure.categories.map((category: any) => `
            <div class="border border-gray-200 rounded-lg p-4 mb-4">
                <div class="font-semibold text-gray-700 mb-2">${category.name}</div>
                <div class="space-y-2">
                    ${(category.menus || []).map((menu: any) => `
                        <div class="space-y-3">
                            ${menu.has_submenu && menu.sub_menu_items && menu.sub_menu_items.length > 0 ? `
                                <button type="button" class="w-full flex items-center justify-between p-3 border-2 rounded-md font-medium transition-all duration-200">
                                    <div class="flex items-center">
                                        <span class="mr-2">▶</span>
                                        <div>
                                            <div class="text-left">${menu.name}</div>
                                            ${menu.description ? `<div class="text-sm opacity-70 text-left">${menu.description}</div>` : ''}
                                        </div>
                                    </div>
                                    <div class="text-sm opacity-70">サブメニューを選択</div>
                                </button>
                                <div class="ml-6 mt-3 space-y-2 border-l-2 border-blue-200 pl-4">
                                    <div class="text-sm font-medium text-gray-700 mb-3">サブメニューを選択してください</div>
                                    ${(menu.sub_menu_items || []).map((subMenu: any) => `
                                        <button type="button" class="w-full flex items-center justify-between p-3 border-2 rounded-md font-medium transition-all duration-200">
                                            <div>
                                                <div class="text-left">${subMenu.name}</div>
                                                ${subMenu.description ? `<div class="text-sm opacity-70 text-left">${subMenu.description}</div>` : ''}
                                            </div>
                                            <div class="text-right ml-4">
                                                ${form.config.menu_structure.display_options.show_price ? `<div class="font-semibold">¥${subMenu.price?.toLocaleString()}</div>` : ''}
                                                ${form.config.menu_structure.display_options.show_duration ? `<div class="text-sm opacity-70">${subMenu.duration}分</div>` : ''}
                                            </div>
                                        </button>
                                    `).join('')}
                                </div>
                            ` : `
                                <button type="button" class="w-full flex items-center justify-between p-3 border-2 rounded-md font-medium transition-all duration-200">
                                    <div>
                                        <div class="text-left">${menu.name}</div>
                                        ${menu.description ? `<div class="text-sm opacity-70 text-left">${menu.description}</div>` : ''}
                                    </div>
                                    <div class="text-right ml-4">
                                        ${form.config.menu_structure.display_options.show_price && menu.price !== undefined ? `<div class="font-semibold">¥${menu.price.toLocaleString()}</div>` : ''}
                                        ${form.config.menu_structure.display_options.show_duration && menu.duration !== undefined ? `<div class="text-sm opacity-70">${menu.duration}分</div>` : ''}
                                    </div>
                                </button>
                                ${(menu.options && menu.options.length > 0) ? `
                                    <div class="ml-6 pl-4 border-l-2 border-green-200 space-y-2">
                                        <div class="text-sm font-medium text-gray-700 mb-3">オプション</div>
                                        ${(menu.options || []).map((option: any) => `
                                            <button type="button" class="w-full flex items-center justify-between p-2 border-2 rounded-md text-sm font-medium transition-all duration-200">
                                                <div class="flex items-center">
                                                    <div>
                                                        <div class="text-left">
                                                            ${option.name}
                                                            ${option.is_default ? `<span class="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">おすすめ</span>` : ''}
                                                        </div>
                                                        ${option.description ? `<div class="text-xs opacity-70 text-left">${option.description}</div>` : ''}
                                                    </div>
                                                </div>
                                                <div class="text-right ml-2">
                                                    ${form.config.menu_structure.display_options.show_price ? `<div class="font-medium">${option.price > 0 ? `+¥${option.price.toLocaleString()}` : '無料'}</div>` : ''}
                                                    ${form.config.menu_structure.display_options.show_duration && option.duration > 0 ? `<div class="text-xs opacity-70">+${option.duration}分</div>` : ''}
                                                </div>
                                            </button>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            `}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        // --- フォーム本体にメニューHTMLを挿入 ---
        return `<!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${form.config.basic_info.form_name}</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f9fafb; color: #333; }
            .max-w-2xl { max-width: 672px; margin: 0 auto; }
            .rounded-lg { border-radius: 0.5rem; }
            .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
            .p-6 { padding: 1.5rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .text-2xl { font-size: 1.5rem; font-weight: bold; }
            .text-lg { font-size: 1.125rem; font-weight: 600; }
            .text-sm { font-size: 0.875rem; }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .text-gray-700 { color: #374151; }
            .text-gray-600 { color: #4b5563; }
            .bg-white { background: #fff; }
            .bg-blue-50 { background: #eff6ff; }
            .bg-gray-50 { background: #f9fafb; }
            .border { border: 1px solid #e5e7eb; }
            .w-full { width: 100%; }
            .mb-4 { margin-bottom: 1rem; }
            .btn { padding: 0.75rem 1.5rem; border-radius: 0.375rem; border: none; background: #2563eb; color: #fff; font-weight: 500; cursor: pointer; }
            .btn:disabled { opacity: 0.5; }
            .calendar-container { margin-bottom: 20px; }
            .calendar { border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden; background: #fff; }
            .calendar th, .calendar td { font-size: 12px; text-align: center; padding: 4px; border: 2px solid #696969; }
            .calendar td.selected { background: #13ca5e; color: #fff; }
            .calendar td { cursor: pointer; }
            .calendar td.unavailable { background: #f3f4f6; color: #bbb; cursor: not-allowed; }
            .calendar td.available:hover { background: #e0f2fe; }
            .form-section { margin-bottom: 2rem; }
            .flex { display: flex; gap: 1rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .border-l-2 { border-left: 2px solid #13ca5e; }
            .pl-4 { padding-left: 1rem; }
            .ml-4 { margin-left: 1rem; }
            .mt-1 { margin-top: 0.25rem; }
            .rounded-md { border-radius: 0.375rem; }
            .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .text-blue-700 { color: #2563eb; }
            .text-green-700 { color: #059669; }
            .border-blue-500 { border-color: #2563eb; }
            .border-green-500 { border-color: #059669; }
            .bg-blue-50 { background: #eff6ff; }
            .bg-green-50 { background: #f0fdf4; }
            .hover\:bg-gray-50:hover { background: #f9fafb; }
            .hover\:bg-blue-700:hover { background: #1d4ed8; }
            .hover\:bg-gray-800:hover { background: #1f2937; }
            .text-red-500 { color: #ef4444; }
            .opacity-70 { opacity: 0.7; }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .hidden { display: none; }
        </style>
    </head>
    <body>
        <div class="max-w-2xl mx-auto">
            <!-- ヘッダー -->
            <div class="rounded-lg shadow-sm p-6 mb-6 text-white" style="background:${form.config.basic_info.theme_color}">
                <h1 class="text-2xl font-bold mb-2">${form.config.basic_info.form_name}</h1>
                <p class="opacity-90">${form.config.basic_info.store_name || 'ご予約フォーム'}</p>
            </div>
            <!-- フォーム本体 -->
            <form id="bookingForm" class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-6">ご予約内容</h2>
                        <!-- 基本情報 -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">お名前 <span class="text-red-500">*</span></label>
                            <input type="text" name="name" id="name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">電話番号 <span class="text-red-500">*</span></label>
                            <input type="tel" name="phone" id="phone" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <!-- 性別選択 -->
                        ${form.config.gender_selection.enabled ? `
                            <div class="mb-6">
                                <label class="block text-sm font-medium text-gray-700 mb-2">性別${form.config.gender_selection.required ? ' <span class=\"text-red-500\">*</span>' : ''}</label>
                                <div class="flex space-x-4">
                                    ${form.config.gender_selection.options.map((option: any, optionIndex: number) => `
                                        <button type="button" class="flex-1 py-3 px-4 border-2 rounded-md font-medium transition-all duration-200" id="genderBtn${optionIndex}" data-value="${option.value}">${option.label}</button>
                                    `).join('')}
                                </div>
                                <input type="hidden" name="gender" id="gender" />
                            </div>
                        ` : ''}
                        <!-- ご来店回数選択 -->
                        ${form.config.visit_count_selection?.enabled ? `
                            <div class="mb-6">
                                <label class="block text-sm font-medium text-gray-700 mb-2">ご来店回数${form.config.visit_count_selection.required ? ' <span class=\"text-red-500\">*</span>' : ''}</label>
                                <div class="flex space-x-4">
                                    ${form.config.visit_count_selection.options.map((option: any, optionIndex: number) => `
                                        <button type="button" class="flex-1 py-3 px-4 border-2 rounded-md font-medium transition-all duration-200" id="visitBtn${optionIndex}" data-value="${option.value}">${option.label}</button>
                                    `).join('')}
                                </div>
                                <input type="hidden" name="visitCount" id="visitCount" />
                            </div>
                        ` : ''}
                        <!-- クーポン利用有無選択 -->
                        ${form.config.coupon_selection?.enabled ? `
                            <div class="mb-6">
                                <label class="block text-sm font-medium text-gray-700 mb-2">${form.config.coupon_selection.coupon_name ? `${form.config.coupon_selection.coupon_name}クーポン利用有無` : 'クーポン利用有無'}</label>
                                <div class="flex space-x-4">
                                    ${form.config.coupon_selection.options.map((option: any, optionIndex: number) => `
                                        <button type="button" class="flex-1 py-3 px-4 border-2 rounded-md font-medium transition-all duration-200" id="couponBtn${optionIndex}" data-value="${option.value}">${option.label}</button>
                                    `).join('')}
                                </div>
                                <input type="hidden" name="couponUsage" id="couponUsage" />
                            </div>
                        ` : ''}
                        <!-- メニュー選択 -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">メニューをお選びください</label>
                            <div class="space-y-4">
                                ${menuHtml}
                            </div>
                        </div>
                        <!-- カレンダー（希望日時選択） -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">希望日時 <span class="text-red-500">*</span></label>
                            <div class="text-sm text-gray-600 mb-3">※メニューを選択すると空き状況のカレンダーが表示されます</div>
                            <div class="calendar-container">
                                <div class="current-month-container mb-4">
                                    <span class="current-month text-lg font-bold text-gray-700" id="currentMonth"></span>
                                </div>
                                <div class="month-button-container mb-3">
                                    <button type="button" class="month-button px-5 py-2 bg-gray-700 text-white border-none rounded cursor-pointer hover:bg-gray-800" id="prevMonthBtn">前月</button>
                                    <button type="button" class="month-button px-5 py-2 bg-gray-700 text-white border-none rounded cursor-pointer hover:bg-gray-800" id="nextMonthBtn">翌月</button>
                                </div>
                                <div class="week-button-container mb-3">
                                    <button type="button" class="week-button px-5 py-2 bg-gray-700 text-white border-none rounded cursor-pointer hover:bg-gray-800" id="prevWeekBtn">前週</button>
                                    <button type="button" class="week-button px-5 py-2 bg-gray-700 text-white border-none rounded cursor-pointer hover:bg-gray-800" id="nextWeekBtn">翌週</button>
                                </div>
                                <div class="calendar bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
                                    <table class="w-full border-collapse" id="calendarTable">
                                        <thead>
                                            <tr>
                                                <th class="text-center p-2 bg-gray-100 border border-gray-400 text-xs">時間</th>
                                                <!-- 日付ヘッダーはJSで生成 -->
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <!-- 時間帯ごとの行はJSで生成 -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                                            <!-- 予約内容確認（モーダル） -->
                                            <div id="confirmationModal" class="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 hidden">
                                                <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
                                                    <div class="p-6">
                                                        <h3 class="text-lg font-semibold text-gray-900 mb-4">予約内容をご確認ください</h3>
                                                        <div class="space-y-3 mb-6" id="confirmationDetails">
                                                            <!-- JSで内容を動的生成 -->
                                                        </div>
                                                        <div class="flex space-x-3">
                                                            <button type="button" id="editButton" class="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">修正する</button>
                                                            <button type="button" id="confirmSubmitButton" class="flex-1 px-4 py-2 rounded-md text-white font-medium" style="background:${form.config.basic_info.theme_color}">予約確定</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- 予約完了画面 -->
                                            <div id="completeScreen" class="min-h-screen bg-gray-50 py-8 px-4 hidden">
                                                <div class="max-w-2xl mx-auto">
                                                    <div class="bg-white rounded-lg shadow-sm p-8 text-center">
                                                        <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                                            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                        <h1 class="text-2xl font-bold text-gray-900 mb-4">ご予約を承りました</h1>
                                                        <p class="text-gray-600 mb-6">この度はご予約いただき、ありがとうございます。<br />確認のご連絡を順次お送りいたします。</p>
                                                        <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left" id="completeDetails">
                                                            <!-- JSで内容を動的生成 -->
                                                        </div>
                                                        <button type="button" id="newBookingButton" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">新しい予約をする</button>
                                                    </div>
                                                </div>
                                            </div>
            </form>
                <script>
                    // --- 状態管理用変数 ---
                    let formState = {
                        name: '',
                        phone: '',
                        gender: '',
                        visitCount: '',
                        couponUsage: '',
                        selectedMenus: {},
                        selectedSubMenus: {},
                        selectedMenuOptions: {},
                        selectedDate: '',
                        selectedTime: ''
                    };

                    // --- イベントリスナー登録 ---
                    document.addEventListener('DOMContentLoaded', function() {
                        // 基本情報入力
                        document.getElementById('name').addEventListener('input', e => { formState.name = e.target.value; });
                        document.getElementById('phone').addEventListener('input', e => { formState.phone = e.target.value; });
                        // 性別選択
                        Array.from(document.querySelectorAll('[id^="genderBtn"]')).forEach(btn => {
                            btn.addEventListener('click', function() {
                                formState.gender = btn.getAttribute('data-value');
                                Array.from(document.querySelectorAll('[id^="genderBtn"]')).forEach(b => b.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-700'));
                                btn.classList.add('border-blue-500', 'bg-blue-50', 'text-blue-700');
                            });
                        });
                        // 来店回数
                        Array.from(document.querySelectorAll('[id^="visitBtn"]')).forEach(btn => {
                            btn.addEventListener('click', function() {
                                formState.visitCount = btn.getAttribute('data-value');
                                Array.from(document.querySelectorAll('[id^="visitBtn"]')).forEach(b => b.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-700'));
                                btn.classList.add('border-blue-500', 'bg-blue-50', 'text-blue-700');
                            });
                        });
                        // クーポン
                        Array.from(document.querySelectorAll('[id^="couponBtn"]')).forEach(btn => {
                            btn.addEventListener('click', function() {
                                formState.couponUsage = btn.getAttribute('data-value');
                                Array.from(document.querySelectorAll('[id^="couponBtn"]')).forEach(b => b.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-700'));
                                btn.classList.add('border-blue-500', 'bg-blue-50', 'text-blue-700');
                            });
                        });
                        // 予約ボタン
                        document.getElementById('bookingForm').addEventListener('submit', function(e) {
                            e.preventDefault();
                            if (!validateForm()) return;
                            showConfirmationModal();
                        });
                        // 修正ボタン
                        document.getElementById('editButton').addEventListener('click', function() {
                            hideConfirmationModal();
                        });
                        // 予約確定ボタン
                        document.getElementById('confirmSubmitButton').addEventListener('click', function() {
                            showCompleteScreen();
                        });
                        // 新しい予約ボタン
                        document.getElementById('newBookingButton').addEventListener('click', function() {
                            resetForm();
                        });
                    });

                    // --- バリデーション ---
                    function validateForm() {
                        if (!formState.name.trim()) { alert('お名前を入力してください'); return false; }
                        if (!formState.phone.trim()) { alert('電話番号を入力してください'); return false; }
                        // 必須項目
                        if (${form.config.gender_selection.enabled && form.config.gender_selection.required ? 'true' : 'false'} && !formState.gender) { alert('性別を選択してください'); return false; }
                        if (${form.config.visit_count_selection?.enabled && form.config.visit_count_selection.required ? 'true' : 'false'} && !formState.visitCount) { alert('ご来店回数を選択してください'); return false; }
                        if (${form.config.coupon_selection?.enabled && form.config.coupon_selection.required ? 'true' : 'false'} && !formState.couponUsage) { alert('クーポン利用有無を選択してください'); return false; }
                        // 日時
                        if (!formState.selectedDate) { alert('ご希望日を選択してください'); return false; }
                        if (!formState.selectedTime) { alert('ご希望時間を選択してください'); return false; }
                        return true;
                    }

                    // --- 予約内容確認モーダル表示 ---
                    function showConfirmationModal() {
                        document.getElementById('confirmationModal').classList.remove('hidden');
                        // 内容をJSで生成
                        const details = document.getElementById('confirmationDetails');
                        details.innerHTML = `
                            <div class="flex justify-between"><span class="text-gray-600">お名前</span><span class="font-medium">${formState.name}</span></div>
                            <div class="flex justify-between"><span class="text-gray-600">電話番号</span><span class="font-medium">${formState.phone}</span></div>
                            ${formState.gender ? `<div class=\"flex justify-between\"><span class=\"text-gray-600\">性別</span><span class=\"font-medium\">${formState.gender}</span></div>` : ''}
                            ${formState.visitCount ? `<div class=\"flex justify-between\"><span class=\"text-gray-600\">ご来店回数</span><span class=\"font-medium\">${formState.visitCount}</span></div>` : ''}
                            ${formState.couponUsage ? `<div class=\"flex justify-between\"><span class=\"text-gray-600\">クーポン</span><span class=\"font-medium\">${formState.couponUsage}</span></div>` : ''}
                            <div class="flex justify-between"><span class="text-gray-600">ご希望日時</span><span class="font-medium">${formState.selectedDate} ${formState.selectedTime}</span></div>
                        `;
                    }
                    function hideConfirmationModal() {
                        document.getElementById('confirmationModal').classList.add('hidden');
                    }

                    // --- 予約完了画面表示 ---
                    function showCompleteScreen() {
                        document.getElementById('confirmationModal').classList.add('hidden');
                        document.getElementById('completeScreen').classList.remove('hidden');
                        // 内容をJSで生成
                        const details = document.getElementById('completeDetails');
                        details.innerHTML = `
                            <div><span class="font-medium">お名前:</span> ${formState.name}</div>
                            <div><span class="font-medium">電話番号:</span> ${formState.phone}</div>
                            <div><span class="font-medium">ご希望日時:</span> ${formState.selectedDate} ${formState.selectedTime}</div>
                            ${formState.gender ? `<div><span class=\"font-medium\">性別:</span> ${formState.gender}</div>` : ''}
                            ${formState.visitCount ? `<div><span class=\"font-medium\">ご来店回数:</span> ${formState.visitCount}</div>` : ''}
                            ${formState.couponUsage ? `<div><span class=\"font-medium\">クーポン:</span> ${formState.couponUsage}</div>` : ''}
                        `;
                    }

                    // --- 新しい予約 ---
                    function resetForm() {
                        document.getElementById('completeScreen').classList.add('hidden');
                        document.getElementById('bookingForm').reset();
                        formState = { name: '', phone: '', gender: '', visitCount: '', couponUsage: '', selectedMenus: {}, selectedSubMenus: {}, selectedMenuOptions: {}, selectedDate: '', selectedTime: '' };
                        // 選択ボタンのスタイルリセット
                        Array.from(document.querySelectorAll('[id^="genderBtn"]')).forEach(b => b.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-700'));
                        Array.from(document.querySelectorAll('[id^="visitBtn"]')).forEach(b => b.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-700'));
                        Array.from(document.querySelectorAll('[id^="couponBtn"]')).forEach(b => b.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-700'));
                    }
                            // --- カレンダーUIロジック ---
            // --- メニュー選択ロジック ---
            document.addEventListener('DOMContentLoaded', function() {
                // メニュー選択
                Array.from(document.querySelectorAll('.border.border-gray-200.rounded-lg.p-4.mb-4')).forEach(categoryDiv => {
                    Array.from(categoryDiv.querySelectorAll('button')).forEach(menuBtn => {
                        menuBtn.addEventListener('click', function() {
                            // 通常メニュー or サブメニュー
                            const menuName = menuBtn.querySelector('.text-left')?.textContent;
                            const isSubMenu = menuBtn.parentElement.classList.contains('ml-6');
                            if (isSubMenu) {
                                // サブメニュー選択
                                Array.from(menuBtn.parentElement.querySelectorAll('button')).forEach(b => b.classList.remove('border-green-500','bg-green-50','text-green-700'));
                                menuBtn.classList.add('border-green-500','bg-green-50','text-green-700');
                                // formState.selectedSubMenusに反映（menuId, subMenuId）
                                const parentMenuDiv = menuBtn.closest('.space-y-3');
                                const menuId = parentMenuDiv?.querySelector('.text-left')?.textContent;
                                formState.selectedSubMenus[menuId] = menuName;
                            } else {
                                // 通常メニュー選択
                                menuBtn.classList.toggle('border-green-500');
                                menuBtn.classList.toggle('bg-green-50');
                                menuBtn.classList.toggle('text-green-700');
                                // formState.selectedMenusに反映
                                const categoryId = categoryDiv.querySelector('.font-semibold')?.textContent;
                                if (!formState.selectedMenus[categoryId]) formState.selectedMenus[categoryId] = [];
                                if (formState.selectedMenus[categoryId].includes(menuName)) {
                                    formState.selectedMenus[categoryId] = formState.selectedMenus[categoryId].filter(m => m !== menuName);
                                } else {
                                    formState.selectedMenus[categoryId].push(menuName);
                                }
                            }
                            // オプション選択
                            if (menuBtn.parentElement.classList.contains('space-y-2')) {
                                // オプションボタン
                                menuBtn.classList.toggle('border-blue-500');
                                menuBtn.classList.toggle('bg-blue-50');
                                menuBtn.classList.toggle('text-blue-700');
                                const menuId = menuBtn.closest('.space-y-3')?.querySelector('.text-left')?.textContent;
                                if (!formState.selectedMenuOptions[menuId]) formState.selectedMenuOptions[menuId] = [];
                                if (formState.selectedMenuOptions[menuId].includes(menuBtn.textContent.trim())) {
                                    formState.selectedMenuOptions[menuId] = formState.selectedMenuOptions[menuId].filter(o => o !== menuBtn.textContent.trim());
                                } else {
                                    formState.selectedMenuOptions[menuId].push(menuBtn.textContent.trim());
                                }
                            }
                            saveSelectionToStorage();
                        });
                    });
                });
                // ローカルストレージ復元
                loadSelectionFromStorage();
            });
            // --- ローカルストレージ保存/復元 ---
            function saveSelectionToStorage() {
                localStorage.setItem('bookingFormSelection', JSON.stringify({
                    selectedMenus: formState.selectedMenus,
                    selectedSubMenus: formState.selectedSubMenus,
                    selectedMenuOptions: formState.selectedMenuOptions,
                    gender: formState.gender,
                    visitCount: formState.visitCount,
                    couponUsage: formState.couponUsage,
                    timestamp: Date.now()
                }));
            }
            function loadSelectionFromStorage() {
                const saved = localStorage.getItem('bookingFormSelection');
                if (!saved) return;
                try {
                    const data = JSON.parse(saved);
                    formState.selectedMenus = data.selectedMenus || {};
                    formState.selectedSubMenus = data.selectedSubMenus || {};
                    formState.selectedMenuOptions = data.selectedMenuOptions || {};
                    formState.gender = data.gender || '';
                    formState.visitCount = data.visitCount || '';
                    formState.couponUsage = data.couponUsage || '';
                    // UI反映（選択ボタンのハイライト）
                    Object.entries(formState.selectedMenus).forEach(([categoryId, menuNames]) => {
                        Array.from(document.querySelectorAll('.border.border-gray-200.rounded-lg.p-4.mb-4')).forEach(categoryDiv => {
                            if (categoryDiv.querySelector('.font-semibold')?.textContent === categoryId) {
                                menuNames.forEach(menuName => {
                                    Array.from(categoryDiv.querySelectorAll('button')).forEach(menuBtn => {
                                        if (menuBtn.querySelector('.text-left')?.textContent === menuName) {
                                            menuBtn.classList.add('border-green-500','bg-green-50','text-green-700');
                                        }
                                    });
                                });
                            }
                        });
                    });
                    Object.entries(formState.selectedSubMenus).forEach(([menuId, subMenuName]) => {
                        Array.from(document.querySelectorAll('.ml-6.mt-3.space-y-2.border-l-2.border-blue-200.pl-4 button')).forEach(subBtn => {
                            if (subBtn.querySelector('.text-left')?.textContent === subMenuName) {
                                subBtn.classList.add('border-green-500','bg-green-50','text-green-700');
                            }
                        });
                    });
                    Object.entries(formState.selectedMenuOptions).forEach(([menuId, optionNames]) => {
                        optionNames.forEach(optionName => {
                            Array.from(document.querySelectorAll('.ml-6.pl-4.border-l-2.border-green-200.space-y-2 button')).forEach(optBtn => {
                                if (optBtn.textContent.trim() === optionName) {
                                    optBtn.classList.add('border-blue-500','bg-blue-50','text-blue-700');
                                }
                            });
                        });
                    });
                } catch (e) {}
            }
                            let currentWeekStart = getWeekStart(new Date());
                            function getWeekStart(date) {
                                const d = new Date(date);
                                const day = d.getDay();
                                const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                                return new Date(d.setDate(diff));
                            }
                            function getWeekDates(weekStart) {
                                const dates = [];
                                for (let i = 0; i < 7; i++) {
                                    const date = new Date(weekStart);
                                    date.setDate(weekStart.getDate() + i);
                                    dates.push(date);
                                }
                                return dates;
                            }
                            function renderCalendar() {
                                // 月表示
                                document.getElementById('currentMonth').textContent = currentWeekStart.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
                                // 日付ヘッダー
                                const weekDates = getWeekDates(currentWeekStart);
                                const thead = document.querySelector('#calendarTable thead tr');
                                // 既存ヘッダー削除
                                while (thead.children.length > 1) thead.removeChild(thead.lastChild);
                                weekDates.forEach((date, idx) => {
                                    const th = document.createElement('th');
                                    th.className = 'text-center p-2 bg-gray-100 border border-gray-400 text-xs';
                                    th.innerHTML = `${date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}<br>(${['日','月','火','水','木','金','土'][date.getDay()]})`;
                                    thead.appendChild(th);
                                });
                                // 時間帯行生成
                                const timeSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];
                                const tbody = document.querySelector('#calendarTable tbody');
                                tbody.innerHTML = '';
                                timeSlots.forEach(time => {
                                    const tr = document.createElement('tr');
                                    const tdTime = document.createElement('td');
                                    tdTime.className = 'text-center p-1 border border-gray-400 text-xs bg-gray-50 font-medium';
                                    tdTime.textContent = time;
                                    tr.appendChild(tdTime);
                                    weekDates.forEach((date, dateIdx) => {
                                        const td = document.createElement('td');
                                        td.className = 'text-center p-1 border border-gray-400 text-xs cursor-pointer';
                                        // 空き状況ロジック（ここでは全て○とする。必要に応じてAPI連携可）
                                        const now = new Date();
                                        const slotDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(time.split(':')[0]), parseInt(time.split(':')[1]));
                                        const isPast = now > slotDate;
                                        if (isPast) {
                                            td.classList.add('bg-gray-100','text-gray-400','cursor-not-allowed');
                                            td.textContent = '×';
                                        } else {
                                            td.classList.add('bg-white','hover:bg-gray-200');
                                            td.textContent = '○';
                                            td.addEventListener('click', function() {
                                                formState.selectedDate = date.toISOString().split('T')[0];
                                                formState.selectedTime = time;
                                                // 選択セルのハイライト
                                                Array.from(document.querySelectorAll('#calendarTable td.selected')).forEach(cell => cell.classList.remove('selected'));
                                                td.classList.add('selected');
                                            });
                                        }
                                        tr.appendChild(td);
                                    });
                                    tbody.appendChild(tr);
                                });
                            }
                            // 週/月移動
                            document.addEventListener('DOMContentLoaded', function() {
                                renderCalendar();
                                document.getElementById('prevWeekBtn').addEventListener('click', function() {
                                    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
                                    renderCalendar();
                                });
                                document.getElementById('nextWeekBtn').addEventListener('click', function() {
                                    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
                                    renderCalendar();
                                });
                                document.getElementById('prevMonthBtn').addEventListener('click', function() {
                                    currentWeekStart.setMonth(currentWeekStart.getMonth() - 1);
                                    currentWeekStart = getWeekStart(currentWeekStart);
                                    renderCalendar();
                                });
                                document.getElementById('nextMonthBtn').addEventListener('click', function() {
                                    currentWeekStart.setMonth(currentWeekStart.getMonth() + 1);
                                    currentWeekStart = getWeekStart(currentWeekStart);
                                    renderCalendar();
                                });
                            });
                </script>
        </div>
    </body>
    </html>
        
        .gender-btn {
            flex: 1;
            padding: 0.75rem;
            border: 2px solid #e5e7eb;
            border-radius: 0.5rem;
            background: white;
            color: #374151;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease-in-out;
        }
        
        .gender-btn.active {
            border-color: #2563eb;
            background-color: #eff6ff;
            color: #2563eb;
        }

        .booking-summary {
            background-color: #f0fdf4;
            border: 1px solid #d1fae5;
            border-radius: 0.5rem;
            padding: 1rem;
        }
        
        .summary-section {
            margin-bottom: 1rem;
        }
        
        .summary-section:last-child {
            margin-bottom: 0;
        }
        
        .summary-label {
            font-weight: 600;
            color: #065f46;
            margin-bottom: 0.25rem;
        }
        
        .summary-value {
            color: #047857;
        }

        .edit-btn {
            background: none;
            border: none;
            color: #2563eb;
            text-decoration: underline;
            cursor: pointer;
            font-size: 0.75rem;
            padding: 0;
            margin-left: 0.5rem;
        }
        
        .edit-btn:hover {
            color: #1d4ed8;
        }

        .repeat-booking-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
        }
        
        .repeat-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.15s ease-in-out;
            width: 100%;
        }
        
        .repeat-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .hidden {
            display: none;
        }

        .w-full {
            width: 100%;
        }

        .mt-4 {
            margin-top: 1rem;
        }

        .mb-2 {
            margin-bottom: 0.5rem;
        }

        .mb-3 {
            margin-bottom: 0.75rem;
        }

        .mb-4 {
            margin-bottom: 1rem;
        }

        .alert {
            padding: 0.75rem 1rem;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
        }
        
        .alert-success {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        
        .alert-error {
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #fca5a5;
        }

        @media (max-width: 640px) {
            .p-4 {
                padding: 0.75rem;
            }
            
            .grid-cols-2 {
                grid-template-columns: 1fr;
            }
            
            .gender-buttons {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="max-w-2xl mx-auto p-4 space-y-6">
        <div class="bg-white rounded-lg shadow-sm border p-4">
            <h1 class="text-2xl font-bold text-gray-700 mb-4">${form.form_name}</h1>
            
            ${form.ui_settings?.show_repeat_booking ? `
            <div class="repeat-booking-section">
                <h3 class="font-semibold mb-2">前回と同じ内容で予約</h3>
                <p class="text-sm mb-3 opacity-90">前回の予約内容を復元できます</p>
                <button class="repeat-btn" onclick="loadPreviousBooking()">
                    前回と同じメニューで予約する
                </button>
            </div>
            ` : ''}

            <form id="bookingForm" class="space-y-6">
                <div id="alert-container"></div>

                <!-- 基本情報 -->
                <div class="space-y-4">
                    <h2 class="text-lg font-semibold text-gray-700">基本情報</h2>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-2">お名前 *</label>
                        <input type="text" name="name" id="name" required 
                               placeholder="お名前を入力してください">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-2">お電話番号 *</label>
                        <input type="tel" name="phone" id="phone" required 
                               placeholder="090-0000-0000">
                    </div>

                    ${form.basic_info?.show_gender_selection ? `
                    <div id="genderSection">
                        <label class="block text-sm font-medium text-gray-600 mb-2">性別 *</label>
                        <div class="gender-buttons">
                            <button type="button" class="gender-btn" data-gender="male" onclick="selectGender('male')">
                                男性
                            </button>
                            <button type="button" class="gender-btn" data-gender="female" onclick="selectGender('female')">
                                女性
                            </button>
                        </div>
                        <input type="hidden" name="gender" id="gender" required>
                    </div>
                    ` : ''}
                </div>

                <!-- メニュー選択 -->
                <div id="menuSection" class="space-y-4">
                    <h2 class="text-lg font-semibold text-gray-700">
                        メニュー選択
                        <button type="button" class="edit-btn" onclick="scrollToSection('menuSection')" style="display: none;">編集</button>
                    </h2>
                    
                    <div id="menuContainer" class="space-y-4">
                        ${generateMenuHTML(form.menu_structure)}
                    </div>
                </div>

                <!-- 予約内容確認 -->
                <div id="bookingSummary" class="booking-summary hidden">
                    <h3 class="text-lg font-semibold text-green-600 mb-3">ご予約内容</h3>
                    
                    <div class="summary-section">
                        <div class="summary-label">
                            お名前
                            <button type="button" class="edit-btn" onclick="scrollToSection('name')">編集</button>
                        </div>
                        <div class="summary-value" id="summaryName"></div>
                    </div>
                    
                    <div class="summary-section">
                        <div class="summary-label">
                            お電話番号
                            <button type="button" class="edit-btn" onclick="scrollToSection('phone')">編集</button>
                        </div>
                        <div class="summary-value" id="summaryPhone"></div>
                    </div>
                    
                    ${form.basic_info?.show_gender_selection ? `
                    <div class="summary-section">
                        <div class="summary-label">
                            性別
                            <button type="button" class="edit-btn" onclick="scrollToSection('genderSection')">編集</button>
                        </div>
                        <div class="summary-value" id="summaryGender"></div>
                    </div>
                    ` : ''}
                    
                    <div class="summary-section">
                        <div class="summary-label">
                            選択メニュー
                            <button type="button" class="edit-btn" onclick="scrollToSection('menuSection')">編集</button>
                        </div>
                        <div class="summary-value" id="summaryMenus"></div>
                    </div>
                    
                    <div class="summary-section">
                        <div class="summary-label">合計金額</div>
                        <div class="summary-value text-lg font-bold" id="summaryTotal"></div>
                    </div>

                    <button type="submit" class="btn btn-primary w-full mt-4">
                        予約を確定する
                    </button>
                </div>

                <button type="button" id="confirmButton" class="btn btn-primary w-full" onclick="showBookingSummary()">
                    予約内容を確認する
                </button>
            </form>
        </div>
    </div>

    <script>
        // グローバル変数
        let selectedGender = '';
        let selectedMenus = [];
        let totalPrice = 0;
        const menuData = ${JSON.stringify(form.menu_structure)};
        const formSettings = ${JSON.stringify(form)};

        // LIFF初期化
        async function initializeLiff() {
            try {
                await liff.init({ liffId: '${form.line_settings?.liff_id || ''}' });
                console.log('LIFF initialized successfully');
            } catch (error) {
                console.error('LIFF initialization failed:', error);
            }
        }

        // ページ読み込み時の処理
        document.addEventListener('DOMContentLoaded', function() {
            initializeLiff();
            loadFormData();
            updateMenuDisplay();
            
            // フォーム変更の監視
            document.getElementById('bookingForm').addEventListener('change', saveFormData);
            document.getElementById('name').addEventListener('input', saveFormData);
            document.getElementById('phone').addEventListener('input', saveFormData);
        });

        // 性別選択
        function selectGender(gender) {
            selectedGender = gender;
            document.getElementById('gender').value = gender;
            
            // ボタンの見た目更新
            document.querySelectorAll('.gender-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(\`[data-gender="\${gender}"]\`).classList.add('active');
            
            updateMenuDisplay();
            saveFormData();
        }

        // メニュー表示更新
        function updateMenuDisplay() {
            const showGender = formSettings.basic_info?.show_gender_selection;
            const categories = menuData?.categories || [];
            
            categories.forEach(category => {
                const categoryElement = document.getElementById(\`category-\${category.id}\`);
                if (!categoryElement) return;

                if (showGender && selectedGender) {
                    // 性別が選択されている場合、対応するメニューのみ表示
                    const menus = category.menus || [];
                    menus.forEach(menu => {
                        const menuElement = document.getElementById(\`menu-\${menu.id}\`);
                        if (menuElement) {
                            const targetGenders = menu.target_gender || ['male', 'female'];
                            if (targetGenders.includes(selectedGender)) {
                                menuElement.style.display = 'block';
                            } else {
                                menuElement.style.display = 'none';
                                // 非表示になったメニューの選択を解除
                                const checkbox = menuElement.querySelector('input[type="checkbox"]');
                                if (checkbox && checkbox.checked) {
                                    checkbox.checked = false;
                                    onMenuChange(checkbox);
                                }
                            }
                        }
                    });
                } else {
                    // 性別選択がない場合は全て表示
                    const menus = category.menus || [];
                    menus.forEach(menu => {
                        const menuElement = document.getElementById(\`menu-\${menu.id}\`);
                        if (menuElement) {
                            menuElement.style.display = 'block';
                        }
                    });
                }
            });
        }

        // メニュー選択変更
        function onMenuChange(checkbox) {
            const menuId = checkbox.value;
            const menu = findMenuById(menuId);
            
            if (checkbox.checked) {
                selectedMenus.push(menu);
            } else {
                selectedMenus = selectedMenus.filter(m => m.id !== menuId);
            }
            
            updateTotalPrice();
            saveFormData();
            
            // チェックボックスの親要素のスタイル更新
            const wrapper = checkbox.closest('.checkbox-wrapper');
            if (checkbox.checked) {
                wrapper.classList.add('selected');
            } else {
                wrapper.classList.remove('selected');
            }
        }

        // メニューIDから検索
        function findMenuById(menuId) {
            const categories = menuData?.categories || [];
            for (const category of categories) {
                const menu = category.menus?.find(m => m.id === menuId);
                if (menu) return menu;
            }
            return null;
        }

        // 合計金額更新
        function updateTotalPrice() {
            totalPrice = selectedMenus.reduce((sum, menu) => sum + (menu.price || 0), 0);
        }

        // 予約内容確認表示
        function showBookingSummary() {
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            
            if (!name || !phone) {
                showAlert('お名前とお電話番号を入力してください。', 'error');
                return;
            }
            
            if (formSettings.basic_info?.show_gender_selection && !selectedGender) {
                showAlert('性別を選択してください。', 'error');
                return;
            }
            
            if (selectedMenus.length === 0) {
                showAlert('メニューを1つ以上選択してください。', 'error');
                return;
            }

            // サマリー情報更新
            document.getElementById('summaryName').textContent = name;
            document.getElementById('summaryPhone').textContent = phone;
            
            if (formSettings.basic_info?.show_gender_selection) {
                document.getElementById('summaryGender').textContent = selectedGender === 'male' ? '男性' : '女性';
            }
            
            const menuList = selectedMenus.map(menu => 
                \`\${menu.name} - \${menu.price?.toLocaleString()}円\`
            ).join('<br>');
            document.getElementById('summaryMenus').innerHTML = menuList;
            document.getElementById('summaryTotal').textContent = \`\${totalPrice.toLocaleString()}円\`;

            // 表示切り替え
            document.getElementById('bookingSummary').classList.remove('hidden');
            document.getElementById('confirmButton').style.display = 'none';
            
            // 編集ボタン表示
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.style.display = 'inline';
            });
        }

        // セクションにスクロール
        function scrollToSection(elementId) {
            document.getElementById(elementId).scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // サマリーを隠す
            document.getElementById('bookingSummary').classList.add('hidden');
            document.getElementById('confirmButton').style.display = 'block';
            
            // 編集ボタンを隠す
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.style.display = 'none';
            });
        }

        // フォームデータ保存
        function saveFormData() {
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                gender: selectedGender,
                selectedMenus: selectedMenus,
                totalPrice: totalPrice,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('bookingFormData_${form.id}', JSON.stringify(formData));
        }

        // フォームデータ読み込み
        function loadFormData() {
            const savedData = localStorage.getItem('bookingFormData_${form.id}');
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    document.getElementById('name').value = data.name || '';
                    document.getElementById('phone').value = data.phone || '';
                    
                    if (data.gender) {
                        selectGender(data.gender);
                    }
                    
                    if (data.selectedMenus) {
                        selectedMenus = data.selectedMenus;
                        selectedMenus.forEach(menu => {
                            const checkbox = document.querySelector(\`input[value="\${menu.id}"]\`);
                            if (checkbox) {
                                checkbox.checked = true;
                                checkbox.closest('.checkbox-wrapper').classList.add('selected');
                            }
                        });
                        updateTotalPrice();
                    }
                } catch (error) {
                    console.error('Failed to load form data:', error);
                }
            }
        }

        // 前回の予約を読み込み
        function loadPreviousBooking() {
            const savedData = localStorage.getItem('bookingFormData_${form.id}');
            if (savedData) {
                loadFormData();
                showAlert('前回の予約内容を復元しました。', 'success');
            } else {
                showAlert('前回の予約データが見つかりません。', 'error');
            }
        }

        // アラート表示
        function showAlert(message, type) {
            const alertContainer = document.getElementById('alert-container');
            const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
            
            alertContainer.innerHTML = \`
                <div class="alert \${alertClass}">
                    \${message}
                </div>
            \`;
            
            setTimeout(() => {
                alertContainer.innerHTML = '';
            }, 5000);
        }

        // フォーム送信
        document.getElementById('bookingForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = {
                    name: document.getElementById('name').value,
                    phone: document.getElementById('phone').value,
                    gender: selectedGender,
                    selectedMenus: selectedMenus,
                    totalPrice: totalPrice,
                    formId: '${form.id}',
                    timestamp: new Date().toISOString()
                };

                // LIFFでLINEにメッセージ送信
                if (liff.isInClient()) {
                    const message = \`予約が完了しました！\\n\\nお名前: \${formData.name}\\n電話番号: \${formData.phone}\${selectedGender ? \`\\n性別: \${selectedGender === 'male' ? '男性' : '女性'}\` : ''}\\n選択メニュー: \${selectedMenus.map(m => m.name).join(', ')}\\n合計金額: \${totalPrice.toLocaleString()}円\`;
                    
                    await liff.sendMessages([{
                        type: 'text',
                        text: message
                    }]);
                }

                showAlert('予約が完了しました！', 'success');
                
                // フォームリセット
                setTimeout(() => {
                    document.getElementById('bookingForm').reset();
                    selectedGender = '';
                    selectedMenus = [];
                    totalPrice = 0;
                    document.getElementById('bookingSummary').classList.add('hidden');
                    document.getElementById('confirmButton').style.display = 'block';
                    document.querySelectorAll('.checkbox-wrapper').forEach(wrapper => {
                        wrapper.classList.remove('selected');
                    });
                    document.querySelectorAll('.gender-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    localStorage.removeItem('bookingFormData_${form.id}');
                }, 2000);

            } catch (error) {
                console.error('Booking submission failed:', error);
                showAlert('予約の送信に失敗しました。もう一度お試しください。', 'error');
            }
        });
    </script>
</body>
</html>`;
}
