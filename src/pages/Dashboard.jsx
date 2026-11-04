import React, { useState, useEffect, useRef } from 'react';
import LogoImg from '../assets/logo.png'; 
import GridDistortion from '../components/ui/GridDistortion.jsx';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { exportToExcel, exportToPDF } from '../utils/exportFiles.js';
import { API_BASE_URL } from '../utils/api.js';
import { buildAiReply, buildWelcomeMessage, getSuggestedQuestions } from '../utils/aiAssistant.js';


const SECTOR_PROFILES = {
  'Heavy Industry / Sənaye': { co2: 1, energy: 1, water: 1, waste: 1, hse: 1, training: 1 },
  'Green Energy Production': { co2: 0.4, energy: 0.7, water: 0.35, waste: 1.15, hse: 1.1, training: 1.3 },
  'Oil & Gas Refinery': { co2: 1.7, energy: 1.5, water: 1.4, waste: 0.8, hse: 0.95, training: 0.9 }
};

const globalFont = '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
const darkNeonImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23050816'/><stop offset='40%' stop-color='%230b113a'/><stop offset='80%' stop-color='%231b114d'/><stop offset='100%' stop-color='%23050816'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><circle cx='300' cy='200' r='500' fill='%231a2eb5' opacity='0.25' filter='blur(120px)'/><circle cx='1600' cy='800' r='600' fill='%2356118c' opacity='0.2' filter='blur(150px)'/></svg>";

