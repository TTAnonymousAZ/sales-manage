import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, query, serverTimestamp } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Plus, 
  Loader2,
  AlertCircle,
  Calendar,
  ChevronDown
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'sales-management-tt';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sales, setSales] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const categories = ["刺繍", "付け襟", "クシュクシュ", "ヘアーアクセサリー"];

  // --- Auth & Data Flow ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth failed:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const salesCol = collection(db, 'artifacts', appId, 'public', 'data', 'sales');
    const unsubscribe = onSnapshot(salesCol, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          date: d.date?.toDate() || new Date()
        };
      });
      setSales(data);
    }, (err) => console.error(err));
    return () => unsubscribe();
  }, [user]);

  // --- Calculations ---
  const currentYearSales = useMemo(() => {
    return sales.filter(s => s.date.getFullYear() === selectedYear);
  }, [sales, selectedYear]);

  const monthlyData = useMemo(() => {
    const months = Array(12).fill(0).map((_, i) => ({ month: i + 1, total: 0 }));
    currentYearSales.forEach(s => {
      const m = s.date.getMonth();
      months[m].total += s.amount;
    });
    return months;
  }, [currentYearSales]);

  const categoryAnalysis = useMemo(() => {
    const stats = {};
    categories.forEach(c => stats[c] = { count: 0, total: 0 });
    currentYearSales.forEach(s => {
      if (stats[s.category]) {
        stats[s.category].count += Number(s.quantity);
        stats[s.category].total += Number(s.amount);
      }
    });
    return stats;
  }, [currentYearSales]);

  const customers = useMemo(() => {
    const list = [...new Set(sales.map(s => s.customerName))];
    return list.map(name => ({
      name,
      totalSpent: sales.filter(s => s.customerName === name).reduce((sum, s) => sum + s.amount, 0),
      orderCount: sales.filter(s => s.customerName === name).length
    })).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [sales]);

  // --- Handlers ---
  const handleAddSale = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      productName: fd.get('productName'),
      customerName: fd.get('customerName'),
      category: fd.get('category'),
      quantity: Number(fd.get('quantity')),
      amount: Number(fd.get('amount')),
      createdBy: "T.T",
      author: "T.T Anonymous AZ",
      date: serverTimestamp()
    };
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'sales'), data);
    e.target.reset();
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col fixed h-full">
        <div className="mb-10">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="text-blue-400" /> 販売管理システム
          </h1>
          <p className="text-[10px] text-slate-400 mt-1">Author: T.T Anonymous AZ</p>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><LayoutDashboard size={18}/>ダッシュボード</button>
          <button onClick={() => setActiveTab('sales')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'sales' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><ShoppingCart size={18}/>販売登録</button>
          <button onClick={() => setActiveTab('analysis')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'analysis' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><BarChart3 size={18}/>販売分析</button>
          <button onClick={() => setActiveTab('customers')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'customers' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><Users size={18}/>顧客管理</button>
        </nav>
      </aside>

      {/* Main Container */}
      <main className="flex-1 ml-64 p-8">
        
        {/* --- Dashboard --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">全体概要</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-sm text-slate-500">累計売上</p>
                <p className="text-3xl font-bold mt-2 text-blue-600">¥{sales.reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-sm text-slate-500">累計販売数</p>
                <p className="text-3xl font-bold mt-2 text-emerald-600">{sales.reduce((a, b) => a + b.quantity, 0).toLocaleString()} 個</p>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-sm text-slate-500">登録顧客数</p>
                <p className="text-3xl font-bold mt-2 text-amber-600">{customers.length} 名</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-4">直近の取引 (作成者: T.T)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-3 text-left">日付</th>
                      <th className="p-3 text-left">商品名</th>
                      <th className="p-3 text-left">顧客名</th>
                      <th className="p-3 text-right">金額</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sales.slice(-5).reverse().map(s => (
                      <tr key={s.id}>
                        <td className="p-3">{s.date.toLocaleDateString()}</td>
                        <td className="p-3 font-medium">{s.productName}</td>
                        <td className="p-3">{s.customerName}</td>
                        <td className="p-3 text-right font-bold">¥{s.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Sales Registration --- */}
        {activeTab === 'sales' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl border shadow-sm max-w-3xl mx-auto">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="text-blue-500"/> 販売情報を登録</h2>
              <form onSubmit={handleAddSale} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">商品名</label>
                  <input name="productName" required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="商品名を入力"/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">顧客名</label>
                  <input name="customerName" required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="顧客名"/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">分類</label>
                  <select name="category" className="w-full p-2.5 border rounded-lg bg-white outline-none">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">個数</label>
                  <input name="quantity" type="number" required defaultValue="1" className="w-full p-2.5 border rounded-lg outline-none"/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">金額 (¥)</label>
                  <input name="amount" type="number" required className="w-full p-2.5 border rounded-lg outline-none" placeholder="0"/>
                </div>
                <div className="col-span-2 pt-4">
                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                    登録する (作成者: T.T)
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-4">登録済みデータ一覧</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50">
                    <tr>
                      <th className="p-3 text-left">日付</th>
                      <th className="p-3 text-left">分類</th>
                      <th className="p-3 text-left">商品名</th>
                      <th className="p-3 text-left">顧客名</th>
                      <th className="p-3 text-right">個数</th>
                      <th className="p-3 text-right">合計金額</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sales.slice().reverse().map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-500">{s.date.toLocaleDateString()}</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">{s.category}</span></td>
                        <td className="p-3 font-medium">{s.productName}</td>
                        <td className="p-3">{s.customerName}</td>
                        <td className="p-3 text-right">{s.quantity}</td>
                        <td className="p-3 text-right font-bold text-blue-600">¥{s.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Analysis --- */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">販売分析</h2>
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
                <Calendar size={16} className="text-slate-400" />
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent outline-none font-bold text-sm"
                >
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}年</option>)}
                </select>
              </div>
            </div>

            {/* Monthly Chart (CSS Bar Chart) */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-8">{selectedYear}年度 売上推移</h3>
              <div className="flex items-end gap-2 h-48 px-4">
                {monthlyData.map(d => {
                  const maxTotal = Math.max(...monthlyData.map(m => m.total), 1);
                  const height = (d.total / maxTotal) * 100;
                  return (
                    <div key={d.month} className="flex-1 flex flex-col items-center group">
                      <div className="w-full bg-blue-100 group-hover:bg-blue-200 rounded-t-md transition-all relative" style={{ height: `${height}%` }}>
                        {d.total > 0 && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600">
                            {Math.floor(d.total/1000)}k
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] mt-2 text-slate-400 font-bold">{d.month}月</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="font-bold mb-4">分類別集計 ({selectedYear}年)</h3>
                <div className="space-y-4">
                  {categories.map(cat => {
                    const data = categoryAnalysis[cat];
                    const maxVal = Math.max(...Object.values(categoryAnalysis).map(v => v.total), 1);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{cat}</span>
                          <span className="font-bold">¥{data.total.toLocaleString()} ({data.count}点)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(data.total/maxVal)*100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="font-bold mb-4 text-slate-500 uppercase text-xs">分析まとめ</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400">年間最高売上月</p>
                    <p className="text-xl font-bold">{monthlyData.sort((a,b)=>b.total-a.total)[0].month}月</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400">主力カテゴリー</p>
                    <p className="text-xl font-bold">{Object.entries(categoryAnalysis).sort((a,b)=>b[1].total-a[1].total)[0][0]}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Customers --- */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">顧客管理</h2>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-4 text-left font-bold">顧客名</th>
                    <th className="p-4 text-center font-bold">購入回数</th>
                    <th className="p-4 text-right font-bold">累計購入金額</th>
                    <th className="p-4 text-right">ステータス</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((c, i) => (
                    <tr key={c.name} className="hover:bg-slate-50 transition">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                          {c.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{c.name}</span>
                      </td>
                      <td className="p-4 text-center">{c.orderCount} 回</td>
                      <td className="p-4 text-right font-bold text-blue-600">¥{c.totalSpent.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        {c.totalSpent > 100000 ? (
                          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold">VIP</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">Regular</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-slate-400 italic">顧客データがありません。販売登録を行うと自動でリスト化されます。</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}