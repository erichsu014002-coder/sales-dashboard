import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Building2, TrendingUp, Users, Wallet, HardHat, ClipboardCheck, AlertCircle, Briefcase, LayoutDashboard, Database, Map, PieChart as PieIcon, CheckCircle2, CalendarDays, ChevronDown, Plus, Trash2, Save, RefreshCw, Edit3, Cloud, Loader2
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot, collection } from "firebase/firestore";

// --- Firebase Initialization ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- 專案參數設定 (初始值) ---
const DEFAULT_PROJECT_NAME = "麗晨建設【花果山】";

// --- 來自週報表的真實策略資料庫 ---
const STRATEGY_OPTIONS = [
  "【客層鎖定】針對科技業/中科族群 (強調交通便利)",
  "【客層鎖定】鎖定醫師/自營商 (強調品牌理念)",
  "【客層鎖定】退休置產/為子女置產 (強調資產配置)",
  "【產品優勢】強調「無共用壁」與「三面採光」",
  "【產品優勢】溝通「外玄關」落塵區與防疫優勢",
  "【產品優勢】強調地下室天井通風與EMS系統",
  "【抗性突破】低樓層/車道上方戶別 價格優勢包裝",
  "【抗性突破】協助客戶評估「舊屋換新」資金流",
  "【價格策略】堅持實價銷售，溝通品牌價值",
  "【銷售節奏】農曆年前/後 封關衝刺",
  "【銷售節奏】329/928檔期 重點行銷",
  "【銷售節奏】成屋階段「眼見為憑」實景體驗",
  "【售後服務】強調長期社區經營與保固"
];

const ACTION_OPTIONS = [
  "【現場活動】舉辦生態瓶/手作DIY暖場活動",
  "【現場活動】舉辦住戶回娘家/說明會",
  "【賞屋體驗】安排「基地現場/實品屋」參觀體驗",
  "【賞屋體驗】邀約至總部/品牌館 深度導覽",
  "【客戶經營】啟動 MGM (已購客介紹) 獎勵方案",
  "【客戶經營】針對舊客/網路名單 進行深度回訪",
  "【廣告投放】加強數位廣告投放 (FB/網路新聞)",
  "【廣告投放】戶外定點帆布/廣播 區域曝光",
  "【教育訓練】針對競品/市場抗性 進行話術演練",
  "【工務配合】拍攝最新工程進度/實景照 素材更新",
  "【簽約促動】針對猶豫客進行 總價/付款方式 試算",
  "【特殊專案】搭配裝潢/家電提貨券 促銷方案"
];