const translations = {
  az: {
    overview: "Ümumi Panel", envData: "Ekoloji Data", socialG: "Sosial Göstəricilər", govG: "İdarəetmə", profSet: "Profil Ayarları",
    liveSys: "● Canlı ESG Sistemi", contactSupport: "📞 Əlaqə & Dəstək", logout: "Çıxış", panelSub: "Sənaye müəssisələri üçün canlı ESG paneli",
    welcome: "Xoş Gəldiniz", scope1: "Scope 1 - Stasionar Yanma", scope2: "Scope 2 - Elektrik İstehlakı",
    socialScore: "Sosial Davamlılıq Skoru", corpGov: "Korporativ İdarəetmə", perfect: "Mükəmməl", high: "Yüksək", optimal: "Optimal",
    chartTitle1: "Aylıq Ümumi Karbon Emissiya Trendi vs Optimal Hədəf", waterCons: "Su İstehlakı (Cari Ay)",
    greenEnergy: "Yaşıl Enerji İnteqrasiyası", wasteUtil: "Tullantıların Utilizasiya Payı", saving: "Qənaət", artim: "Artım",
    segmentTitle: "Karbon Ayaq İzinin Seqmentasiyası", tableTitle1: "📋 12 Aylıq Detallı Ekoloji Resurs Hesabatı",
    month: "Ay", s1Em: "Scope 1 Emissiya", s2Em: "Scope 2 Emissiya", waterI: "Su İstehlakı", greenE: "Yaşıl Enerji",
    hseDays: "İnsidentsiz İş Günləri (HSE)", avgTrain: "Heyətin Orta Təlim Saatı", turnOver: "Kadr Axını Faizi", low: "Çox Aşağı",
    socialInd: "Sosial Performans İndeksləri (100 tam xal üzərindən)", tableTitle2: "📋 12 Aylıq Sosial Korporativ Məsuliyyət Hesabatı",
    hsePeriod: "HSE Dövrü", workerSat: "İşçi Məmnuniyyəti", trainVol: "Təlim Həcmi", staffAx: "Kadr Axını",
    radarTitle: "İdarəetmə Göstəricilərinin Şəbəkəsi (Radar)", griComp: "GRI Standart Uyğunluğu", eticTrain: "Etika Şəffaflıq Təlimi",
    tableTitle3: "📋 12 Aylıq Korporativ İdarəetmə & Audit Hesabatı", period: "Dövr", griIdx: "GRI İndeks Uyğunluğu", transparencyDeg: "Şəffaflıq Dərəcəsi",
    kiberTrain: "Kiber Təhlükəsizlik Təlimi", breach: "Qanun Pozuntusu", profTitle: "👤 Çoxfunksiyalı Müəssisə Profili",
    corpIdentity: "🏢 Korporativ Kimlik & İnteqrasiya", compNameLabel: "Müəssisənin Rəsmi Adı", adminEmailLabel: "Sistem Administrator E-poçtu",
    indSector: "Sənaye Sektoru", sysSec: "🔐 Sistem Təhlükəsizliyi", newPass: "Yeni Şifrə", saveBtn: "Dəyişiklikləri Yadda Saxla",
    sysLoc: "⚙️ Sistem Lokalizasiyası", esgLang: "ESG Hesabat Dili", aiNotifyCent: "🔔 AI Ağıllı Bildiriş Mərkəzi",
    logoSeal: "📋 Rəsmi E-Möhür & Loqo İnteqrasiya", logoDesc: "PDF/Excel çıxarışlarında emblem görünməsi üçün sənəd yükləyin.", selectFile: "Fayl Seçin",
    contactTitle: "📞 Əlaqə & Texniki Dəstək", office: "Mərkəzi Ofis", close: "Bağla", chatPlaceholder: "İstənilən sualınızı yazın...", avatarLabel: "📸 Profil Şəkli / Müəssisə Loqosu",
    aiAnalysisBtn: "🧠 AI Risk Analizi & ESG Tövsiyəsi Al", aiResponseText: "AI təhlil edir... Göstəricilər qorunur və yaşıl zonadadır."
  },
  en: {
    overview: "Overview Dashboard", envData: "Environmental Data", socialG: "Social Indicators", govG: "Governance", profSet: "Profile Settings",
    liveSys: "● Live ESG System", contactSupport: "📞 Contact & Support", logout: "Logout", panelSub: "Live ESG dashboard for industrial enterprises",
    welcome: "Welcome", scope1: "Scope 1 - Stationary Combustion", scope2: "Scope 2 - Electricity Consumption",
    socialScore: "Social Sustainability Score", corpGov: "Corporate Governance", perfect: "Excellent", high: "High", optimal: "Optimal",
    chartTitle1: "Monthly Carbon Emission Trend vs Optimal Target", waterCons: "Water Consumption (Current Month)",
    greenEnergy: "Renewable Energy Share", wasteUtil: "Waste Recycling Index", saving: "Savings", artim: "Growth",
    segmentTitle: "Carbon Footprint Segmentation", tableTitle1: "📋 12-Month Environmental Resource Report",
    month: "Month", s1Em: "Scope 1 Emission", s2Em: "Scope 2 Emission", waterI: "Water Consumption", greenE: "Green Energy",
    hseDays: "Days Without Incident (HSE)", avgTrain: "Average Staff Training Hours", turnOver: "Staff Turnover Rate", low: "Very Low",
    socialInd: "Social Performance Indexes (Out of 100)", tableTitle2: "📋 12-Month Corporate Social Responsibility Report",
    hsePeriod: "HSE Period", workerSat: "Employee Satisfaction", trainVol: "Training Volume", staffAx: "Staff Turnover",
    radarTitle: "Governance Indicator Network (Radar)", griComp: "GRI Standard Compliance", eticTrain: "Ethics & Transparency Training",
    tableTitle3: "📋 12-Month Corporate Governance & Audit Report", period: "Period", griIdx: "GRI Index Compliance", transparencyDeg: "Transparency Degree",
    kiberTrain: "Cybersecurity Training", breach: "Law Violation", profTitle: "👤 Multifunctional Enterprise Profile",
    corpIdentity: "🏢 Corporate Identity & Integration", compNameLabel: "Official Enterprise Name", adminEmailLabel: "System Admin Email",
    indSector: "Industrial Sector", sysSec: "🔐 System Security", newPass: "New Password", saveBtn: "Save Changes",
    sysLoc: "⚙️ System Localization", esgLang: "ESG Report Language", aiNotifyCent: "🔔 Smart Notification Center AI",
    logoSeal: "📋 Official E-Seal & Logo Integration", logoDesc: "Upload a document for the emblem to appear in PDF/Excel exports.", selectFile: "Select File",
    contactTitle: "📞 Contact & Technical Support", office: "Head Office", close: "Close", chatPlaceholder: "Ask me anything...", avatarLabel: "📸 Profile Picture / Enterprise Logo",
    aiAnalysisBtn: "🧠 Get AI Risk Analysis & ESG Recommendations", aiResponseText: "AI analyzing... Metrics are secure and in the green zone."
  },
  ru: {
    overview: "Общая Панель", envData: "Экологические Данные", socialG: "Социальные Показатели", govG: "Управление", profSet: "Настройки Профиля",
    liveSys: "● Живая Система ESG", contactSupport: "📞 Связь и Поддержка", logout: "Выход", panelSub: "Живая панель ESG для промышленных предприятий",
    welcome: "Добро пожаловать", scope1: "Scope 1 - Стационарное Сгорание", scope2: "Scope 2 - Потребление Электроэнергии",
    socialScore: "Индекс Социальной Устойчивости", corpGov: "Corporate Governance", perfect: "Отлично", high: "Высокий", optimal: "Оптимальный",
    chartTitle1: "Ежемесячный Тренд Выбросов Углерода vs Оптимальная Цель", waterCons: "Потребление Воды (Текущий Месяц)",
    greenEnergy: "Доля Возобновляемой Энергии", wasteUtil: "Индекс Утилизации Отходов", saving: "Экономия", artim: "Рост",
    segmentTitle: "Сегментация Углеродного Следа", tableTitle1: "📋 12-Месячный Отчет об Экологических Ресурсах",
    month: "Месяц", s1Em: "Выбросы Scope 1", s2Em: "Выбросы Scope 2", waterI: "Потребление Воды", greenE: "Чистая Энергия",
    hseDays: "Дни Без Происшествий (HSE)", avgTrain: "Средние Часы Обучения Персонала", turnOver: "Текучесть Кадров", low: "Очень Низкий",
    socialInd: "Социальные Показатели Эффективности (из 100)", tableTitle2: "📋 12-Месячный Отчет о Социальной Ответственности",
    hsePeriod: "Период HSE", workerSat: "Удовлетворенность Сотрудников", trainVol: "Объем Обучения", staffAx: "Текучесть",
    radarTitle: "Сеть Показателей Управления (Радар)", griComp: "Соответствие Стандартам GRI", eticTrain: "Обучение Этике и Прозрачности",
    tableTitle3: "📋 12-Месячный Отчет о Корпоративном Управлении и Аудите", period: "Период", griIdx: "Соответствие Индексу GRI", transparencyDeg: "Степень Прозрачности",
    kiberTrain: "Обучение Кибербезопасности", breach: "Нарушения", profTitle: "👤 Настройки Профиля Предприятия",
    corpIdentity: "🏢 Корпоративная Идентичность и Интеграция", compNameLabel: "Официальное Название Предприятия", adminEmailLabel: "Email Системного Админа",
    indSector: "Промышленный Сектор", sysSec: "🔐 Безопасность Системы", newPass: "Новый Пароль", saveBtn: "Сохранить Изменения",
    sysLoc: "⚙️ Локализация Системы", esgLang: "Язык Отчетов ESG", aiNotifyCent: "🔔 Смарт Центр Уведомлений AI",
    logoSeal: "📋 Официальная Э-Печать и Интеграция Логотипа", logoDesc: "Загрузите документ, чтобы эмблема появилась в экспорте PDF/Excel.", selectFile: "Выбрать Файл",
    contactTitle: "📞 Связь и Техническая Поддержка", office: "Главный Офис", close: "Закрыть", chatPlaceholder: "Задайте любой вопрос...", avatarLabel: "📸 Изображение Профиля / Логотип",
    aiAnalysisBtn: "🧠 Получить AI Анализ Рисков и Рекомендации ESG", aiResponseText: "AI анализирует... Показатели в зеленой зоне и защищены."
  }
};

