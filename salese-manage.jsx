import React, { useState, useEffect } from 'react';

/**
 * 販売管理システム (React版)
 * 作成者: T.T Anonymous AZ
 * 特徴: リアルタイム分析ダッシュボード搭載、インライングラフ描画
 */

// --- インラインSVGアイコンコンポーネント ---
const Icons = {
  Layout: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>,
  BarChart3: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Trash2: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  FileText: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14.5 2 14.5 7.5 20 7.5"/></svg>,
  Save: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  TrendingUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
};

export default function App() {
  // --- 1. 状態管理 ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [editId, setEditId] = useState(null);
  const [salesData, setSalesData] = useState([
    { id: 1, product_name: 'デモ用刺繍襟', amount: 3800, sale_year: 2026, sale_month: 1, sale_day: 10, category: ['刺繍付け襟'] },
    { id: 2, product_name: 'フリル襟リボン', amount: 2500, sale_year: 2026, sale_month: 2, sale_day: 15, category: ['フリル付け襟'] },
    { id: 3, product_name: 'クシュクシュシュシュ', amount: 1200, sale_year: 2026, sale_month: 2, sale_day: 20, category: ['ヘアーアクセサリ'] },
    { id: 4, product_name: '豪華刺繍セット', amount: 5500, sale_year: 2026, sale_month: 3, sale_day: 5, category: ['刺繍付け襟', 'ヘアーアクセサリ'] }
  ]);

  const [formData, setFormData] = useState({
    product_name: '',
    amount: 0,
    sale_year: new Date().getFullYear(),
    sale_month: new Date().getMonth() + 1,
    sale_day: new Date().getDate(),
    category: []
  });

  const catOptions = ["刺繍付け襟", "フリル付け襟", "クシュクシュ付け襟", "ヘアーアクセサリ"];

  // --- 2. 認証処理 ---
  const handleLogin = (e) => {
    e.preventDefault();
    const id = e.target.userId.value;
    const pw = e.target.password.value;
    if (id === "T" && pw === "06100522") {
      setIsLoggedIn(true);
    } else {
      alert("IDまたはパスワードが違います");
    }
  };

  // --- 3. ロジック ---
  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.product_name || formData.category.length === 0) {
      alert("商品名と分類を入力してください");
      return;
    }
    if (editId) {
      setSalesData(salesData.map(item => item.id === editId ? { ...formData, id: editId } : item));
      setEditId(null);
    } else {
      setSalesData([{ ...formData, id: Date.now() }, ...salesData]);
    }
    resetForm();
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setFormData({ ...item });
    setShowAnalysis(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("このデータを削除しますか？")) {
      setSalesData(salesData.filter(item => item.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      amount: 0,
      sale_year: new Date().getFullYear(),
      sale_month: new Date().getMonth() + 1,
      sale_day: new Date().getDate(),
      category: []
    });
    setEditId(null);
  };

  const toggleCategory = (cat) => {
    const newCats = formData.category.includes(cat)
      ? formData.category.filter(c => c !== cat)
      : [...formData.category, cat];
    setFormData({ ...formData, category: newCats });
  };

  // --- 4. 分析データの計算 ---
  const totalSales = salesData.reduce((acc, curr) => acc + curr.amount, 0);
  const averageSale = salesData.length ? Math.round(totalSales / salesData.length) : 0;
  
  // 月別集計 (1月〜12月)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const total = salesData
      .filter(s => s.sale_month === month)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { month, total };
  });
  const maxMonthly = Math.max(...monthlyData.map(d => d.total), 1);

  // カテゴリ別集計
  const categoryStats = catOptions.map(cat => {
    const total = salesData
      .filter(s => s.category.includes(cat))
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { cat, total, percentage: totalSales ? Math.round((total / totalSales) * 100) : 0 };
  });

  // --- ログイン画面 ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">🔐 販売管理システム</h1>
            <p className="text-slate-500 mt-2 text-sm">T.T Anonymous AZ Project</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">利用者ID</label>
              <input name="userId" type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">パスワード</label>
              <input name="password" type="password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition">
              ログイン
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* サイドバー */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col shadow-sm">
        <div className="mb-10">
          <div className="flex items-center gap-3 text-blue-600 mb-1">
            <Icons.Layout />
            <h2 className="text-xl font-black tracking-tighter">販売管理 JS</h2>
          </div>
          <p className="text-slate-400 text-[10px] font-mono">Login: {new Date().toLocaleDateString()}</p>
        </div>

        <nav className="space-y-1 mb-8">
          <button 
            onClick={() => setShowAnalysis(false)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold transition ${!showAnalysis ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Icons.Home /> 登録データ管理
          </button>
          <button 
            onClick={() => setShowAnalysis(true)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold transition ${showAnalysis ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Icons.BarChart3 /> 集計・分析
          </button>
        </nav>

        {/* 入力フォーム */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6 shadow-inner">
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
            {editId ? <Icons.Edit /> : <Icons.Plus />} {editId ? "データ編集" : "新規データ登録"}
          </h3>
          <form onSubmit={handleSave} className="space-y-3">
            <input 
              placeholder="商品名"
              value={formData.product_name}
              onChange={(e) => setFormData({...formData, product_name: e.target.value})}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none"
            />
            <div className="grid grid-cols-3 gap-1 text-[10px]">
              <input type="number" value={formData.sale_year} onChange={e => setFormData({...formData, sale_year: parseInt(e.target.value)})} className="p-2 border border-slate-200 rounded bg-white text-center" />
              <input type="number" value={formData.sale_month} onChange={e => setFormData({...formData, sale_month: parseInt(e.target.value)})} className="p-2 border border-slate-200 rounded bg-white text-center" />
              <input type="number" value={formData.sale_day} onChange={e => setFormData({...formData, sale_day: parseInt(e.target.value)})} className="p-2 border border-slate-200 rounded bg-white text-center" />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">¥</span>
              <input 
                type="number"
                placeholder="金額"
                value={formData.amount || ''}
                onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                className="w-full pl-7 p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1 py-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">分類</p>
              <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto">
                {catOptions.map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-[11px] p-1 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-600"
                      checked={formData.category.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    /> 
                    <span className={formData.category.includes(cat) ? "text-blue-700 font-bold" : "text-slate-600"}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2">
              <Icons.Save /> 保存
            </button>
          </form>
        </div>

        <button onClick={() => setIsLoggedIn(false)} className="mt-auto flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold transition pt-4 border-t border-slate-100 text-sm">
          <Icons.LogOut /> ログアウト
        </button>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {showAnalysis ? "📊 売上集計・分析" : "🏠 登録データ管理"}
            </h2>
            <div className="flex gap-2">
              <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg">
                <Icons.FileText /> PDF出力
              </button>
            </div>
          </div>

          {!showAnalysis ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">日付</th>
                      <th className="px-6 py-4">商品名 / 分類</th>
                      <th className="px-6 py-4 text-right">金額</th>
                      <th className="px-6 py-4 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {salesData.length === 0 ? (
                      <tr><td colSpan="4" className="p-24 text-center text-slate-300">データがありません</td></tr>
                    ) : salesData.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-[11px] font-mono text-slate-400">{item.sale_year}/{item.sale_month.toString().padStart(2, '0')}/{item.sale_day.toString().padStart(2, '0')}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{item.product_name}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.category.map(c => (
                              <span key={c} className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-md font-bold">{c}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-blue-600">¥{item.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => handleEdit(item)} className="p-2 text-slate-300 hover:text-blue-600 transition"><Icons.Edit /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-red-600 transition"><Icons.Trash2 /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* サマリーカード */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">総売上額</p>
                  <p className="text-3xl font-black text-slate-900">¥{totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">平均単価</p>
                  <p className="text-3xl font-black text-slate-900">¥{averageSale.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">取引件数</p>
                  <p className="text-3xl font-black text-slate-900">{salesData.length} <span className="text-sm font-bold text-slate-400">件</span></p>
                </div>
              </div>

              {/* グラフセクション */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 月別売上グラフ */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
                    <Icons.TrendingUp /> 月別売上推移 (2026)
                  </h3>
                  <div className="flex items-end justify-between h-48 gap-2 px-2">
                    {monthlyData.map(d => (
                      <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                        {/* ツールチップ */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition bg-slate-800 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                          ¥{d.total.toLocaleString()}
                        </div>
                        <div 
                          className="w-full bg-blue-500 rounded-t-md transition-all duration-500 hover:bg-blue-600" 
                          style={{ height: `${(d.total / maxMonthly) * 100}%`, minHeight: d.total > 0 ? '4px' : '0px' }}
                        ></div>
                        <span className="text-[10px] font-bold text-slate-400">{d.month}月</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* カテゴリ別内訳 */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                  <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
                    <Icons.BarChart3 /> カテゴリ別売上シェア
                  </h3>
                  <div className="space-y-6 overflow-y-auto">
                    {categoryStats.sort((a,b) => b.total - a.total).map((stat) => (
                      <div key={stat.cat} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-bold text-slate-700">{stat.cat}</span>
                          <span className="text-sm font-black text-slate-900">¥{stat.total.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">({stat.percentage}%)</span></span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full transition-all duration-700"
                            style={{ width: `${stat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}