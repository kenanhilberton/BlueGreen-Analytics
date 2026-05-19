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
    contactTitle: "📞 Əlaqə & Texniki Dəstək", office: "Mərkəzi Ofis", close: "Bağla", chatPlaceholder: "AI-dan risk analizi tələb et...", avatarLabel: "📸 Profil Şəkli / Müəssisə Loqosu",
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
    sysLoc: "⚙️ System Localization", esgLang: "ESG Report Language", aiNotifyCent: "🔔 AI Smart Notification Center",
    logoSeal: "📋 Official E-Seal & Logo Integration", logoDesc: "Upload a document for the emblem to appear in PDF/Excel exports.", selectFile: "Select File",
    contactTitle: "📞 Contact & Technical Support", office: "Head Office", close: "Close", chatPlaceholder: "Request AI risk analysis...", avatarLabel: "📸 Profile Picture / Enterprise Logo",
    aiAnalysisBtn: "🧠 Get AI Risk Analysis & ESG Recommendations", aiResponseText: "AI analyzing... Metrics are secure and in the green zone."
  },
  ru: {
    overview: "Общая Панель", envData: "Экологические Данные", socialG: "Социальные Показатели", govG: "Управление", profSet: "Настройки Профиля",
    liveSys: "● Живая Система ESG", contactSupport: "📞 Связь и Поддержка", logout: "Выход", panelSub: "Живая панель ESG для промышленных предприятий",
    welcome: "Добро пожаловать", scope1: "Scope 1 - Стационарное Сгорание", scope2: "Scope 2 - Потребление Электроэнергии",
    socialScore: "Индекс Социальной Устойчивости", corpGov: "Корпоративное Управление", perfect: "Отлично", high: "Высокий", optimal: "Оптимальный",
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
    contactTitle: "📞 Связь и Техническая Поддержка", office: "Главный Офис", close: "Закрыть", chatPlaceholder: "Запросить анализ рисков AI...", avatarLabel: "📸 Изображение Профиля / Логотип",
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

const Dashboard = ({ onLogout, userEmail, companyName, token }) => {
  const [lang, setLang] = useState('az');
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState('overview');
  const [profileName, setProfileName] = useState(companyName || localStorage.getItem('bg_company_name') || "BlueGreen Müəssisə");
  const [profileEmail, setProfileEmail] = useState(userEmail || localStorage.getItem('bg_user_email') || "admin@bluegreen.az");
  const [newPass, setNewPass] = useState(''); 
  const [avatarSrc, setAvatarSrc] = useState(null);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false); 
  
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

        const res = await fetch('http://localhost:5000/api/sensors/live', {
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

          setMetrics({
            co2: Math.round((latestData.co2Emission || 44)),
            energy: Math.round((latestData.energyConsumption || 48)),
            water: latestData.waterUsage || 3500,
            waste: latestData.wasteRecycled || 76,
            hse: latestData.hseIncidents || 320,
            training: latestData.trainingHours || 18
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
              'CO₂ (Ton)': latestData.co2Emission,
              'Enerji (kWh)': latestData.energyConsumption,
              'Su (m³)': latestData.waterUsage
            }];
            if (updated.length > 7) updated.shift();
            return updated;
          });
        }
      } catch (err) {
        console.error("Canlı sensor datası qoşulmasında xəta:", err.message);
      }
    };

    fetchLiveSensorData();
    const interval = setInterval(fetchLiveSensorData, 5000); 
    return () => clearInterval(interval);
  }, [token, onLogout, lang]);

  
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

        /* 📱 MOBİL VƏ PLANŞET RESPONSIVE STİLLƏRİ */
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
          nav { padding: 0 1rem !important; }
          main { padding: 1.5rem !important; }
          .neon-alert-box { left: 20px !important; right: 20px !important; bottom: 20px !important; max-width: 100% !important; }
          div[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
          h1 { font-size: 1.6rem !important; }
          .esg-table th, .esg-table td { padding: 0.8rem 0.5rem !important; font-size: 0.8rem !important; }
          div[style*="width: '420px'"] { width: 100% !important; }
        }
      `;
      document.head.appendChild(styleElement);
    }
  }, []);

  const handleProfileSave = async () => {
    try {
      const activeToken = token || localStorage.getItem('esg_token');
      const response = await fetch('http://localhost:5000/api/profile/update', {
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
      } else {
        alert("Xəta baş verdi.");
      }
    } catch (error) {
      console.error("Profil yenilənərkən xəta:", error);
    }
  };

  const generateAiEsgAnalysis = () => {
    if (lang === 'az') {
      return `📊 **BlueGreen AI - Sənaye Risk Analiz Hesabatı [${profileName.toUpperCase()}]:**\n\n` +
             `⚠️ **Aşkar Olunan Kritik Risk:** Cari logistika zəncirində dizel intensivliyi artmışdır. Səhifə yenilənən zaman Scope 1 emissiyanız limit xəttini (50 t) keçərək 61%-ə çata bilər.\n\n` +
             `🌱 **ESG Tövsiyəsi:**\n` +
             `1. Tullantıların utilizasiya payını (%76) qorumaq üçün rəqəmsal sensor izləməsini aktiv saxlayın.\n` +
             `2. GRI Uyğunluq indeksiniz (%98.5) çox yüksəkdir. Şəffaflığı PDF hesabat ixracı ilə rəsmiləşdirin.`;
    } else if (lang === 'en') {
      return `📊 **BlueGreen AI - Industrial Risk Analysis Report [${profileName.toUpperCase()}]:**\n\n` +
             `⚠️ **Critical Risk Detected:** Diesel intensity in the current supply chain has increased. Your Scope 1 emission could exceed the target limit line (50 t), reaching 61% during peaks.\n\n` +
             `🌱 **ESG Recommendations:**\n` +
             `1. Maintain digital sensor tracking to protect the waste recycling rate (76%).\n` +
             `2. Your GRI Compliance index (98.5%) is excellent. Formally secure it using PDF export.`;
    } else {
      return `📊 **BlueGreen AI - Промышленный отчет об анализе рисков [${profileName.toUpperCase()}]:**\n\n` +
             `⚠️ **Критический риск:** Интенсивность дизельного топлива в логистике увеличилась. Выбросы Scope 1 могут превысить целевую линию лимита (50 т), достигнув 61%.\n\n` +
             `🌱 **Рекомендации ESG:**\n` +
             `1. Сохраняйте цифровой трекинг датчиков для защиты индекса утилизации отходов (76%).\n` +
             `2. Ваш индекс соответствия GRI (98.5%) превосходен. Зафиксируйте прозрачность экспортом PDF.`;
    }
  };

  useEffect(() => {
    setChatMessages([
      { sender: 'ai', text: generateAiEsgAnalysis() }
    ]);
  }, [lang, profileName]);

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
      reader.onloadend = () => { setAvatarSrc(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
    setChatInput('');
    setTimeout(() => { setChatMessages(prev => [...prev, { sender: 'ai', text: t.aiResponseText }]); }, 700);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#050816', fontFamily: globalFont, color: '#fff', display: 'flex', position: 'relative' }}>
      
      <GridDistortion imageSrc={darkNeonImage} grid={10} mouse={0.25} strength={0.15} relaxation={0.9} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', width: '100%' }}>
        
        {}
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
            ].map((item) => (
              <div 
                key={item.id} onClick={() => setActiveTab(item.id)}
                style={{ 
                  padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer', transition: '0.2s',
                  background: activeTab === item.id ? 'rgba(0, 210, 255, 0.12)' : 'transparent',
                  borderLeft: activeTab === item.id ? '4px solid #00D2FF' : '4px solid transparent',
                  color: activeTab === item.id ? '#fff' : '#b0b7c6',
                  display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem'
                }}
              >
                <span>{item.icon}</span> {item.label}
              </div>
            ))}
            <div style={{ margin: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}></div>
            <div 
              onClick={() => setActiveTab('profile')}
              style={{ 
                padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer', transition: '0.2s',
                background: activeTab === 'profile' ? 'rgba(157, 78, 221, 0.15)' : 'rgba(255,255,255,0.02)',
                borderLeft: activeTab === 'profile' ? '4px solid #9d4edd' : '4px solid transparent',
                color: activeTab === 'profile' ? '#fff' : '#b0b7c6',
                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.03)'
              }}
            >
              <span>👤</span> <strong>{t.profSet}</strong>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '5px' }}>
              {['az', 'en', 'ru'].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ flex: 1, padding: '5px', background: lang === l ? '#00D2FF' : 'rgba(255,255,255,0.05)', color: lang === l ? '#050816' : '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}>{l.toUpperCase()}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: '0.8rem', background: 'rgba(5,8,22,0.4)', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #00D2FF 0%, #00FF87 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#050816', fontSize: '0.8rem' }}>
                {profileName.substring(0,2).toUpperCase()}
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '700', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{profileName}</p>
            </div>
          </div>

          <button onClick={onLogout} style={{ padding: '0.7rem', background: 'rgba(255, 75, 75, 0.1)', color: '#ff4b4b', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
            {t.logout}
          </button>
        </aside>

        {}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          
          <nav style={{ height: '70px', background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
            <div><span style={{ fontSize: '0.85rem', background: 'rgba(0, 255, 135, 0.1)', padding: '6px 14px', borderRadius: '20px', border: '1px solid #00FF87', color: '#00FF87', fontWeight: '600' }}>{t.liveSys}</span></div>
            <div>
              <button onClick={() => setIsChatOpen(true)} style={{ padding: '0.5rem 1.2rem', background: 'linear-gradient(135deg, #9d4edd 0%, #2b44ff 100%)', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>{t.aiAnalysisBtn}</button>
            </div>
          </nav>

          <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
            <header style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>
                {activeTab === 'overview' && `${t.welcome}, ${profileName}!`}
                {activeTab === 'env' && t.envData} {activeTab === 'social' && t.socialG} {activeTab === 'gov' && t.govG} {activeTab === 'profile' && t.profTitle}
              </h1>
              <p style={{ color: '#b0b7c6', fontSize: '0.95rem', marginTop: '0.3rem' }}>{t.panelSub}</p>
            </header>

            {}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  {statsOverview.map((s, i) => (
                    <div key={i} className={s.isStarred ? 'star-border-card' : ''} style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '110px', border: s.isStarred ? 'none' : '1px solid rgba(255,255,255,0.05)', background: s.isStarred ? '' : 'rgba(255,255,255,0.02)' }}>
                      <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '8px', zIndex: 5 }}>{s.title}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', zIndex: 5 }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: '700' }}>
                          <LocalCountUp from={0} to={s.value} />
                          <span style={{ fontSize: '0.9rem', color: '#888', marginLeft: '2px' }}>{s.suffix}</span>
                        </h2>
                        <span style={{ color: s.color, fontWeight: 'bold', fontSize: '0.85rem' }}>{s.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', height: '360px' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#00D2FF' }}>{t.chartTitle1}</h3>
                  <div style={{ width: '100%', height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={overviewChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} />
                        <YAxis stroke="#666" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#090d22', border: '1px solid #00D2FF', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
                        <Area name="Cari Emissiya (%)" type="monotone" dataKey="emissiya" stroke="#00D2FF" strokeWidth={2.5} fill="rgba(0, 210, 255, 0.05)" />
                        <Area name="Hədəf Limiti (%)" type="monotone" dataKey="hədəf" stroke="#ff4b4b" strokeWidth={1.5} strokeDasharray="5 5" fill="none" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {}
            {activeTab === 'env' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '1.2rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#aaa', fontSize: '0.8rem' }}>{t.waterCons}</p>
                    <h3 style={{ fontSize: '1.6rem', marginTop: '5px', fontWeight: '700' }}>{metrics.water.toLocaleString()} m³</h3>
                  </div>
                  <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '1.2rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#aaa', fontSize: '0.8rem' }}>{t.greenEnergy}</p>
                    <h3 style={{ fontSize: '1.6rem', marginTop: '5px', fontWeight: '700' }}>18.4%</h3>
                  </div>
                  <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '1.2rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#aaa', fontSize: '0.8rem' }}>{t.wasteUtil}</p>
                    <h3 style={{ fontSize: '1.6rem', marginTop: '5px', fontWeight: '700' }}>{metrics.waste}%</h3>
                  </div>
                </div>

                <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: '#00FF87', marginBottom: '1rem' }}>{t.segmentTitle}</h4>
                    {envPieData.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                        <span>{item.name}: <strong>{item.value}%</strong></span>
                      </div>
                    ))}
                  </div>
                  <div style={{ width: '200px', height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={envPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {envPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#00D2FF', margin: 0 }}>{t.tableTitle1}</h3>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => {
                          const excelData = reportData12Months.map(row => ({
                            "Ay": row.month,
                            "Scope 1 (tCO2e)": row.scope1,
                            "Scope 2 (tCO2e)": row.scope2,
                            "Su İstehlakı (m³)": row.waterConsumption,
                            "Yaşıl Enerji (%)": row.greenEnergyShare
                          }));
                          exportToExcel(excelData, `Ekoloji_Hesabat_${profileName.replace(/\s+/g, '_')}`);
                        }}
                        style={{ padding: '6px 14px', background: 'rgba(0, 255, 135, 0.1)', color: '#00FF87', border: '1px solid #00FF87', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                      >
                        🟢 Excel Yüklə
                      </button>

                      <button 
                        onClick={() => {
                          const headers = [t.month, `${t.s1Em} (tCO2e)`, `${t.s2Em} (tCO2e)`, `${t.waterI} (m³)`, `${t.greenE} (%)`];
                          const rows = reportData12Months.map(row => [
                            row.month, row.scope1, row.scope2, row.waterConsumption.toLocaleString(), `${row.greenEnergyShare}%`
                          ]);
                          exportToPDF(`${profileName} - 12 Aylıq Ekoloji Resurs Hesabatı`, headers, rows, `Ekoloji_Hesabat_${profileName.replace(/\s+/g, '_')}`);
                        }}
                        style={{ padding: '6px 14px', background: 'rgba(0, 210, 255, 0.1)', color: '#00D2FF', border: '1px solid #00D2FF', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                      >
                        🔵 PDF Yüklə
                      </button>
                    </div>
                  </div>

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
                      {reportData12Months.map((row, index) => (
                        <tr key={index}>
                          <td><strong>{row.month}</strong></td>
                          <td>{row.scope1}</td>
                          <td>{row.scope2}</td>
                          <td>{row.waterConsumption.toLocaleString()}</td>
                          <td style={{ color: '#00FF87' }}>{row.greenEnergyShare}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {}
            {activeTab === 'social' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '1.2rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#aaa', fontSize: '0.8rem' }}>{t.hseDays}</p>
                    <h3 style={{ fontSize: '1.6rem', marginTop: '5px', fontWeight: '700', color: '#00FF87' }}>{metrics.hse} Gün</h3>
                  </div>
                  <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '1.2rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#aaa', fontSize: '0.8rem' }}>{t.avgTrain}</p>
                    <h3 style={{ fontSize: '1.6rem', marginTop: '5px', fontWeight: '700' }}>{metrics.training} Saat / İşçi</h3>
                  </div>
                  <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '1.2rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#aaa', fontSize: '0.8rem' }}>{t.turnOver}</p>
                    <h3 style={{ fontSize: '1.6rem', marginTop: '5px', fontWeight: '700', color: '#ff4b4b' }}>1.2% ({t.low})</h3>
                  </div>
                </div>

                <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', height: '350px' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', color: '#00FF87' }}>{t.socialInd}</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={socialBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="name" stroke="#aaa" fontSize={12} />
                      <YAxis stroke="#aaa" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#090d22', border: '1px solid #00FF87' }} />
                      <Bar dataKey="skor" fill="#00FF87" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#00FF87', margin: 0 }}>{t.tableTitle2}</h3>
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
                      {reportData12Months.map((row, index) => (
                        <tr key={index}>
                          <td><strong>{row.month}</strong></td>
                          <td>{row.employeeSatisfaction}%</td>
                          <td>{row.trainingHours} s</td>
                          <td style={{ color: '#ff4b4b' }}>{row.staffTurnover}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {}
            {activeTab === 'gov' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', height: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', alignSelf: 'flex-start', color: '#9d4edd', margin: 0 }}>{t.radarTitle}</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={govRadarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis dataKey="subject" stroke="#aaa" fontSize={11} />
                        <Radar name="Uyğunluq" dataKey="A" stroke="#9d4edd" fill="#9d4edd" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>{t.griComp}</p>
                      <h3 style={{ margin: '5px 0 0 0', fontSize: '1.8rem', color: '#00D2FF' }}>98.5%</h3>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>{t.eticTrain}</p>
                      <h3 style={{ margin: '5px 0 0 0', fontSize: '1.8rem', color: '#00FF87' }}>100%</h3>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#9d4edd', margin: 0 }}>{t.tableTitle3}</h3>
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
                      {reportData12Months.map((row, index) => (
                        <tr key={index}>
                          <td><strong>{row.month}</strong></td>
                          <td>{row.griCompliance}%</td>
                          <td>{row.transparencyDegree}%</td>
                          <td>{row.cyberSecurityTraining}%</td>
                          <td style={{ color: row.lawViolations > 0 ? '#ff4b4b' : '#00FF87' }}>{row.lawViolations}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {}
            {activeTab === 'profile' && (
              <div style={{ background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(10px)', padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#00D2FF' }}>{t.corpIdentity}</h3>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '6px' }}>{t.compNameLabel}</label>
                    <input className="profile-input" type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '6px' }}>{t.adminEmailLabel}</label>
                    <input className="profile-input" type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '6px' }}>{t.newPass}</label>
                    <input className="profile-input" type="password" placeholder="••••••••" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                  </div>
                  <button onClick={handleProfileSave} style={{ padding: '0.8rem', background: 'linear-gradient(135deg, #00D2FF 0%, #00FF87 100%)', color: '#050816', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', marginTop: '1rem' }}>{t.saveBtn}</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '2.5rem' }}>
                  <p style={{ fontSize: '0.9rem', color: '#aaa', margin: 0 }}>{t.avatarLabel}</p>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'rgba(255,255,255,0.01)' }}>
                    {avatarSrc ? <img src={avatarSrc} alt="Enterprise Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '2.5rem' }}>🏢</span>}
                  </div>
                  <label style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    {t.selectFile}
                    <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {}
      {isChatOpen && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '420px', height: '100vh', background: '#090e26', borderLeft: '1px solid rgba(0, 210, 255, 0.2)', zIndex: 1000, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#00D2FF' }}>🤖 BlueGreen AI Copilot</h3>
            <button onClick={() => setIsChatOpen(false)} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>✕</button>
          </div>

          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', background: msg.sender === 'user' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', maxWidth: '85%', fontSize: '0.9rem', color: msg.sender === 'user' ? '#00D2FF' : '#e0e6ed', border: msg.sender === 'user' ? '1px solid rgba(0, 210, 255, 0.2)' : '1px solid rgba(255,255,255,0.02)', whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={t.chatPlaceholder} style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none' }} />
            <button type="submit" style={{ padding: '0 1rem', background: '#00D2FF', color: '#050816', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>➔</button>
          </form>
        </div>
      )}

      {}
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
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#e0e6ed', lineHeight: '1.4' }}>
            {activeAlert.message}
          </p>
        </div>
      )}

    </div>
  );
};

export default Dashboard;