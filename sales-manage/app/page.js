"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  Search, 
  Bell, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// メインのAppコンポーネント
export default function App() {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* サイドバー */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h2 className="text-xl font-black tracking-tighter text-white">販売管理</h2>
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            T.T Anonymous AZ
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="ダッシュボード" 
            active={activeView === 'dashboard'} 
            onClick={() => setActiveView('dashboard')} 
          />
          <NavItem 
            icon={<Package size={20} />} 
            label="商品管理" 
            active={activeView === 'products'} 
            onClick={() => setActiveView('products')} 
          />
          <NavItem 
            icon={<ShoppingCart size={20} />} 
            label="注文" 
            active={activeView === 'orders'} 
            onClick={() => setActiveView('orders')} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="顧客" 
            active={activeView === 'customers'} 
            onClick={() => setActiveView('customers')} 
          />
          <NavItem 
            icon={<BarChart3 size={20} />} 
            label="売上分析" 
            active={activeView === 'analysis'} 
            onClick={() => setActiveView('analysis')} 
          />
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <NavItem icon={<Settings size={20} />} label="設定" />
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="検索..." 
              className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">AZ</div>
            </div>
          </div>
        </header>

        {/* コンテンツエリア */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">ダッシュボード</h1>
              <p className="text-slate-500">本日の売上状況と指標の概要</p>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              レポートを書き出し
            </button>
          </div>

          {/* ステータスカード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="総売上" 
              value="¥1,280,000" 
              trend="+12.5%" 
              up={true} 
              icon={<DollarSign className="text-emerald-600" />} 
            />
            <StatCard 
              title="新規顧客" 
              value="48" 
              trend="+3.2%" 
              up={true} 
              icon={<Users className="text-blue-600" />} 
            />
            <StatCard 
              title="平均客単価" 
              value="¥26,500" 
              trend="-1.4%" 
              up={false} 
              icon={<TrendingUp className="text-amber-600" />} 
            />
            <StatCard 
              title="注文数" 
              value="156" 
              trend="+8.1%" 
              up={true} 
              icon={<ShoppingCart className="text-indigo-600" />} 
            />
          </div>

          {/* セクション例 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-slate-800">最近の売上</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">顧客名 {i}</p>
                      <p className="text-xs text-slate-400">2024年3月12日 14:30</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">¥42,000</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase">完了</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// サブコンポーネント: サイドバーアイテム
function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-indigo-600 text-white' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// サブコンポーネント: ステータスカード
function StatCard({ title, value, trend, up, icon }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
          {icon}
        </div>
        <div className={`flex items-center text-xs font-bold ${up ? 'text-emerald-500' : 'text-rose-500'}`}>
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}