import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { LayoutDashboard, Database, Users, Map, Wallet, PieChart, TrendingUp, Save, RotateCcw } from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const App = () => {
  // 1. 設定預設資料 (如果是第一次打開，會用這個)
  const defaultData = {
    totalSales: 316667,    // 總銷金額
    remainingSales: 57460, // 剩餘總銷
    totalUnits: 97,        // 總戶數
    remainingUnits: 16,    // 剩餘戶數
    totalParking: 166,     // 可銷車位
    remainingParking: 33,  // 剩餘車位
    marketingBudget: 0,    // 廣告預算
    currentYearDeal: 0,    // 本年度成交
    currentYearRevenue: 0  // 本年度營收貢獻
  };

  // 2. 初始化 State (嘗試從手機儲存空間讀取資料)
  const [data, setData] = useState(() => {
    try {
      const savedData = localStorage.getItem('salesDashboardData_v1');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('讀取儲存資料失敗:', error);
    }
    return defaultData;
  });

  // 3. 自動儲存機制 (只要 data 有變動，就寫入手機儲存空間)
  useEffect(() => {
    localStorage.setItem('salesDashboardData_v1', JSON.stringify(data));
  }, [data]);

  // 處理輸入變更
  const handleInputChange = (key, value) => {
    setData(prev => ({
      ...prev,
      [key]: parseInt(value) || 0
    }));
  };

  // 重置資料按鈕的功能
  const handleReset = () => {
    if (window.confirm('確定要重置所有數據回到預設值嗎？')) {
      setData(defaultData);
    }
  };

  // 計算邏輯
  const soldUnits = data.totalUnits - data.remainingUnits;
  const sellThroughRate = ((soldUnits / data.totalUnits) * 100).toFixed(2);
  const soldSales = data.totalSales - data.remainingSales;

  // 圖表假資料
  const trendData = [
    { name: '1月', 來人: 45, 成交: 2 },
    { name: '2月', 來人: 52, 成交: 3 },
    { name: '3月', 來人: 38, 成交: 5 },
    { name: '4月', 來人: 65, 成交: 4 },
    { name: '5月', 來人: 48, 成交: 2 },
    { name: '6月', 來人: 55, 成交: 3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 標題區 */}
        <header className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Database className="w-8 h-8 text-blue-600" />
                麗晨建設【花果山】| 動態銷控儀表板
              </h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <span className="bg-gray-200 px-2 py-1 rounded">2025</span>
                <span className="bg-white border border-blue-600 text-blue-600 px-2 py-1 rounded font-medium">2026 (完銷年)</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            數據來源：即時銷控表連動 (Excel-like) | 狀態：<span className="text-green-600 font-bold">完銷衝刺</span>
          </p>
          
          {/* 功能按鈕列 */}
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
              <LayoutDashboard size={18} /> 戰情總覽
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Database size={18} /> 月度執行表
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Users size={18} /> 銷控與團隊
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Map size={18} /> 策略地圖
            </button>
          </div>
        </header>

        {/* 核心數據輸入區 (深色背景) */}
        <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">總銷售額 (萬)</label>
              <input 
                type="number" 
                value={data.totalSales}
                onChange={(e) => handleInputChange('totalSales', e.target.value)}
                className="w-full bg-transparent text-2xl font-bold border-b border-slate-600 focus:border-blue-400 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-green-400">剩餘總銷 (萬)</label>
              <input 
                type="number" 
                value={data.remainingSales}
                onChange={(e) => handleInputChange('remainingSales', e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-green-400 border-b border-slate-600 focus:border-green-400 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">總戶數</label>
              <input 
                type="number" 
                value={data.totalUnits}
                onChange={(e) => handleInputChange('totalUnits', e.target.value)}
                className="w-full bg-transparent text-2xl font-bold border-b border-slate-600 focus:border-blue-400 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-red-400">剩餘戶數</label>
              <input 
                type="number" 
                value={data.remainingUnits}
                onChange={(e) => handleInputChange('remainingUnits', e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-red-400 border-b border-slate-600 focus:border-red-400 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">可銷車位</label>
              <input 
                type="number" 
                value={data.totalParking}
                onChange={(e) => handleInputChange('totalParking', e.target.value)}
                className="w-full bg-transparent text-2xl font-bold border-b border-slate-600 focus:border-blue-400 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-orange-400">剩餘車位</label>
              <input 
                type="number" 
                value={data.remainingParking}
                onChange={(e) => handleInputChange('remainingParking', e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-orange-400 border-b border-slate-600 focus:border-orange-400 outline-none transition-colors"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
             <Save size={14} /> 
             <span>數據將自動儲存於您的裝置中 (Auto-save enabled)</span>
          </div>
        </div>

        {/* 關鍵指標卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 去化率 */}
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">全案銷售率 (Sell-through)</p>
                <div className="text-4xl font-bold text-gray-900">{sellThroughRate}%</div>
                <div className="mt-2 text-sm text-blue-600 font-medium">
                  已售 {soldUnits} / 總戶數 {data.totalUnits} (剩餘 {data.remainingUnits} 戶)
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <PieChart className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          {/* 剩餘金額 */}
          <Card className="border-l-4 border-l-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">剩餘總銷金額 (萬)</p>
                <div className="text-4xl font-bold text-gray-900">
                  {data.remainingSales.toLocaleString()}
                </div>
                <div className="mt-2 text-sm text-green-600 font-medium">
                  全案預估總銷 {data.totalSales.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Wallet className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          {/* 年度成交 */}
          <Card className="border-l-4 border-l-indigo-500">
             <div className="flex justify-between items-start">
              <div className="w-full">
                <p className="text-gray-500 text-sm mb-1">2026 年度成交目標輸入</p>
                <div className="flex items-end gap-2">
                  <input 
                    type="number" 
                    value={data.currentYearDeal}
                    onChange={(e) => handleInputChange('currentYearDeal', e.target.value)}
                    className="text-4xl font-bold text-gray-900 w-32 border-b border-gray-200 outline-none focus:border-indigo-500"
                  />
                  <span className="text-xl text-gray-600 mb-1">戶</span>
                </div>
                <div className="mt-2 text-sm text-indigo-600 font-medium">
                  本年度營收貢獻 {data.currentYearRevenue.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
            </div>
          </Card>

           {/* 廣告預算 */}
           <Card className="border-l-4 border-l-orange-500">
             <div className="flex justify-between items-start">
              <div className="w-full">
                <p className="text-gray-500 text-sm mb-1">廣告預算執行 (本年度)</p>
                <input 
                    type="number" 
                    value={data.marketingBudget}
                    onChange={(e) => handleInputChange('marketingBudget', e.target.value)}
                    className="text-4xl font-bold text-gray-900 w-full border-b border-gray-200 outline-none focus:border-orange-500"
                  />
                <div className="mt-2 text-sm text-orange-600 font-medium">
                  CPA: {data.currentYearDeal > 0 ? (data.marketingBudget / data.currentYearDeal).toFixed(0) : 'N/A'} / 戶
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* 圖表區 */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600"/>
              2026 年度銷售速度與來人趨勢
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" height={36}/>
                <Line type="monotone" dataKey="來人" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="成交" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 底部重置按鈕 */}
        <div className="flex justify-center pt-8 pb-4">
            <button 
                onClick={handleReset}
                className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm"
            >
                <RotateCcw size={14} /> 重置所有數據 (Reset Data)
            </button>
        </div>

      </div>
    </div>
  );
};

export default App;