// --- 自定義的可選可填元件 (Creatable Select) ---
const CreatableSelect = ({ value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // 點擊外部關閉下拉選單
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-200 p-1.5 pr-8 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-1 p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
          tabIndex={-1} // 避免 tab 鍵選中按鈕
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      
      {isOpen && (
        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-slate-200 rounded-md shadow-lg text-xs">
          {options.map((option, index) => (
            <li
              key={index}
              className="p-2 hover:bg-indigo-50 cursor-pointer text-slate-700 truncate border-b border-slate-50 last:border-none"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              title={option}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- 2025年 數據 (模擬真實進度：已售81戶，剩餘16戶) ---
const initialData2025 = [
  { month: '1月', phase: '成屋銷售', targetUnits: 1, actualUnits: 1, visitors: 12, digitalLeads: 5, digitalDeals: 0, actualRev: 34000000, adBudget: 150000, actualAd: 120000, construction: '使照申請中', strategy: '【銷售節奏】農曆年前/後 封關衝刺', action: '【現場活動】舉辦住戶回娘家/說明會' },
  { month: '2月', phase: '成屋銷售', targetUnits: 1, actualUnits: 1, visitors: 8, digitalLeads: 3, digitalDeals: 0, actualRev: 35250000, adBudget: 100000, actualAd: 80000, construction: '公設細修', strategy: '【產品優勢】強調「無共用壁」與「三面採光」', action: '【客戶經營】針對舊客/網路名單 進行深度回訪' },
  { month: '3月', phase: '成屋銷售', targetUnits: 2, actualUnits: 2, visitors: 15, digitalLeads: 8, digitalDeals: 0, actualRev: 73250000, adBudget: 150000, actualAd: 140000, construction: '公設點交', strategy: '【銷售節奏】329/928檔期 重點行銷', action: '【賞屋體驗】安排「基地現場/實品屋」參觀體驗' },
  { month: '4月', phase: '成屋銷售', targetUnits: 1, actualUnits: 2, visitors: 14, digitalLeads: 6, digitalDeals: 0, actualRev: 70050000, adBudget: 120000, actualAd: 110000, construction: '驗屋啟動', strategy: '【客層鎖定】鎖定醫師/自營商 (強調品牌理念)', action: '【簽約促動】針對猶豫客進行 總價/付款方式 試算' },
  { month: '5月', phase: '成屋銷售', targetUnits: 2, actualUnits: 2, visitors: 20, digitalLeads: 12, digitalDeals: 1, actualRev: 72780000, adBudget: 200000, actualAd: 190000, construction: '交屋準備', strategy: '【抗性突破】協助客戶評估「舊屋換新」資金流', action: '【賞屋體驗】邀約至總部/品牌館 深度導覽' },
  { month: '6月', phase: '交屋期', targetUnits: 1, actualUnits: 1, visitors: 12, digitalLeads: 5, digitalDeals: 0, actualRev: 38400000, adBudget: 100000, actualAd: 90000, construction: '正式交屋', strategy: '【售後服務】強調長期社區經營與保固', action: '【客戶經營】啟動 MGM (已購客介紹) 獎勵方案' },
  { month: '7月', phase: '餘屋銷售', targetUnits: 1, actualUnits: 1, visitors: 10, digitalLeads: 4, digitalDeals: 0, actualRev: 33950000, adBudget: 80000, actualAd: 80000, construction: '入住裝潢', strategy: '【抗性突破】低樓層/車道上方戶別 價格優勢包裝', action: '【簽約促動】針對猶豫客進行 總價/付款方式 試算' },
  { month: '8月', phase: '餘屋銷售', targetUnits: 1, actualUnits: 0, visitors: 8, digitalLeads: 4, digitalDeals: 0, actualRev: 0, adBudget: 80000, actualAd: 60000, construction: '入住裝潢', strategy: '【銷售節奏】民俗月沉澱，整理無效名單', action: '【教育訓練】針對競品/市場抗性 進行話術演練' },
  { month: '9月', phase: '餘屋銷售', targetUnits: 1, actualUnits: 2, visitors: 12, digitalLeads: 8, digitalDeals: 0, actualRev: 76470000, adBudget: 150000, actualAd: 130000, construction: '管委會成立', strategy: '【銷售節奏】329/928檔期 重點行銷', action: '【工務配合】拍攝最新工程進度/實景照 素材更新' },
  { month: '10月', phase: '餘屋銷售', targetUnits: 1, actualUnits: 1, visitors: 15, digitalLeads: 10, digitalDeals: 0, actualRev: 36800000, adBudget: 150000, actualAd: 140000, construction: '設施維養', strategy: '【客層鎖定】針對科技業/中科族群 (強調交通便利)', action: '【現場活動】舉辦生態瓶/手作DIY暖場活動' },
  { month: '11月', phase: '最後席次', targetUnits: 1, actualUnits: 1, visitors: 12, digitalLeads: 8, digitalDeals: 0, actualRev: 38600000, adBudget: 120000, actualAd: 110000, construction: '設施維養', strategy: '【客層鎖定】退休置產/為子女置產 (強調資產配置)', action: '【簽約促動】針對猶豫客進行 總價/付款方式 試算' },
  { month: '12月', phase: '最後席次', targetUnits: 1, actualUnits: 0, visitors: 10, digitalLeads: 6, digitalDeals: 0, actualRev: 0, adBudget: 100000, actualAd: 100000, construction: '設施維養', strategy: '【銷售節奏】農曆年前/後 封關衝刺', action: '【現場活動】舉辦住戶回娘家/說明會' },
];

// --- 2026年 預估數據 ---
const initialData2026 = [
  { month: '1月', phase: '完銷衝刺', targetUnits: 1, actualUnits: 0, visitors: 8, digitalLeads: 3, digitalDeals: 0, actualRev: 0, adBudget: 80000, actualAd: 0, construction: '完工階段', strategy: '新春開工，針對返鄉客層回訪', action: '舉辦元宵節猜燈謎/手作活動' },
  { month: '2月', phase: '完銷衝刺', targetUnits: 1, actualUnits: 0, visitors: 6, digitalLeads: 2, digitalDeals: 0, actualRev: 0, adBudget: 60000, actualAd: 0, construction: '完工階段', strategy: '最後席次，價格堅持戰', action: '實品屋傢俱特賣會' },
  { month: '3月', phase: '完銷衝刺', targetUnits: 1, actualUnits: 0, visitors: 10, digitalLeads: 5, digitalDeals: 0, actualRev: 0, adBudget: 100000, actualAd: 0, construction: '完工階段', strategy: '329最後一波，搭配裝潢/家電專案', action: '針對已購客進行深度MGM開發' },
  { month: '4月', phase: '撤場準備', targetUnits: 1, actualUnits: 0, visitors: 8, digitalLeads: 4, digitalDeals: 0, actualRev: 0, adBudget: 50000, actualAd: 0, construction: '撤場點交', strategy: '針對自營商/醫生族群，強調無共用壁特色', action: '撤場倒數計時帆布廣告投放' },
  { month: '5月', phase: '撤場準備', targetUnits: 1, actualUnits: 0, visitors: 8, digitalLeads: 4, digitalDeals: 0, actualRev: 0, adBudget: 50000, actualAd: 0, construction: '撤場點交', strategy: '母親節檔期，主打E/G戶大坪數孝親/換屋', action: 'VIP客戶專屬導覽' },
  { month: '6月', phase: '結案撤場', targetUnits: 1, actualUnits: 0, visitors: 5, digitalLeads: 2, digitalDeals: 0, actualRev: 0, adBudget: 30000, actualAd: 0, construction: '結案報告', strategy: '撤場前最後一波出清活動', action: '舉辦社區管委會成立大會' },
  { month: '7月', phase: '結案撤場', targetUnits: 0, actualUnits: 0, visitors: 3, digitalLeads: 1, digitalDeals: 0, actualRev: 0, adBudget: 20000, actualAd: 0, construction: '保固服務', strategy: '社區營造活動，提升入住率與質感', action: '移交管委會相關文件' },
  { month: '8月', phase: '售後服務', targetUnits: 0, actualUnits: 0, visitors: 2, digitalLeads: 0, digitalDeals: 0, actualRev: 0, adBudget: 10000, actualAd: 0, construction: '保固服務', strategy: '民俗月沉澱，整理無效名單', action: '售後服務滿意度調查' },
  { month: '9月', phase: '售後服務', targetUnits: 0, actualUnits: 0, visitors: 2, digitalLeads: 0, digitalDeals: 0, actualRev: 0, adBudget: 10000, actualAd: 0, construction: '保固服務', strategy: '928檔期，配合社區質感完工', action: '社區公設維護檢修' },
  { month: '10月', phase: '售後服務', targetUnits: 0, actualUnits: 0, visitors: 2, digitalLeads: 0, digitalDeals: 0, actualRev: 0, adBudget: 10000, actualAd: 0, construction: '保固服務', strategy: '雙十連假，針對北客/竹科客群行銷', action: '舉辦社區秋季旅遊' },
  { month: '11月', phase: '售後服務', targetUnits: 0, actualUnits: 0, visitors: 2, digitalLeads: 0, digitalDeals: 0, actualRev: 0, adBudget: 10000, actualAd: 0, construction: '保固服務', strategy: '年底資產配置需求，鎖定高資產法人', action: '社區年度財務報告協助' },
  { month: '12月', phase: '售後服務', targetUnits: 0, actualUnits: 0, visitors: 2, digitalLeads: 0, digitalDeals: 0, actualRev: 0, adBudget: 10000, actualAd: 0, construction: '保固服務', strategy: '年底封關，最後倒數', action: '舉辦聖誕節社區互動活動' },
];

// --- 可編輯的業務資料 (依據報表更新) ---
const initialAgentData = [
  { id: 1, name: '宏興', target: 5, deals: 28, salesAmount: 1050000000 },
  { id: 2, name: '金芸', target: 4, deals: 18, salesAmount: 720000000 },
  { id: 3, name: '尚玟', target: 3, deals: 12, salesAmount: 450000000 },
  { id: 4, name: '宗哲', target: 3, deals: 12, salesAmount: 480000000 },
  { id: 5, name: '孟紋', target: 2, deals: 6, salesAmount: 240000000 },
  { id: 6, name: '霈綺', target: 2, deals: 3, salesAmount: 120000000 },
  { id: 7, name: '芯渝', target: 2, deals: 2, salesAmount: 80000000 },
];

// --- 可編輯的銷控表資料 (更新為81戶已售) ---
const initialSalesControl = [
  { id: 'A', type: 'A戶 (約45坪)', total: 14, sold: 12, avgPrice: 32000000 },
  { id: 'B', type: 'B戶 (約40坪)', total: 14, sold: 13, avgPrice: 28000000 },
  { id: 'C', type: 'C戶 (約50坪)', total: 14, sold: 11, avgPrice: 35000000 },
  { id: 'D', type: 'D戶 (約50坪)', total: 14, sold: 12, avgPrice: 34500000 },
  { id: 'E', type: 'E戶 (約56坪)', total: 14, sold: 11, avgPrice: 39000000 },
  { id: 'F', type: 'F戶 (約42坪)', total: 13, sold: 11, avgPrice: 29500000 },
  { id: 'G', type: 'G戶 (約60坪)', total: 13, sold: 10, avgPrice: 42000000 },
  { id: 'S', type: '店面', total: 1, sold: 1, avgPrice: 58000000 },
];

const initialProjectStats = {
  totalRev: 316667, // 萬元
  remainingRev: 57460, // 萬元
  totalUnits: 97,
  remainingUnits: 16,
  totalCars: 166,
  remainingCars: 33
};

const formatMoney = (value) => {
  if (value >= 100000000) return `${(value / 100000000).toFixed(2)}億`;
  if (value >= 10000) return `${(value / 10000).toFixed(0)}萬`;
  return value;
};

const Card = ({ title, value, subtext, icon: Icon, colorClass, highlight }) => (
  <div className={`bg-white p-5 rounded-xl shadow-sm border ${highlight ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100'} flex items-start justify-between`}>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subtext && <p className={`text-xs mt-2 ${colorClass}`}>{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${colorClass.replace('text-', 'bg-').replace('600', '100')}`}>
      <Icon className={`w-6 h-6 ${colorClass}`} />
    </div>
  </div>
);

export default function RealEstateSalesDashboard() {
  const [user, setUser] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, success, error

  const [year, setYear] = useState(2025);
  const [data2025, setData2025] = useState(initialData2025);
  const [data2026, setData2026] = useState(initialData2026);
  
  // 業務資料與銷控表現在是 State，可編輯
  const [agentData, setAgentData] = useState(initialAgentData);
  const [salesControlData, setSalesControlData] = useState(initialSalesControl);

  // 專案整體參數 (可編輯)
  const [projectStats, setProjectStats] = useState(initialProjectStats);

  const [activeTab, setActiveTab] = useState('dashboard');
  
  const currentData = year === 2025 ? data2025 : data2026;
  const setCurrentData = year === 2025 ? setData2025 : setData2026;

  // --- Auth & Data Loading ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Data when user is logged in
  useEffect(() => {
    if (!user) return;

    const dataRef = doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard_data', 'main');
    
    const unsubscribeSnapshot = onSnapshot(dataRef, (docSnap) => {
      if (docSnap.exists()) {
        const savedData = docSnap.data();
        if (savedData.data2025) setData2025(savedData.data2025);
        if (savedData.data2026) setData2026(savedData.data2026);
        if (savedData.agentData) setAgentData(savedData.agentData);
        if (savedData.salesControlData) setSalesControlData(savedData.salesControlData);
        if (savedData.projectStats) setProjectStats(savedData.projectStats);
      }
      setIsDataLoaded(true);
    }, (error) => {
      console.error("Error fetching data:", error);
      setIsDataLoaded(true); // Stop loading even if error
    });

    return () => unsubscribeSnapshot();
  }, [user]);

  // --- Save Function ---
  const handleSave = async () => {
    if (!user) return;
    setSaveStatus('saving');
    
    try {
      const dataRef = doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard_data', 'main');
      await setDoc(dataRef, {
        data2025,
        data2026,
        agentData,
        salesControlData,
        projectStats,
        lastUpdated: new Date().toISOString()
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error("Error saving data:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // --- 計算全案匯總數據 (來源：銷控表) ---
  const projectSummary = useMemo(() => {
    const totalUnits = salesControlData.reduce((acc, curr) => acc + Number(curr.total), 0);
    const totalSold = salesControlData.reduce((acc, curr) => acc + Number(curr.sold), 0);
    const estimatedTotalRev = salesControlData.reduce((acc, curr) => acc + (Number(curr.total) * Number(curr.avgPrice)), 0);
    const estimatedActualRev = salesControlData.reduce((acc, curr) => acc + (Number(curr.sold) * Number(curr.avgPrice)), 0);
    
    const sellThroughRate = totalUnits > 0 ? (totalSold / totalUnits * 100).toFixed(2) : 0;
    const remainingUnits = totalUnits - totalSold;
    const remainingRevenue = estimatedTotalRev - estimatedActualRev;

    return { totalUnits, totalSold, estimatedTotalRev, estimatedActualRev, remainingUnits, remainingRevenue, sellThroughRate };
  }, [salesControlData]);

  // --- 年度數據匯總 (來源：月報表) ---
  const yearSummary = useMemo(() => {
    const currentYearSoldUnits = currentData.reduce((acc, curr) => acc + curr.actualUnits, 0);
    const totalAdBudget = currentData.reduce((acc, curr) => acc + curr.adBudget, 0);
    const totalActualAd = currentData.reduce((acc, curr) => acc + curr.actualAd, 0);
    const cpa = currentYearSoldUnits > 0 ? (totalActualAd / currentYearSoldUnits).toFixed(0) : 0;
    
    return { currentYearSoldUnits, totalAdBudget, totalActualAd, cpa };
  }, [currentData]);


  // --- 處理函數 ---

  const handleValueChange = (index, field, value) => {
    const newData = [...currentData];
    newData[index][field] = ['strategy', 'action', 'construction', 'phase'].includes(field) ? value : Number(value);
    setCurrentData(newData);
  };
  
  const handleProjectStatsChange = (field, value) => {
    setProjectStats(prev => ({
      ...prev,
      [field]: Number(value)
    }));
  };

  const handleAgentChange = (id, field, value) => {
    const newAgentData = agentData.map(agent => 
      agent.id === id ? { ...agent, [field]: field === 'name' ? value : Number(value) } : agent
    );
    setAgentData(newAgentData);
  };

  const addAgent = () => {
    const newId = Math.max(...agentData.map(a => a.id), 0) + 1;
    setAgentData([...agentData, { id: newId, name: '新業務', target: 0, deals: 0, salesAmount: 0 }]);
  };

  const removeAgent = (id) => {
    setAgentData(agentData.filter(a => a.id !== id));
  };

  const handleSalesControlChange = (id, field, value) => {
    const newControlData = salesControlData.map(item => 
      item.id === id ? { ...item, [field]: field === 'type' ? value : Number(value) } : item
    );
    setSalesControlData(newControlData);
  };

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p>正在載入您的專案數據...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-6">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-6 h-6 text-indigo-700" />
              <h1 className="text-2xl font-bold text-slate-900">{DEFAULT_PROJECT_NAME}｜動態銷控儀表板</h1>
              <div className="ml-4 flex bg-slate-200 rounded-lg p-1">
                <button onClick={() => setYear(2025)} className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${year === 2025 ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>2025</button>
                <button onClick={() => setYear(2026)} className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${year === 2026 ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>2026 (完銷年)</button>
              </div>
            </div>
            <p className="text-slate-500 text-sm flex items-center gap-2">
              <Cloud className="w-4 h-4" /> 雲端同步中 | 狀態：{year === 2025 ? '成屋餘屋銷售期' : '完銷衝刺'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* SAVE BUTTON */}
            <button 
              onClick={handleSave} 
              disabled={saveStatus === 'saving'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm font-bold transition-all
                ${saveStatus === 'success' ? 'bg-green-600 text-white hover:bg-green-700' : 
                  saveStatus === 'error' ? 'bg-red-600 text-white' :
                  'bg-indigo-600 text-white hover:bg-indigo-700'}
              `}
            >
              {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
              {saveStatus === 'idle' && '儲存變更'}
              {saveStatus === 'saving' && '儲存中...'}
              {saveStatus === 'success' && '已儲存！'}
              {saveStatus === 'error' && '儲存失敗'}
            </button>

            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200 overflow-x-auto">
              {[
                { id: 'dashboard', label: '戰情總覽', icon: LayoutDashboard },
                { id: 'ledger', label: '月度執行表', icon: Database },
                { id: 'salesControl', label: '銷控與團隊', icon: Users }, 
                { id: 'strategy', label: '策略地圖', icon: Map },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Editable Key Metrics Bar */}
        <div className="bg-slate-800 text-white p-4 rounded-xl shadow-md grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
           <div>
             <span className="block text-slate-400 text-xs mb-1">總銷售額 (萬)</span>
             <input 
               type="number" 
               value={projectStats.totalRev} 
               onChange={(e) => handleProjectStatsChange('totalRev', e.target.value)}
               className="bg-transparent border-b border-slate-600 w-full font-mono font-bold text-lg focus:outline-none focus:border-indigo-400"
             />
           </div>
           <div>
             <span className="block text-slate-400 text-xs mb-1">剩餘總銷 (萬)</span>
             <input 
               type="number" 
               value={projectStats.remainingRev} 
               onChange={(e) => handleProjectStatsChange('remainingRev', e.target.value)}
               className="bg-transparent border-b border-slate-600 w-full font-mono font-bold text-lg text-emerald-400 focus:outline-none focus:border-emerald-400"
             />
           </div>
           <div>
             <span className="block text-slate-400 text-xs mb-1">總戶數</span>
             <input 
               type="number" 
               value={projectStats.totalUnits} 
               onChange={(e) => handleProjectStatsChange('totalUnits', e.target.value)}
               className="bg-transparent border-b border-slate-600 w-full font-mono font-bold text-lg focus:outline-none focus:border-indigo-400"
             />
           </div>
           <div>
             <span className="block text-slate-400 text-xs mb-1">剩餘戶數</span>
             <input 
               type="number" 
               value={projectStats.remainingUnits} 
               onChange={(e) => handleProjectStatsChange('remainingUnits', e.target.value)}
               className="bg-transparent border-b border-slate-600 w-full font-mono font-bold text-lg text-rose-400 focus:outline-none focus:border-rose-400"
             />
           </div>
           <div>
             <span className="block text-slate-400 text-xs mb-1">可銷車位</span>
             <input 
               type="number" 
               value={projectStats.totalCars} 
               onChange={(e) => handleProjectStatsChange('totalCars', e.target.value)}
               className="bg-transparent border-b border-slate-600 w-full font-mono font-bold text-lg focus:outline-none focus:border-indigo-400"
             />
           </div>
           <div>
             <span className="block text-slate-400 text-xs mb-1">剩餘車位</span>
             <input 
               type="number" 
               value={projectStats.remainingCars} 
               onChange={(e) => handleProjectStatsChange('remainingCars', e.target.value)}
               className="bg-transparent border-b border-slate-600 w-full font-mono font-bold text-lg text-amber-400 focus:outline-none focus:border-amber-400"
             />
           </div>
        </div>
      </header>

      {/* Top KPI Cards (Dynamic from Sales Control) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card 
          title="全案銷售率 (Sell-through)" 
          value={`${((projectStats.totalUnits - projectStats.remainingUnits) / projectStats.totalUnits * 100).toFixed(2)}%`} 
          subtext={`已售 ${projectStats.totalUnits - projectStats.remainingUnits} / 總戶數 ${projectStats.totalUnits} (剩餘 ${projectStats.remainingUnits} 戶)`}
          icon={PieIcon} 
          colorClass="text-indigo-600"
          highlight={true}
        />
        <Card 
          title="剩餘總銷金額 (萬)" 
          value={Number(projectStats.remainingRev).toLocaleString()} 
          subtext={`全案預估總銷 ${Number(projectStats.totalRev).toLocaleString()}`}
          icon={Wallet} 
          colorClass="text-emerald-600" 
        />
        <Card 
          title={`${year} 年度成交`} 
          value={`${yearSummary.currentYearSoldUnits} 戶`} 
          subtext={`本年度營收貢獻 ${formatMoney(currentData.reduce((acc, curr) => acc + curr.actualRev, 0))}`}
          icon={CheckCircle2} 
          colorClass="text-blue-600" 
        />
        <Card 
          title="廣告預算執行 (本年度)" 
          value={formatMoney(yearSummary.totalActualAd)} 
          subtext={`CPA: ${yearSummary.cpa > 0 ? '$' + Number(yearSummary.cpa).toLocaleString() : 'N/A'} / 戶`}
          icon={TrendingUp} 
          colorClass="text-amber-600" 
        />
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px]">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="p-6 space-y-8">
            <div className="h-[400px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <TrendingUp className="w-5 h-5 text-indigo-600"/>
                  {year} 年度銷售速度與來人趨勢
                </h3>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#64748b" label={{ value: '組數', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" label={{ value: '成交戶數', angle: -90, position: 'insideRight' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="visitors" name="來人組數" fill="#818cf8" barSize={30} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="step" dataKey="actualUnits" name="實際成交" stroke="#f59e0b" strokeWidth={3} dot={{r:4, fill:'#f59e0b'}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 2: LEDGER */}
        {activeTab === 'ledger' && (
          <div className="overflow-x-auto pb-12">
            <div className="p-4 bg-yellow-50 border-b border-yellow-100 text-sm text-yellow-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4"/>
              提示：您可以直接在「階段」欄位輸入文字，或使用下拉選單選擇策略。
            </div>
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="p-3 sticky left-0 bg-slate-50 z-10 w-20">月份</th>
                  <th className="p-3 w-32">階段 (可手動輸入)</th>
                  <th className="p-3 w-20 text-center bg-blue-50/50">來人</th>
                  <th className="p-3 w-20 text-center bg-blue-50/50">成交</th>
                  <th className="p-3 w-24 text-center bg-green-50/50">轉換率</th>
                  <th className="p-3 w-64">策略重點 (可選/可填)</th>
                  <th className="p-3 w-64">行動方案 (可選/可填)</th>
                  <th className="p-3 w-28 text-right">實銷金額</th>
                  <th className="p-3 w-24 text-right">廣告花費</th>
                  <th className="p-3 w-20 text-center">CPA</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {currentData.map((row, index) => {
                  const visitRate = row.visitors > 0 ? (row.actualUnits / row.visitors * 100).toFixed(1) : 0;
                  const rowCpa = row.actualUnits > 0 ? (row.actualAd / row.actualUnits).toFixed(0) : 0;
                  return (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-700 sticky left-0 bg-white z-10">{row.month}</td>
                      <td className="p-3">
                        <input 
                          type="text" 
                          value={row.phase} 
                          onChange={(e) => handleValueChange(index, 'phase', e.target.value)} 
                          className="w-full border border-slate-200 p-1 rounded text-xs bg-slate-50 focus:bg-white"
                        />
                      </td>
                      <td className="p-3 bg-blue-50/20"><input type="number" value={row.visitors} onChange={(e) => handleValueChange(index, 'visitors', e.target.value)} className="w-full border border-slate-200 p-1 rounded text-center" /></td>
                      <td className="p-3 bg-blue-50/20"><input type="number" value={row.actualUnits} onChange={(e) => handleValueChange(index, 'actualUnits', e.target.value)} className="w-full border border-indigo-200 p-1 rounded text-center font-bold text-indigo-700" /></td>
                      <td className="p-3 text-center font-bold bg-green-50/20 text-slate-600">{visitRate}%</td>
                      
                      {/* Smart Inputs */}
                      <td className="p-3">
                        <CreatableSelect 
                          value={row.strategy} 
                          options={STRATEGY_OPTIONS} 
                          onChange={(val) => handleValueChange(index, 'strategy', val)}
                          placeholder="輸入或選擇策略"
                        />
                      </td>
                      <td className="p-3">
                        <CreatableSelect 
                          value={row.action} 
                          options={ACTION_OPTIONS} 
                          onChange={(val) => handleValueChange(index, 'action', val)}
                          placeholder="輸入或選擇行動"
                        />
                      </td>

                      <td className="p-3 text-right text-xs text-slate-500"><input type="number" value={row.actualRev} onChange={(e) => handleValueChange(index, 'actualRev', e.target.value)} className="w-full text-right border-none bg-transparent focus:ring-0 p-0" /></td>
                      <td className="p-3 text-right text-xs text-slate-500"><input type="number" value={row.actualAd} onChange={(e) => handleValueChange(index, 'actualAd', e.target.value)} className="w-full text-right border-none bg-transparent focus:ring-0 p-0" /></td>
                      <td className="p-3 text-center text-xs text-slate-400">${Number(rowCpa).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: SALES CONTROL & TEAM (New Combined Tab) */}
        {activeTab === 'salesControl' && (
          <div className="p-6 space-y-8 bg-slate-50/50 min-h-[600px]">
            
            {/* Section 1: Inventory Control (Sales Control Sheet) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-2">
                   <Building2 className="w-5 h-5 text-indigo-600"/>
                   <h3 className="text-lg font-bold text-slate-800">銷控表管理 (Inventory Control)</h3>
                   <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">可編輯</span>
                 </div>
                 <div className="text-sm text-slate-500">
                   目前銷售率: <span className="font-bold text-indigo-600 text-lg">{((projectStats.totalUnits - projectStats.remainingUnits) / projectStats.totalUnits * 100).toFixed(2)}%</span>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 {/* Control Table */}
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm border border-slate-200">
                     <thead className="bg-slate-50 text-slate-600">
                       <tr>
                         <th className="p-3 border-b">戶型名稱</th>
                         <th className="p-3 border-b w-20 text-center">總戶數</th>
                         <th className="p-3 border-b w-20 text-center bg-indigo-50">已售</th>
                         <th className="p-3 border-b w-20 text-center">剩餘</th>
                         <th className="p-3 border-b w-32 text-right bg-indigo-50">成交均價(估)</th>
                         <th className="p-3 border-b w-24 text-center">去化率</th>
                       </tr>
                     </thead>
                     <tbody>
                       {salesControlData.map((item) => {
                         const rate = item.total > 0 ? (item.sold / item.total * 100).toFixed(0) : 0;
                         const remaining = item.total - item.sold;
                         return (
                           <tr key={item.id} className="border-b hover:bg-slate-50 group">
                             <td className="p-2 font-medium">
                               <input value={item.type} onChange={(e) => handleSalesControlChange(item.id, 'type', e.target.value)} className="w-full bg-transparent border-b border-transparent group-hover:border-slate-300 focus:border-indigo-500 focus:ring-0 font-bold text-slate-700" />
                             </td>
                             <td className="p-2 text-center"><input type="number" value={item.total} onChange={(e) => handleSalesControlChange(item.id, 'total', e.target.value)} className="w-full text-center border border-slate-200 rounded p-1 focus:ring-2 focus:ring-indigo-500" /></td>
                             <td className="p-2 text-center bg-indigo-50/30"><input type="number" value={item.sold} onChange={(e) => handleSalesControlChange(item.id, 'sold', e.target.value)} className="w-full text-center border border-indigo-200 rounded p-1 font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500" /></td>
                             <td className="p-2 text-center font-mono text-slate-500">{remaining}</td>
                             <td className="p-2 text-right bg-indigo-50/30"><input type="number" value={item.avgPrice} onChange={(e) => handleSalesControlChange(item.id, 'avgPrice', e.target.value)} className="w-full text-right border border-indigo-200 rounded p-1 text-xs focus:ring-2 focus:ring-indigo-500" /></td>
                             <td className="p-2">
                               <div className="flex items-center gap-2">
                                 <div className="w-full bg-slate-200 rounded-full h-1.5">
                                   <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${rate}%` }}></div>
                                 </div>
                                 <span className="text-xs">{rate}%</span>
                               </div>
                             </td>
                           </tr>
                         )
                       })}
                     </tbody>
                   </table>
                 </div>

                 {/* Visual Summary */}
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-center">
                   <h4 className="font-bold text-slate-700 mb-4 text-center">主力戶型去化分佈</h4>
                   <div className="flex flex-wrap justify-center gap-4">
                     {salesControlData.filter(i => i.total > 0).map((unit, index) => {
                         const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1'];
                         return (
                           <div key={index} className="flex flex-col items-center">
                              <PieChart width={80} height={80}>
                                <Pie
                                  data={[{ value: unit.sold, fill: colors[index % colors.length] }, { value: unit.total - unit.sold, fill: '#e2e8f0' }]}
                                  cx="50%" cy="50%" innerRadius={25} outerRadius={35} dataKey="value" startAngle={90} endAngle={-270}
                                />
                              </PieChart>
                              <span className="text-xs font-bold text-slate-600 mt-1">{unit.id}戶</span>
                              <span className="text-[10px] text-slate-400">{unit.sold}/{unit.total}</span>
                           </div>
                         )
                     })}
                   </div>
                 </div>
               </div>
            </div>

            {/* Section 2: Sales Team Management */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600"/>
                  <h3 className="text-lg font-bold text-slate-800">業務戰力與業績管理</h3>
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">可編輯</span>
                </div>
                <button onClick={addAgent} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 transition-colors">
                  <Plus className="w-3 h-3"/> 新增業務
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <th className="p-3 font-semibold w-32">姓名</th>
                      <th className="p-3 font-semibold text-center w-24">目標戶數</th>
                      <th className="p-3 font-semibold text-center w-24 bg-emerald-50">已成交</th>
                      <th className="p-3 font-semibold text-right w-40 bg-emerald-50">個人總銷金額</th>
                      <th className="p-3 font-semibold text-center w-32">達成率</th>
                      <th className="p-3 font-semibold text-center w-24">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentData.sort((a, b) => b.salesAmount - a.salesAmount).map((agent) => {
                      const achievement = agent.target > 0 ? (agent.deals / agent.target * 100).toFixed(0) : 0;
                      return (
                        <tr key={agent.id} className="border-b border-slate-100 hover:bg-slate-50 group">
                          <td className="p-3 font-bold text-slate-700">
                            <input value={agent.name} onChange={(e) => handleAgentChange(agent.id, 'name', e.target.value)} className="w-full bg-transparent border-b border-transparent group-hover:border-slate-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-0" />
                          </td>
                          <td className="p-3 text-center"><input type="number" value={agent.target} onChange={(e) => handleAgentChange(agent.id, 'target', e.target.value)} className="w-16 text-center border border-slate-200 rounded p-1 focus:ring-2 focus:ring-indigo-500" /></td>
                          <td className="p-3 text-center bg-emerald-50/50"><input type="number" value={agent.deals} onChange={(e) => handleAgentChange(agent.id, 'deals', e.target.value)} className="w-16 text-center border border-emerald-200 rounded p-1 font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500" /></td>
                          <td className="p-3 text-right relative bg-emerald-50/50">
                             <div className="relative">
                               <span className="absolute left-2 top-1.5 text-xs text-slate-400">$</span>
                               <input type="number" value={agent.salesAmount} onChange={(e) => handleAgentChange(agent.id, 'salesAmount', e.target.value)} className="w-full text-right border border-emerald-200 rounded p-1 pl-6 focus:ring-2 focus:ring-emerald-500" />
                             </div>
                          </td>
                          <td className="p-3 text-center">
                             <span className={`px-2 py-1 rounded text-xs font-bold ${Number(achievement) >= 100 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                               {achievement}%
                             </span>
                          </td>
                          <td className="p-3 text-center">
                            <button onClick={() => removeAgent(agent.id)} className="text-slate-400 hover:text-red-500 p-1 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <td className="p-3">總計</td>
                      <td className="p-3 text-center">{agentData.reduce((a,c) => a + Number(c.target), 0)}</td>
                      <td className="p-3 text-center">{agentData.reduce((a,c) => a + Number(c.deals), 0)}</td>
                      <td className="p-3 text-right text-indigo-700">{formatMoney(agentData.reduce((a,c) => a + Number(c.salesAmount), 0))}</td>
                      <td className="p-3" colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STRATEGY MAP (With Dropdowns) */}
        {activeTab === 'strategy' && (
          <div className="p-6 bg-slate-50/50 min-h-[600px]">
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {currentData.map((item, index) => (
                <div key={index} className={`relative bg-white p-5 rounded-xl border ${item.phase.includes('強銷') || item.phase.includes('衝刺') ? 'border-l-4 border-l-red-500 border-y-slate-200 border-r-slate-200' : 'border-slate-200'} shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-800 text-white w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
                        {item.month}
                      </div>
                      <div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600`}>
                          {item.phase}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-slate-700">
                          <HardHat className="w-4 h-4 text-amber-500" />
                          工程：
                          <input 
                            value={item.construction || ''}
                            onChange={(e) => handleValueChange(index, 'construction', e.target.value)}
                            placeholder="輸入進度..."
                            className="border-b border-dashed border-slate-300 focus:border-indigo-500 outline-none bg-transparent w-32"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400">成交目標 / 達成率</p>
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex items-center bg-indigo-50 rounded px-2 py-1">
                            <input 
                              type="number"
                              value={item.targetUnits}
                              onChange={(e) => handleValueChange(index, 'targetUnits', e.target.value)}
                              className="w-8 bg-transparent text-center font-bold text-indigo-600 border-none p-0 focus:ring-0"
                            />
                            <span className="text-indigo-400 text-xs">戶</span>
                          </div>
                          <div className={`text-xs font-bold px-2 py-1 rounded ${item.actualUnits >= item.targetUnits && item.targetUnits > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                            {item.targetUnits > 0 ? Math.round(item.actualUnits / item.targetUnits * 100) : 0}%
                          </div>
                        </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex justify-between">
                        銷售策略
                        <span className="text-[10px] text-slate-400 font-normal">↓ 可下拉選擇或直接輸入文字</span>
                      </label>
                      <CreatableSelect 
                          value={item.strategy} 
                          options={STRATEGY_OPTIONS} 
                          onChange={(val) => handleValueChange(index, 'strategy', val)}
                          placeholder="請輸入或選擇本月策略..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">行動方案</label>
                      <CreatableSelect 
                          value={item.action} 
                          options={ACTION_OPTIONS} 
                          onChange={(val) => handleValueChange(index, 'action', val)}
                          placeholder="請輸入或選擇執行方案..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