const LocalCountUp = ({ to, from = 0, duration = 1.2 }) => {
  const ref = useRef(null);
  useEffect(() => {
    let start = from;
    const end = parseInt(to);
    if (isNaN(end) || start === end) return;
    const totalMiliseconds = duration * 1000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(totalMiliseconds / frameRate);
    let currentFrame = 0;
    const counter = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const easeOutQuad = progress * (2 - progress);
      const currentValue = Math.round(from + (end - from) * easeOutQuad);
      if (ref.current) ref.current.textContent = currentValue;
      if (currentFrame >= totalFrames) {
        clearInterval(counter);
        if (ref.current) ref.current.textContent = end;
      }
    }, frameRate);
    return () => clearInterval(counter);
  }, [to, from, duration]);
  return <span ref={ref}>{from}</span>;
};

const renderRichText = (text) => {
  const parts = String(text || '').split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} style={{ color: '#00FF87' }}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

const Dashboard = ({ onLogout, userEmail, companyName, token }) => {
  const [lang, setLang] = useState('az');
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState('overview');
  const [profileName, setProfileName] = useState(companyName || localStorage.getItem('bg_company_name') || "BlueGreen Müəssisə");
  const [profileEmail, setProfileEmail] = useState(userEmail || localStorage.getItem('bg_user_email') || "admin@bluegreen.az");
  const [newPass, setNewPass] = useState(''); 
  const [industrySector, setIndustrySector] = useState('Heavy Industry / Sənaye'); 
  const [avatarSrc, setAvatarSrc] = useState(null);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false); 
  const [aiMeta, setAiMeta] = useState({ configured: false, provider: null, model: null });
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  const [activeAlert, setActiveAlert] = useState(null);

  const [metrics, setMetrics] = useState({
    co2: 44,
    energy: 48,
    water: 3500,
    waste: 76,
    hse: 320,
    training: 18
  });

  const [historyData, setHistoryData] = useState([
    { name: '00:00', 'CO₂ (Ton)': 42, 'Enerji (kWh)': 310, 'Su (m³)': 120 }
  ]);

  useEffect(() => {
    const fetchLiveSensorData = async () => {
      try {
        const activeToken = token || localStorage.getItem('esg_token'); 
        if (!activeToken) {
          onLogout();
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/sensors/live`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          }
        });

        if (res.status === 401 || res.status === 403) {
          console.warn("Sessiyanın vaxtı bitib. Çıxış edilir...");
          alert(lang === 'az' ? "🔒 Sessiyanızın vaxtı bitmişdir. Yenidən daxil olun." : "🔒 Session expired. Please login again.");
          onLogout();
          return;
        }

        if (res.ok) {
          const latestData = await res.json();
          const profile = SECTOR_PROFILES[industrySector] || SECTOR_PROFILES['Heavy Industry / Sənaye'];

          setMetrics({
            co2: Math.round((latestData.co2Emission || 44) * profile.co2),
            energy: Math.round((latestData.energyConsumption || 48) * profile.energy),
            water: Math.round((latestData.waterUsage || 3500) * profile.water),
            waste: Number(((latestData.wasteRecycled || 76) * profile.waste).toFixed(1)),
            hse: Math.round((latestData.hseIncidents || 320) * profile.hse),
            training: Number(((latestData.trainingHours || 18) * profile.training).toFixed(1))
          });

          if (latestData.co2Emission > 75) {
            setActiveAlert({
              type: 'danger',
              title: lang === 'az' ? '🚨 Kritik CO₂ Emissiyası!' : '🚨 Critical CO₂ Emission!',
              message: lang === 'az' 
                ? `Müəssisədə CO₂ səviyyəsi ${Math.round(latestData.co2Emission)} tCO₂e həddinə çatdı! Təcili filtrləri yoxlayın.` 
                : `CO₂ level reached ${Math.round(latestData.co2Emission)} tCO₂e! Check filters immediately.`
            });
          } else if (latestData.energyConsumption > 70) {
            setActiveAlert({
              type: 'warning',
              title: lang === 'az' ? '⚠️ Yüksək Enerji İstehlakı!' : '⚠️ High Energy Consumption!',
              message: lang === 'az'
                ? `Elektrik istehlakı ${Math.round(latestData.energyConsumption)} kWh keçdi. Yaşıl enerji alternativlərini yoxlayın.`
                : `Electricity usage exceeded ${Math.round(latestData.energyConsumption)} kWh. Verify renewable backup.`
            });
          } else {
            setActiveAlert(null);
          }

          const timeString = new Date(latestData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          setHistoryData(prev => {
            const updated = [...prev, {
              name: timeString,
              'CO₂ (Ton)': Number((latestData.co2Emission * profile.co2).toFixed(2)),
              'Enerji (kWh)': Number((latestData.energyConsumption * profile.energy).toFixed(2)),
              'Su (m³)': Math.round(latestData.waterUsage * profile.water)
            }];
            if (updated.length > 12) updated.shift();
            return updated;
          });
        }
      } catch (err) {
        console.error("Canlı sensor datası qoşulmasında xəta:", err.message);
      }
    };

    fetchLiveSensorData();
    const interval = setInterval(fetchLiveSensorData, 20000); 
    return () => clearInterval(interval);
  }, [token, onLogout, lang, industrySector]);

  // Real LLM provayderinin qoşulub-qoşulmadığını yoxlayırıq.
  useEffect(() => {
    let cancelled = false;

    const loadAiStatus = async () => {
      const activeToken = token || localStorage.getItem('esg_token');
      if (!activeToken) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/ai/status`, {
          headers: { 'Authorization': `Bearer ${activeToken}` }
        });
        if (!response.ok) return;

        const data = await response.json();
        if (!cancelled) {
          setAiMeta({
            configured: Boolean(data.configured),
            provider: data.provider || null,
            model: data.model || null
          });
        }
      } catch (err) {
        console.warn('AI statusu yoxlanılmadı:', err.message);
      }
    };

    loadAiStatus();
    return () => { cancelled = true; };
  }, [token]);

  
  useEffect(() => {
    const styleId = 'star-border-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        @keyframes starBorderAnim { 0% { transform: rotate(0deg); opacity: 0.8; } 50% { opacity: 1; } 80% { opacity: 0; } 100% { transform: rotate(360deg); opacity: 0; } }
        .star-border-card { position: relative; border-radius: 20px; overflow: hidden; background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(15px); z-index: 1; }
        .star-border-card::before { content: ''; position: absolute; width: 200%; height: 200%; top: -50%; left: -50%; background: conic-gradient(from 0deg, transparent 70%, #9d4edd 85%, #2b44ff 95%, transparent 100%); animation: starBorderAnim 4s linear infinite; z-index: -2; }
        .star-border-card::after { content: ''; position: absolute; inset: 1px; background: #06091f; border-radius: 19px; z-index: -1; }
        
        @keyframes neonPulse { 0% { box-shadow: 0 0 5px #ff4b4b, inset 0 0 5px #ff4b4b; } 50% { box-shadow: 0 0 20px #ff2222, inset 0 0 10px #ff2222; border-color: #ff2222; } 100% { box-shadow: 0 0 5px #ff4b4b, inset 0 0 5px #ff4b4b; } }
        .neon-alert-box { animation: neonPulse 2s infinite alternate; border: 1px solid #ff4b4b; background: rgba(255, 75, 75, 0.15) !important; backdrop-filter: blur(15px); }

        .esg-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; text-align: left; font-size: 0.95rem; }
        .esg-table th { padding: 1.2rem 1rem; background: rgba(255, 255, 255, 0.05); color: #00D2FF; font-weight: 600; border-bottom: 2px solid rgba(255, 255, 255, 0.1); }
        .esg-table td { padding: 1.2rem 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.04); color: #d0d7e2; }
        .esg-table tr:hover { background: rgba(255, 255, 255, 0.03); }
        .profile-input { padding: 0.8rem 1rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #fff; outline: none; font-size: 0.95rem; border-radius: 10px; width: 100%; box-sizing: border-box; }
         .profile-select { padding: 0.8rem 2.5rem 0.8rem 1rem; border: 1px solid rgba(0,210,255,0.35); background-color: rgba(10,15,36,0.96); background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2300D2FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1rem; color: #fff; outline: none; font-size: 0.95rem; border-radius: 12px; width: 100%; box-sizing: border-box; cursor: pointer; transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease; appearance: none; -webkit-appearance: none; -moz-appearance: none; }
         .profile-select:hover { border-color: rgba(0,210,255,0.6); background-color: rgba(15,22,52,0.98); }
         .profile-select:focus { border-color: #00D2FF; box-shadow: 0 0 0 3px rgba(0,210,255,0.18); }
         .profile-select option { background: #0a0f24; color: #fff; padding: 0.5rem 0.75rem; }

        /* TELEFON VƏ PLANŞET RESPONSİVLİYİ */
        @media (max-width: 1024px) {
          aside { width: 80px !important; padding: 2rem 0.5rem !important; align-items: center; }
          aside .profile-input, aside p, aside strong, aside span:not(:first-child) { display: none !important; }
          aside button { font-size: 0.7rem !important; padding: 0.5rem !important; }
          nav { left: 80px !important; }
          .neon-alert-box { left: 100px !important; max-width: 300px; }
          div[style*="gridTemplateColumns: repeat(4, 1fr)"],
          div[style*="gridTemplateColumns: repeat(3, 1fr)"],
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          aside { display: none !important; }
          nav { padding: 0 1rem !important; left: 0 !important; width: 100% !important; }
          main { padding: 1.5rem !important; margin-left: 0 !important; }
          .neon-alert-box { left: 20px !important; right: 20px !important; bottom: 20px !important; max-width: 100% !important; }
          div[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
          h1 { font-size: 1.6rem !important; }
          .esg-table th, .esg-table td { padding: 0.8rem 0.5rem !important; font-size: 0.8rem !important; }
          div[style*="width: '420px'"] { width: 100% !important; }
          .scrollable-table-container { overflow-x: auto; width: 100%; }
        }
      `;
      document.head.appendChild(styleElement);
    }
  }, []);

  const handleProfileSave = async () => {
    try {
      const activeToken = token || localStorage.getItem('esg_token');
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          companyName: profileName,
          email: profileEmail,
          password: newPass || undefined
        })
      });

      if (response.status === 401 || response.status === 403) {
        alert(lang === 'az' ? "🔒 Səlahiyyət müddəti bitib." : "🔒 Unauthorized session.");
        onLogout();
        return;
      }

      if (response.ok) {
        localStorage.setItem('bg_company_name', profileName);
        localStorage.setItem('bg_user_email', profileEmail);
        alert(lang === 'az' ? "✓ Dəyişikliklər uğurla yadda saxlanıldı!" : "✓ Saved successfully!");
        setNewPass('');
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.message || "Xəta baş verdi.");
      }
    } catch (error) {
      console.error("Profil yenilənərkən xəta:", error);
      alert("Şəbəkə xətası baş verdi.");
    }
  };

  useEffect(() => {
    setChatMessages(prev => {
      // Söhbət hələ başlamayıbsa, salamlaşma mesajını canlı göstəricilərlə
      // yeniləyirik. İstifadəçi sual verəndən sonra tarixçə qorunur.
      if (prev.length <= 1 && (!prev[0] || prev[0].sender === 'ai')) {
        return [{ sender: 'ai', text: buildWelcomeMessage({ lang, profileName, metrics }) }];
      }
      return prev;
    });
  }, [lang, profileName, metrics]);

  const get12Months = () => {
    if (lang === 'en') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (lang === 'ru') return ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    return ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyun', 'İyul', 'Avq', 'Sen', 'Okt', 'Nov', 'Dek'];
  };
  const months12 = get12Months();

  const reportData12Months = months12.map((m, idx) => ({
    month: m,
    scope1: 45 + (idx % 3) * 4,
    scope2: 50 + (idx % 2) * 5,
    waterConsumption: 3100 + (idx * 120),
    greenEnergyShare: 14 + (idx * 0.8),
    hseDays: 30,
    employeeSatisfaction: 84 + (idx % 3),
    trainingHours: 12 + (idx % 2),
    staffTurnover: (1.5 - (idx * 0.05)).toFixed(1),
    griCompliance: 94 + (idx % 2),
    transparencyDegree: 96 + (idx % 2),
    cyberSecurityTraining: 90 + (idx % 2),
    lawViolations: 0
  }));

  const statsOverview = [
    { title: t.scope1, value: metrics.co2, change: "-5.1%", color: "#00FF87", suffix: " tCO₂e", isStarred: true },
    { title: t.scope2, value: metrics.energy, change: "+1.8%", color: "#FFBB00", suffix: " tCO₂e", isStarred: true },
    { title: t.socialScore, value: 88, change: t.perfect, color: "#00FF87", suffix: " / 100", isStarred: true },
    { title: t.corpGov, value: 92, change: t.high, color: "#00D2FF", suffix: "%", isStarred: false }
  ];

  const overviewChartData = reportData12Months.slice(0, 6).map(d => ({
    name: d.month,
    emissiya: Math.round((d.scope1 + d.scope2) / 2),
    hədəf: 50
  }));

  const envPieData = [
    { name: lang==='en'?'Production':lang==='ru'?'Производство':'İstehsalat Prosesləri', value: 40, color: '#00D2FF' },
    { name: lang==='en'?'Logistics':lang==='ru'?'Логистика':'Tədarük və Logistika', value: 35, color: '#00FF87' },
    { name: lang==='en'?'Infrastructure':lang==='ru'?'Инфраструктура':'Daxili Infrastruktur', value: 25, color: '#9d4edd' },
  ];

  const socialBarData = [
    { name: lang==='en'?'Safety':lang==='ru'?'Безопасность':'HSE Təhlükəsizlik', skor: metrics.hse > 100 ? 95 : metrics.hse },
    { name: lang==='en'?'Gender':lang==='ru'?'Гендер':'Gender Balansı', skor: 78 },
    { name: lang==='en'?'Satisfaction':lang==='ru'?'Удовл.':'İşçi Rifahı', skor: 88 },
    { name: lang==='en'?'Training':lang==='ru'?'Обучение':'ESG Təlimləri', skor: 92 },
  ];

  const govRadarData = [
    { subject: lang==='en'?'Transparency':lang==='ru'?'Прозрачность':'Şəffaflıq', A: 98 },
    { subject: lang==='en'?'Cyber':lang==='ru'?'Кибер':'Kiber Təhl.', A: 95 },
    { subject: lang==='en'?'Audit':lang==='ru'?'Аудит':'Audit Uyğun.', A: 92 },
    { subject: lang==='en'?'Investor':lang==='ru'?'Инвестор':'İnvestor', A: 90 },
    { subject: lang==='en'?'Risk':lang==='ru'?'Риски':'Risk İdarə.', A: 95 },
  ];

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendQuestion = async (rawQuestion) => {
    const question = String(rawQuestion || '').trim();
    if (!question) return;

    setChatMessages(prev => [...prev, { sender: 'user', text: question }]);
    setChatInput('');
    setIsAiTyping(true);

    let answer = '';
    const activeToken = token || localStorage.getItem('esg_token');

    if (aiMeta.configured && activeToken) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          },
          body: JSON.stringify({
            message: question,
            lang,
            context: {
              companyName: profileName,
              activeTab,
              metrics
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          answer = String(data.answer || '').trim();
          if (data.provider) {
            setAiMeta(prev => ({
              ...prev,
              configured: true,
              provider: data.provider || prev.provider,
              model: data.model || prev.model
            }));
          }
        } else if (response.status === 503) {
          setAiMeta(prev => ({ ...prev, configured: false }));
        }
      } catch (err) {
        console.warn('AI API xətası, lokal köməkçiyə keçilir:', err.message);
      }
    }

    // API cavab verməzsə, geniş lokal bilik bazası işə düşür.
    if (!answer) {
      answer = buildAiReply({
        question,
        lang,
        profileName,
        metrics,
        reportData: reportData12Months,
        activeTab
      });
    }

    setChatMessages(prev => [...prev, { sender: 'ai', text: answer }]);
    setIsAiTyping(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendQuestion(chatInput);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#050816', fontFamily: globalFont, color: '#fff', display: 'flex', position: 'relative' }}>
      <GridDistortion imageSrc={darkNeonImage} grid={10} mouse={0.25} strength={0.15} relaxation={0.9} />
      
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', width: '100%' }}>
        <aside style={{ width: '280px', height: '100vh', background: 'rgba(5, 8, 22, 0.6)', backdropFilter: 'blur(30px)', borderRight: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem', position: 'sticky', top: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '3rem' }}>
            <img src={LogoImg} alt="Logo" style={{ width: '32px', height: '32px' }} />
            <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>
              <span style={{ color: '#00D2FF' }}>Blue</span><span style={{ color: '#00FF87' }}>Green</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
            {[
              { id: 'overview', label: t.overview, icon: '📊' },
              { id: 'env', label: t.envData, icon: '🌱' },
              { id: 'social', label: t.socialG, icon: '🤝' },
              { id: 'gov', label: t.govG, icon: '⚖️' },
              { id: 'profile', label: t.profSet, icon: '👤' }
            ].map((item) => (
              <div 
                key={item.id} 
                onClick={() => setActiveTab(item.id)}
                style={{
                  padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer', transition: '0.2s',
                  background: activeTab === item.id ? 'rgba(0, 210, 255, 0.12)' : 'transparent',
                  borderLeft: activeTab === item.id ? '4px solid #00D2FF' : '4px solid transparent',
                  color: activeTab === item.id ? '#fff' : '#b0b7c6', fontWeight: activeTab === item.id ? '600' : '500',
                  display: 'flex', alignItems: 'center', gap: '0.75rem'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #00D2FF, #00FF87)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: '#050816', overflow: 'hidden' }}>
                {avatarSrc ? <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : profileName.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '160px' }}>
                <strong style={{ fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profileName}</strong>
                <span style={{ fontSize: '0.75rem', color: '#00FF87', fontWeight: '600' }}>{t.liveSys}</span>
              </div>
            </div>

            <button 
              onClick={() => setIsChatOpen(true)}
              style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(157, 78, 221, 0.15)', border: '1px solid rgba(157, 78, 221, 0.3)', color: '#d4a5ff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: '0.2s' }}
            >
              🧠 BlueGreen AI
            </button>

            <button 
              onClick={onLogout}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255, 75, 75, 0.08)', border: '1px solid rgba(255, 75, 75, 0.15)', color: '#ff7676', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: '0.2s' }}
            >
              {t.logout}
            </button>
          </div>
        </aside>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <nav style={{ height: '70px', padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#8a93a6', fontWeight: '500' }}>{t.panelSub}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '2px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {['az', 'en', 'ru'].map((l) => (
                  <button key={l} onClick={() => setLang(l)} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', background: lang === l ? '#00D2FF' : 'transparent', color: lang === l ? '#050816' : '#8a93a6', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', textTransform: 'uppercase', transition: '0.15s' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <main style={{ padding: '2.5rem', flex: 1, overflowY: 'auto' }}>
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0, background: 'linear-gradient(to right, #fff, #8a93a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {t.welcome}, {profileName}!
                    </h1>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => exportToExcel(reportData12Months, profileName)} style={{ padding: '0.7rem 1.2rem', borderRadius: '10px', background: 'rgba(0, 255, 135, 0.1)', border: '1px solid rgba(0, 255, 135, 0.2)', color: '#00FF87', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
                      Excel 📊
                    </button>
                    <button onClick={() => exportToPDF(reportData12Months, profileName)} style={{ padding: '0.7rem 1.2rem', borderRadius: '10px', background: 'rgba(0, 210, 255, 0.1)', border: '1px solid rgba(0, 210, 255, 0.2)', color: '#00D2FF', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
                      PDF 📄
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                  {statsOverview.map((s, i) => (
                    <div key={i} className={s.isStarred ? "star-border-card" : ""} style={!s.isStarred ? { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '1.5rem' } : { padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8a93a6', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.8rem' }}>
                        <span>{s.title}</span>
                        <span style={{ color: s.color, fontWeight: '700' }}>{s.change}</span>
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
                        <LocalCountUp to={s.value} />
                        <span style={{ fontSize: '1rem', color: '#8a93a6', fontWeight: '500' }}>{s.suffix}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '1.05rem', margin: '0 0 1.5rem 0', color: '#b0b7c6', fontWeight: '600' }}>{t.chartTitle1}</h3>
                    <div style={{ width: '100%', height: '280px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={overviewChartData}>
                          <defs>
                            <linearGradient id="colorEm" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00D2FF" stopOpacity={0.3}/><stop offset="95%" stopColor="#00D2FF" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" stroke="#5d6575" fontSize={11} />
                          <YAxis stroke="#5d6575" fontSize={11} />
                          <Tooltip contentStyle={{ background: '#0a0f24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                          <Legend verticalAlign="top" height={36} />
                          <Area type="monotone" dataKey="emissiya" name={lang==='en'?'Actual Emission':lang==='ru'?'Факт Выбросы':'Faktiki Emissiya'} stroke="#00D2FF" strokeWidth={2} fillOpacity={1} fill="url(#colorEm)" />
                          <Area type="monotone" dataKey="hədəf" name={lang==='en'?'Optimal Target':lang==='ru'?'Цель':'Optimal Hədəf'} stroke="#FF4B4B" strokeWidth={1} strokeDasharray="5 5" fill="none" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '1.05rem', margin: '0 0 1.5rem 0', color: '#b0b7c6', fontWeight: '600' }}>{t.liveSys} - Canlı Sensor İzləmə Axını</h3>
                    <div style={{ width: '100%', height: '280px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyData}>
                          <defs>
                            <linearGradient id="colorLiveCo2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00FF87" stopOpacity={0.2}/><stop offset="95%" stopColor="#00FF87" stopOpacity={0}/></linearGradient>
                            <linearGradient id="colorLiveEnergy" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FFBB00" stopOpacity={0.2}/><stop offset="95%" stopColor="#FFBB00" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" stroke="#5d6575" fontSize={11} />
                          <YAxis stroke="#5d6575" fontSize={11} />
                          <Tooltip contentStyle={{ background: '#0a0f24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                          <Legend verticalAlign="top" height={36} />
                          <Area type="monotone" dataKey="CO₂ (Ton)" stroke="#00FF87" strokeWidth={2} fill="url(#colorLiveCo2)" />
                          <Area type="monotone" dataKey="Enerji (kWh)" stroke="#FFBB00" strokeWidth={2} fill="url(#colorLiveEnergy)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'env' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px' }}>
                    <div style={{ color: '#8a93a6', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t.waterCons}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#00D2FF' }}><LocalCountUp to={metrics.water} /> m³</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px' }}>
                    <div style={{ color: '#8a93a6', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t.greenEnergy}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#00FF87' }}>18.4%</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px' }}>
                    <div style={{ color: '#8a93a6', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t.wasteUtil}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#9d4edd' }}><LocalCountUp to={metrics.waste} />%</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 1.5rem 0', color: '#b0b7c6', fontWeight: '600' }}>{t.segmentTitle}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ width: '220px', height: '220px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={envPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {envPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {envPieData.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: d.color }} />
                          <span style={{ color: '#b0b7c6' }}>{d.name}:</span>
                          <strong style={{ color: '#fff' }}>{d.value}%</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#b0b7c6', fontWeight: '600' }}>{t.tableTitle1}</h3>
                  <div className="scrollable-table-container">
                    <table className="esg-table">
                      <thead>
                        <tr>
                          <th>{t.month}</th>
                          <th>{t.s1Em} (tCO₂e)</th>
                          <th>{t.s2Em} (tCO₂e)</th>
                          <th>{t.waterI} (m³)</th>
                          <th>{t.greenE} (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData12Months.map((row, i) => (
                          <tr key={i}>
                            <td>{row.month}</td>
                            <td>{row.scope1}</td>
                            <td>{row.scope2}</td>
                            <td>{row.waterConsumption}</td>
                            <td>{row.greenEnergyShare}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px' }}>
                    <div style={{ color: '#8a93a6', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t.hseDays}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#00FF87' }}><LocalCountUp to={metrics.hse} /> Gün</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px' }}>
                    <div style={{ color: '#8a93a6', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t.avgTrain}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#00D2FF' }}><LocalCountUp to={metrics.training} /> Saat / İşçi</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px' }}>
                    <div style={{ color: '#8a93a6', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t.turnOver}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ff4b4b' }}>1.2% <span style={{ fontSize: '0.85rem', color: '#00FF87', fontWeight: '500' }}>({t.low})</span></div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 1.5rem 0', color: '#b0b7c6', fontWeight: '600' }}>{t.socialInd}</h3>
                  <div style={{ width: '100%', height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={socialBarData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="#5d6575" fontSize={12} />
                        <YAxis stroke="#5d6575" fontSize={12} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: '#0a0f24', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Bar dataKey="skor" name={lang==='en'?'Score Index':lang==='ru'?'Индекс':'Performans İndeksi'} fill="#00FF87" radius={[6, 6, 0, 0]}>
                          {socialBarData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00FF87' : '#00D2FF'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#b0b7c6', fontWeight: '600' }}>{t.tableTitle2}</h3>
                  <div className="scrollable-table-container">
                    <table className="esg-table">
                      <thead>
                        <tr>
                          <th>{t.hsePeriod}</th>
                          <th>{t.workerSat} (%)</th>
                          <th>{t.trainVol} (Saat)</th>
                          <th>{t.staffAx} (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData12Months.map((row, i) => (
                          <tr key={i}>
                            <td>{row.month}</td>
                            <td>{row.employeeSatisfaction}%</td>
                            <td>{row.trainingHours} s</td>
                            <td>{row.staffTurnover}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gov' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 1rem 0', color: '#b0b7c6', fontWeight: '600' }}>{t.radarTitle}</h3>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" radius="70%" data={govRadarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="subject" stroke="#8a93a6" fontSize={12} />
                        <Radar name="Audit" dataKey="A" stroke="#00D2FF" fill="#00D2FF" fillOpacity={0.25} />
                        <Tooltip contentStyle={{ background: '#0a0f24', border: '1px solid rgba(255,255,255,0.1)' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#b0b7c6', fontWeight: '600' }}>{t.tableTitle3}</h3>
                  <div className="scrollable-table-container">
                    <table className="esg-table">
                      <thead>
                        <tr>
                          <th>{t.period}</th>
                          <th>{t.griIdx} (%)</th>
                          <th>{t.transparencyDeg} (%)</th>
                          <th>{t.kiberTrain} (%)</th>
                          <th>{t.breach}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData12Months.map((row, i) => (
                          <tr key={i}>
                            <td>{row.month}</td>
                            <td>{row.griCompliance}%</td>
                            <td>{row.transparencyDegree}%</td>
                            <td>{row.cyberSecurityTraining}%</td>
                            <td style={{ color: '#00FF87', fontWeight: 'bold' }}>{row.lawViolations}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{t.profTitle}</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#00D2FF', fontWeight: '600' }}>{t.corpIdentity}</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', color: '#8a93a6' }}>{t.compNameLabel}</label>
                      <input type="text" className="profile-input" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', color: '#8a93a6' }}>{t.adminEmailLabel}</label>
                      <input type="email" className="profile-input" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', color: '#8a93a6' }}>{t.indSector}</label>
                      <select className="profile-select" value={industrySector} onChange={(e) => setIndustrySector(e.target.value)}>
                        <option>Heavy Industry / Sənaye</option>
                        <option>Green Energy Production</option>
                        <option>Oil & Gas Refinery</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#FFBB00', fontWeight: '600' }}>{t.sysSec}</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', color: '#8a93a6' }}>{t.newPass}</label>
                      <input type="password" className="profile-input" placeholder="••••••••" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                    </div>

                    <h3 style={{ fontSize: '1.1rem', margin: '1rem 0 0 0', color: '#00FF87', fontWeight: '600' }}>{t.sysLoc}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', color: '#8a93a6' }}>{t.esgLang}</label>
                      <select className="profile-select" value={lang} onChange={(e) => setLang(e.target.value)}>
                        <option value="az">Azərbaycan dili (AZ)</option>
                        <option value="en">English (EN)</option>
                        <option value="ru">Русский (RU)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#9d4edd', fontWeight: '600' }}>{t.logoSeal}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#8a93a6', margin: 0 }}>{t.logoDesc}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#b0b7c6' }}>{t.avatarLabel}</span>
                      <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ color: '#8a93a6', fontSize: '0.85rem' }} />
                    </div>
                    {avatarSrc && (
                      <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img src={avatarSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleProfileSave} style={{ padding: '0.9rem 2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #00D2FF 0%, #00FF87 100%)', color: '#050816', border: 'none', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 255, 135, 0.2)' }}>
                    {t.saveBtn}
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {isChatOpen && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', width: '420px', height: '550px', background: '#0a0f24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🧠</span>
              <div>
                <strong style={{ fontSize: '0.95rem' }}>BlueGreen AI Core</strong>
                <div style={{ fontSize: '0.75rem', color: aiMeta.configured ? '#00FF87' : '#9fe8ff', display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span>{aiMeta.configured ? `● LLM: ${aiMeta.provider === 'pollinations' ? 'Free' : aiMeta.provider}` : '○ Local AI'}</span>
                  <span style={{ color: '#8a93a6' }}>·</span>
                  <span>{lang === 'en' ? 'Universal Assistant v3.1' : lang === 'ru' ? 'Универсальный помощник v3.1' : 'Universal Köməkçi v3.1'}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} style={{ background: 'transparent', border: 'none', color: '#8a93a6', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
          </div>
          
          <div style={{ flex: 1, padding: '1.2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', background: msg.sender === 'user' ? '#00D2FF' : 'rgba(255,255,255,0.03)', color: msg.sender === 'user' ? '#050816' : '#fff', padding: '0.8rem 1.1rem', borderRadius: '16px', maxWidth: '85%', border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.04)', whiteSpace: 'pre-line' }}>
                {renderRichText(msg.text)}
              </div>
            ))}
            {isAiTyping && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(0,210,255,0.06)', color: '#9fe8ff', padding: '0.8rem 1.1rem', borderRadius: '16px', border: '1px solid rgba(0,210,255,0.15)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                {lang === 'en' ? 'BlueGreen AI is typing…' : lang === 'ru' ? 'BlueGreen AI печатает…' : 'BlueGreen AI yazır…'}
              </div>
            )}
          </div>

          {chatMessages.length <= 1 && (
            <div style={{ padding: '0 1rem 0.8rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {getSuggestedQuestions(lang).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendQuestion(q)}
                  style={{ padding: '0.45rem 0.7rem', borderRadius: '999px', border: '1px solid rgba(0,210,255,0.3)', background: 'rgba(0,210,255,0.08)', color: '#9fe8ff', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem' }}>
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={t.chatPlaceholder} style={{ flex: 1, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
            <button type="submit" style={{ padding: '0 1rem', background: '#00D2FF', color: '#050816', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>➔</button>
          </form>
        </div>
      )}

      {activeAlert && (
        <div 
          className="neon-alert-box"
          style={{
            position: 'fixed',
            bottom: '30px',
            left: '310px',
            zIndex: 9999,
            padding: '1.2rem 1.8rem',
            borderRadius: '16px',
            color: '#fff',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            transition: 'all 0.4s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '1rem', color: activeAlert.type === 'danger' ? '#ff4b4b' : '#ffbb00' }}>
              {activeAlert.title}
            </strong>
            <button 
              onClick={() => setActiveAlert(null)} 
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem', opacity: 0.7 }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#e2e5ec', lineHeight: '1.4' }}>
            {activeAlert.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;