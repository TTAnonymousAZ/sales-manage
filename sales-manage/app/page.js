"use client";

import React, { useState, useEffect } from 'react';

/**
 * 認証設定
 * ログインID: T / PW: 作成済み
 */
const AUTH_CONFIG = { id: "T", pw: "06100522" };
const CAT_OPTIONS = ["刺繍", "つけ襟", "クシュクシュ", "ヘアーアクセサリ"];

// --- アイコンコンポーネント (SVG) ---
const Icon = ({ name, size = 18 }) => {
  const icons = {
    LayoutDashboard: <g><path d="M3 3h7v10H3zm11 0h7v5h-7zm0 9h7v9h-7zm-11 7h7v2H3z" /></g>,
    BarChart3: <g><path d="M3 20v-8m6 8v-5m6 5v-11m6 11V4" /></g>,
    Users: <g><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8m13 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></g>,
    LogOut: <g><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" /></g>,
    PlusCircle: <g><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></g>,
    Edit: <g><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7m-1.5-10.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" /></g>,
    Trash2: <g><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6" /></g>,
    Printer: <g><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2m-12 0v4h12v-4" /></g>,
    Check: <g><polyline points="20 6 9 17 4 12" /></g>,
    X: <g><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></g>
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name] || null}
    </svg>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('sales');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [editingId, setEditingId] = useState(null); 
  const [editForm, setEditForm] = useState({ product_name: '', customer_name: '', amount: 0, category: [] });
  const [newForm, setNewForm] = useState({ product_name: '', customer_name: '', amount: 0, category: [] });

  // データの取得 (暫定的にlocalStorage)
  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem('az_sales_db');
      setSalesData(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error("Fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  // データの保存
  const persistData = async (data) => {
    try {
      localStorage.setItem('az_sales_db', JSON.stringify(data));
      setSalesData(data);
    } catch (e) {
      console.error("Save error", e);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchSalesData();
  }, [isLoggedIn, selectedYear]);

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (formData.get('userId') === AUTH_CONFIG.id && formData.get('password') === AUTH_CONFIG.pw) {
      setIsLoggedIn(true);
    } else {
      alert("IDまたはパスワードが正しくありません。");
    }
  };

  const handleAddNew = async () => {
    if (!newForm.product_name || newForm.category.length === 0) {
      alert("商品名と分類を入力してください。");
      return;
    }
    const now = new Date();
    const newRecord = {
      id: Date.now(),
      ...newForm,
      amount: Number(newForm.amount),
      sale_year: selectedYear,
      sale_month: now.getMonth() + 1,
      sale_day: now.getDate()
    };
    await persistData([newRecord, ...salesData]);
    setNewForm({ product_name: '', customer_name: '', amount: 0, category: [] });
  };

  const handleUpdate = async (id) => {
    const newData = salesData.map(s => s.id === id ? { ...s, ...editForm, amount: Number(editForm.amount) } : s);
    await persistData(newData);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("削除しますか？")) return;
    await persistData(salesData.filter(s => s.id !== id));
  };

  const toggleCategory = (current, cat, setter, state) => {
    const next = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
    setter({ ...state, category: next });
  };

  // 集計ロジック
  const filteredData = salesData.filter(s => s.sale_year === selectedYear);
  const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    total: filteredData.filter(s => s.sale_month === (i + 1)).reduce((sum, s) => sum + s.amount, 0)
  }));
  const maxMonthlyTotal = Math.max(...monthlyStats.map(m => m.total), 1);

  const categoryStats = CAT_OPTIONS.map(cat => ({
    cat,
    total: filteredData.filter(s => s.category.includes(cat)).reduce((sum, s) => sum + s.amount, 0),
    count: filteredData.filter(s => s.category.includes(cat)).length
  }));

  const customerStats = Object.values(filteredData.reduce((acc, s) => {
    const name = s.customer_name || "不明";
    if (!acc[name]) acc[name] = { name, total: 0, count: 0, cats: new Set() };
    acc[name].total += s.amount;
    acc[name].count += 1;
    s.category.forEach(c => acc[name].cats.add(c));
    return acc;
  }, {}));

  // ログイン画面
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tighter italic uppercase underline decoration-slate-300 underline-offset-8">Sales Management</h1>
            <p className="text-slate-400 mt-4 text-[10px] font-black uppercase tracking-[0.3em]">Author: T.T</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <input name="userId" type="text" placeholder="ID" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 font-bold" required />
            <input name="password" type="password" placeholder="PASSWORD" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 font-bold" required />
            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black tracking-widest hover:bg-slate-800 transition transform active:scale-95">LOGIN</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* サイドバー */}
      <aside className="no-print w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col shadow-sm">
        <div className="mb-10">
          <div className="flex items-center gap-3 text-slate-900 mb-1">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black italic">T.T</div>
            <h2 className="text-xl font-black tracking-tighter">販売管理</h2>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">T.T/</p>
        </div>
        <nav className="space-y-1">
          {['sales', 'analysis', 'customers'].map(view => (
            <button key={view} onClick={() => setCurrentView(view)} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition text-sm ${currentView === view ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <Icon name={view === 'sales' ? 'LayoutDashboard' : view === 'analysis' ? 'BarChart3' : 'Users'} /> 
              {view === 'sales' ? '販売一覧' : view === 'analysis' ? '販売分析' : '顧客分析'}
            </button>
          ))}
        </nav>
        <button onClick={() => setIsLoggedIn(false)} className="mt-auto flex items-center gap-2 text-slate-400 hover:text-red-500 font-black transition pt-4 border-t border-slate-100 text-[10px] uppercase tracking-widest">
          <Icon name="LogOut" size={16} /> Logout
        </button>
      </aside>

      {/* メイン */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* ヘッダー */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
              {currentView === 'sales' ? '販売一覧' : currentView === 'analysis' ? '販売分析' : '顧客分析'}
            </h2>
            <div className="flex gap-2 no-print">
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-white border border-slate-200 p-2.5 px-4 rounded-xl text-xs font-black shadow-sm">
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}年度</option>)}
              </select>
              <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2">
                <Icon name="Printer" size={16} /> PDF出力
              </button>
            </div>
          </div>

          {currentView === 'sales' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-4 w-24">日付</th>
                    <th className="px-4 py-4">商品名</th>
                    <th className="px-4 py-4">顧客名</th>
                    <th className="px-4 py-4">分類</th>
                    <th className="px-4 py-4 text-right">金額</th>
                    <th className="px-4 py-4 text-center no-print">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  <tr className="bg-slate-50/30 no-print">
                    <td className="px-4 py-3 text-xs italic text-slate-400">NEW</td>
                    <td className="px-4 py-3"><input value={newForm.product_name} onChange={e => setNewForm({...newForm, product_name: e.target.value})} placeholder="商品名..." className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs outline-none" /></td>
                    <td className="px-4 py-3"><input value={newForm.customer_name} onChange={e => setNewForm({...newForm, customer_name: e.target.value})} placeholder="顧客名..." className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs outline-none" /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {CAT_OPTIONS.map(cat => (
                          <button key={cat} onClick={() => toggleCategory(newForm.category, cat, setNewForm, newForm)} className={`text-[8px] px-1.5 py-0.5 rounded border font-bold ${newForm.category.includes(cat) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-300 border-slate-100'}`}>
                            {cat}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3"><input type="number" value={newForm.amount || ''} onChange={e => setNewForm({...newForm, amount: e.target.value})} placeholder="0" className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-right font-black" /></td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={handleAddNew} className="bg-slate-900 text-white p-2 rounded-lg"><Icon name="PlusCircle" size={14} /></button>
                    </td>
                  </tr>
                  {filteredData.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      {editingId === item.id ? (
                        <>
                          <td className="px-4 py-3 text-xs font-mono text-slate-400">{item.sale_month}/{item.sale_day}</td>
                          <td className="px-4 py-3"><input value={editForm.product_name} onChange={e => setEditForm({...editForm, product_name: e.target.value})} className="w-full border border-slate-300 rounded p-1 text-xs" /></td>
                          <td className="px-4 py-3"><input value={editForm.customer_name} onChange={e => setEditForm({...editForm, customer_name: e.target.value})} className="w-full border border-slate-300 rounded p-1 text-xs" /></td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {CAT_OPTIONS.map(cat => (
                                <button key={cat} onClick={() => toggleCategory(editForm.category, cat, setEditForm, editForm)} className={`text-[8px] px-1 py-0.5 rounded border font-bold ${editForm.category.includes(cat) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-300 border-slate-100'}`}>
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3"><input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="w-full border border-slate-300 rounded p-1 text-xs text-right font-black" /></td>
                          <td className="px-4 py-3 text-center space-x-2">
                            <button onClick={() => handleUpdate(item.id)} className="text-emerald-600"><Icon name="Check" size={14} /></button>
                            <button onClick={() => setEditingId(null)} className="text-slate-400"><Icon name="X" size={14} /></button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-4 text-xs font-mono text-slate-400">{item.sale_month}/{item.sale_day}</td>
                          <td className="px-4 py-4 font-black uppercase tracking-tight">{item.product_name}</td>
                          <td className="px-4 py-4 text-slate-500 font-bold text-xs uppercase italic">{item.customer_name || 'Anonymous'}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {item.category.map(c => <span key={c} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-black uppercase italic">{c}</span>)}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right font-black tabular-nums">¥{item.amount.toLocaleString()}</td>
                          <td className="px-4 py-4 text-center space-x-2 no-print">
                            <button onClick={() => { setEditingId(item.id); setEditForm(item); }} className="text-slate-300 hover:text-slate-900"><Icon name="Edit" size={14} /></button>
                            <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500"><Icon name="Trash2" size={14} /></button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {currentView === 'analysis' && (
            <div className="space-y-10">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">月別売上推移</h3>
                <div className="flex-grow flex items-end justify-between gap-1 relative border-b border-l border-slate-100 pb-2 pl-2">
                  {monthlyStats.map(m => (
                    <div key={m.month} className="flex-grow flex flex-col items-center group h-full justify-end">
                      <div className="w-4 md:w-8 bg-slate-900 rounded-t-sm" style={{ height: `${(m.total / maxMonthlyTotal) * 100}%` }}></div>
                      <span className="text-[10px] font-black text-slate-400 mt-2">{m.month}月</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 text-white p-12 rounded-[2.5rem] flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 mb-4">総売上額</p>
                <p className="text-7xl font-black italic tracking-tighter">¥{filteredData.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}</p>
              </div>
            </div>
          )}

          {currentView === 'customers' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <tr><th className="px-6 py-6">顧客名</th><th className="px-6 py-6 text-center">購入回数</th><th className="px-6 py-6 text-right">累計購入額</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {customerStats.map(c => (
                    <tr key={c.name} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-6 font-black text-slate-900 uppercase">{c.name}</td>
                      <td className="px-6 py-6 text-center font-black text-slate-400 text-[10px]">{c.count} 回</td>
                      <td className="px-6 py-6 text-right font-black text-xl tracking-tighter">¥{c.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}