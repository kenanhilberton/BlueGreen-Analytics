/**
 * BlueGreen AI — geniş sual-cavab köməkçisi.
 *
 * Bu modul xarici API-yə ehtiyac olmadan işləyir: ESG, davamlılıq,
 * saytın funksiyaları, cari göstəricilər və ümumi bilik suallarına
 * kontekstə uyğun cavab qaytarır. Gələcəkdə real LLM qoşmaq üçün
 * yalnız buildAiReply funksiyasını dəyişmək kifayətdir.
 */

const pick = (lang, az, en, ru) => (lang === 'en' ? en : lang === 'ru' ? ru : az);

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[?!.,;:()"“”'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectLang(question, fallback = 'az') {
  const raw = String(question || '');
  if (/[а-яё]/i.test(raw)) return 'ru';

  const text = normalize(raw);
  const azHints = [
    'nədir', 'necə', 'niyə', 'üçün', 'və', 'bir', 'mən', 'sən', 'hansı',
    'nə', 'var', 'yox', 'azərbaycan', 'şirkət', 'göstərici', 'hesabat'
  ];
  const enHints = [
    'what', 'how', 'why', 'the', 'and', 'is', 'are', 'can', 'you',
    'tell', 'about', 'company', 'report', 'energy', 'water', 'waste'
  ];

  const azScore = azHints.filter((w) => text.includes(w)).length;
  const enScore = enHints.filter((w) => text.includes(w)).length;

  if (enScore > azScore) return 'en';
  return fallback;
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function snapshot(metrics = {}) {
  return {
    co2: toNumber(metrics.co2, 46).toFixed(1),
    energy: toNumber(metrics.energy, 57).toFixed(1),
    water: Math.round(toNumber(metrics.water, 3200)).toString(),
    waste: toNumber(metrics.waste, 76).toFixed(1),
    hse: Math.round(toNumber(metrics.hse, 324)).toString(),
    training: toNumber(metrics.training, 18).toFixed(1)
  };
}

function summaryLine(lang, m) {
  if (lang === 'en') {
    return `Current readings — CO₂: ${m.co2} t · Energy: ${m.energy} kWh · Water: ${m.water} m³ · Waste recycling: ${m.waste}% · HSE: ${m.hse} days · Training: ${m.training} h`;
  }
  if (lang === 'ru') {
    return `Текущие показатели — CO₂: ${m.co2} т · Энергия: ${m.energy} кВт·ч · Вода: ${m.water} м³ · Переработка отходов: ${m.waste}% · HSE: ${m.hse} дн. · Обучение: ${m.training} ч`;
  }
  return `Cari göstəricilər — CO₂: ${m.co2} t · Enerji: ${m.energy} kWh · Su: ${m.water} m³ · Tullantı utilizasiyası: ${m.waste}% · HSE: ${m.hse} gün · Təlim: ${m.training} saat`;
}

function scoreText(text, keywords) {
  let score = 0;
  for (const raw of keywords) {
    const kw = normalize(raw);
    if (!kw) continue;
    if (text.includes(kw)) score += kw.includes(' ') ? kw.length + 4 : kw.length;
  }
  return score;
}

/* ------------------------------------------------------------------ */
/*  XÜSUSİ BİLİK BAZASI                                                */
/* ------------------------------------------------------------------ */

const SPECIAL_FACTS = [
  {
    keys: ['paris sazişi', 'paris agreement', 'парижское соглашение', 'paris'],
    az: '**Paris Sazişi (2015)** — 190-dan çox ölkənin qlobal istiləşməni sənayedən əvvəlki səviyyədən 2°C-dən xeyli aşağı, ideal halda 1.5°C-də saxlamaq üçün imzaladığı beynəlxalq razılaşmadır. Ölkələr “milli olaraq müəyyən edilmiş töhfə” (NDC) təqdim edir və hər 5 ildə hədəflərini yeniləyir.',
    en: '**The Paris Agreement (2015)** is an international treaty signed by more than 190 countries to keep global warming well below 2°C and preferably at 1.5°C above pre-industrial levels. Countries submit Nationally Determined Contributions (NDCs) and update their targets every five years.',
    ru: '**Парижское соглашение (2015)** — международный договор, подписанный более чем 190 странами, чтобы удержать глобальное потепление значительно ниже 2°C и желательно на уровне 1,5°C выше доиндустриального уровня. Страны представляют определяемые на национальном уровне вклады (NDC) и обновляют цели каждые пять лет.'
  },
  {
    keys: ['dayanıqlı inkişaf məqsədləri', 'sdg', 'bmt məqsədləri', 'sustainable development goals', 'цур', 'цели устойчивого развития'],
    az: '**BMT-nin 17 Dayanıqlı İnkişaf Məqsədi (SDG)** 2030-cu ilə qədər yoxsulluğun aradan qaldırılması, bərabərlik, iqlim fəaliyyəti və məsuliyyətli istehsalı əhatə edir. ESG hesabatlarında SDG-lərə uyğunluq tez-tez ayrıca göstərilir. Sizin fəaliyyətiniz üçün xüsusilə SDG 7 (təmiz enerji), 12 (məsuliyyətli istehlak) və 13 (iqlim fəaliyyəti) relevantdir.',
    en: '**The 17 UN Sustainable Development Goals (SDGs)** cover poverty, equality, climate action and responsible production by 2030. ESG reports often map activities to the SDGs. For your operations, SDG 7 (clean energy), 12 (responsible consumption) and 13 (climate action) are especially relevant.',
    ru: '**17 Целей устойчивого развития ООН (ЦУР)** охватывают борьбу с бедностью, равенство, климатические действия и ответственное производство к 2030 году. В ESG-отчетах деятельность часто сопоставляют с ЦУР. Для ваших операций особенно важны ЦУР 7 (чистая энергия), 12 (ответственное потребление) и 13 (борьба с изменением климата).'
  },
  {
    keys: ['istixana effekti', 'istixana qazları', 'greenhouse effect', 'greenhouse gases', 'парниковый эффект', 'парниковые газы'],
    az: '**İstixana effekti** — atmosferdəki CO₂, metan, azot oksidi və su buxarının Günəş istiliyini saxlaması nəticəsində Yerin orta temperaturunun artmasıdır. Bu təbii proses həyat üçün lazımdır, lakin insan fəaliyyəti onu gücləndirir və iqlim dəyişikliyinə səbəb olur. Sənayedə əsas mənbələr yanacaq, elektrik və logistikadır.',
    en: '**The greenhouse effect** is the warming of Earth’s surface as gases such as CO₂, methane, nitrous oxide and water vapour trap solar heat. It is natural and necessary for life, but human activity intensifies it and drives climate change. In industry, the main sources are fuel, electricity and logistics.',
    ru: '**Парниковый эффект** — потепление поверхности Земли из-за того, что газы (CO₂, метан, закись азота, водяной пар) удерживают солнечное тепло. Это естественный и необходимый для жизни процесс, но человеческая деятельность усиливает его и вызывает изменение климата. В промышленности основные источники — топливо, электроэнергия и логистика.'
  },
  {
    keys: ['net zero', 'net sıfır', 'net sifir', 'karbon neytrallığı', 'carbon neutral', 'углеродная нейтральность', 'netzero'],
    az: '**Net zero (xalis sıfır)** — atmosferə buraxdığınız istixana qazlarının miqdarı ilə atmosferdən çıxardığınız və ya kompensasiya etdiyiniz miqdarın bərabər olmasıdır. Buna çatmaq üçün əvvəlcə emissiyaları azaltmaq (enerji səmərəliliyi, bərpa olunan enerji, logistika), sonra qaçılmaz qalıqları kompensasiya etmək lazımdır. “Karbon neytrallığı” çox vaxt yalnız CO₂-yə aid edilir, “net zero” isə bütün istixana qazlarını əhatə edir.',
    en: '**Net zero** means the greenhouse gases you emit are balanced by the amount you remove or compensate. The path is to reduce first (energy efficiency, renewables, logistics) and then offset unavoidable residuals. “Carbon neutral” often refers only to CO₂, while “net zero” covers all greenhouse gases.',
    ru: '**Net zero (чистый ноль)** — это баланс между выбросами парниковых газов и их удалением или компенсацией. Сначала нужно сокращать выбросы (энергоэффективность, ВИЭ, логистика), затем компенсировать неизбежные остатки. «Углеродная нейтральность» часто относится только к CO₂, а «net zero» охватывает все парниковые газы.'
  },
  {
    keys: ['karbon kompensasiyası', 'carbon offset', 'karbon krediti', 'carbon credit', 'углеродные кредиты', 'компенсация выбросов'],
    az: '**Karbon kompensasiyası** — emissiyaları azaltmaq mümkün olmayanda, ağacəkmə, bərpa olunan enerji və ya meşə qorunması kimi layihələrə investisiya edərək karbon krediti almaqdır. Bu, azaltmanın əvəzi deyil, son addımdır: əvvəlcə emissiyanı real olaraq azaltmaq, sonra qalan hissəni kompensasiya etmək düzgün yanaşmadır.',
    en: '**Carbon offsetting** means buying carbon credits from projects such as reforestation, renewable energy or forest protection when emissions cannot be reduced further. It is a last step, not a substitute for reduction: first cut real emissions, then offset the remainder.',
    ru: '**Компенсация выбросов** — покупка углеродных кредитов у проектов (лесовосстановление, ВИЭ, охрана лесов), когда выбросы уже нельзя сократить. Это последний шаг, а не замена сокращению: сначала реально снижаем выбросы, затем компенсируем остаток.'
  },
  {
    keys: ['cbam', 'karbon vergisi', 'carbon tax', 'углеродный налог', 'трансграничный углеродный'],
    az: '**CBAM (Carbon Border Adjustment Mechanism)** — Aİ-nin sərhəd karbon mexanizmidir. Aİ-yə idxal olunan karbon-intensiv məhsullara (sement, polad, alüminium, gübrə, elektrik, hidrogen) istehsal zamanı yaranan emissiyalara görə ödəniş tətbiq edilir. **Karbon vergisi** isə ölkə daxilində emissiyalara görə tətbiq olunan vergidir. Hər ikisi “çirkləndirici ödəyir” prinsipinə əsaslanır.',
    en: '**CBAM (Carbon Border Adjustment Mechanism)** is the EU’s border carbon mechanism. Carbon-intensive imports (cement, steel, aluminium, fertiliser, electricity, hydrogen) face a charge based on emissions from production. A **carbon tax** is a domestic levy on emissions. Both apply the “polluter pays” principle.',
    ru: '**CBAM (механизм трансграничного углеродного регулирования)** — пограничный углеродный механизм ЕС. На импорт углеродоёмких товаров (цемент, сталь, алюминий, удобрения, электроэнергия, водород) взимается плата с учётом выбросов при производстве. **Углеродный налог** — внутренний налог на выбросы. Оба основаны на принципе «загрязнитель платит».'
  },
  {
    keys: ['iso 14001', 'iso14001'],
    az: '**ISO 14001** — ətraf mühitin idarə edilməsi üçün beynəlxalq standartdır. Ekoloji aspektlərin müəyyən edilməsi, hədəflərin qoyulması, təcili hallara hazırlıq və davamlı yaxşılaşdırma tələb edir. Sertifikatlaşma müştərilər və tenderlər üçün etibarlılıq yaradır.',
    en: '**ISO 14001** is the international standard for environmental management. It requires identifying environmental aspects, setting objectives, emergency preparedness and continual improvement. Certification builds trust with customers and in tenders.',
    ru: '**ISO 14001** — международный стандарт управления окружающей средой. Он требует выявления экологических аспектов, постановки целей, готовности к чрезвычайным ситуациям и постоянного улучшения. Сертификация повышает доверие клиентов и помогает в тендерах.'
  },
  {
    keys: ['iso 50001', 'iso50001'],
    az: '**ISO 50001** — enerji idarəetməsi standartıdır. Enerji istifadəsini ölçmək, əsas göstəriciləri müəyyən etmək və sistematik şəkildə azaltmaq üçün çərçivə verir. Enerji xərclərini və CO₂ emissiyalarını birlikdə azaltmaq üçün çox effektivdir.',
    en: '**ISO 50001** is the energy management standard. It provides a framework to measure energy use, set baselines and reduce consumption systematically. It is highly effective for cutting both energy costs and CO₂ emissions.',
    ru: '**ISO 50001** — стандарт энергоменеджмента. Он даёт структуру для измерения потребления энергии, установления базовых показателей и системного снижения. Эффективно сокращает и затраты на энергию, и выбросы CO₂.'
  },
  {
    keys: ['iso 45001', 'iso45001'],
    az: '**ISO 45001** — işçilərin təhlükəsizliyi və sağlamlığının idarə edilməsi standartıdır. Risklərin qiymətləndirilməsi, insidentlərin araşdırılması, işçilərin iştirakı və davamlı yaxşılaşdırma tələb edir. HSE göstəricilərinizi bu standartla uyğunlaşdırmaq hesabat keyfiyyətini artırır.',
    en: '**ISO 45001** is the standard for occupational health and safety management. It requires risk assessment, incident investigation, worker participation and continual improvement. Aligning your HSE metrics with it improves reporting quality.',
    ru: '**ISO 45001** — стандарт управления охраной труда и безопасностью. Он требует оценки рисков, расследования инцидентов, участия работников и постоянного улучшения. Согласование показателей HSE с этим стандартом повышает качество отчётности.'
  },
  {
    keys: ['csrd', 'csddd', 'korportiv davamlılıq hesabatı direktivi', 'corporate sustainability reporting directive', 'ксоо'],
    az: '**CSRD (Corporate Sustainability Reporting Directive)** — Aİ-nin korporativ davamlılıq hesabatı direktividir. Şirkətlərdən ESG məlumatlarını vahid standartlara (ESRS) uyğun, audited və rəqəmsal formatda açıqlamalarını tələb edir. Təchizat zəncirində Aİ tərəfdaşları olan şirkətlər üçün dolayı da olsa relevant ola bilər.',
    en: '**CSRD (Corporate Sustainability Reporting Directive)** is the EU directive on corporate sustainability reporting. It requires companies to disclose ESG data under common standards (ESRS), with assurance and in a digital format. It can affect non-EU companies that are in EU supply chains.',
    ru: '**CSRD (Директива о корпоративной отчётности в области устойчивого развития)** — директива ЕС. Она требует раскрытия ESG-данных по единым стандартам (ESRS), с заверением и в цифровом формате. Может косвенно затрагивать компании из цепочек поставок ЕС.'
  },
  {
    keys: ['eu taksonomiyası', 'eu taxonomy', 'таксономия ес'],
    az: '**Aİ Taksonomiyası** — hansı iqtisadi fəaliyyətlərin “ekoloji cəhətdən davamlı” sayıldığını müəyyən edən təsnifatdır. Altı ekoloji hədəfə uyğunluq, “əhəmiyyətli zərər verməmə” və minimum sosial təminat prinsiplərinə əsaslanır. Yaşıl maliyyələşdirmə üçün vacibdir.',
    en: '**The EU Taxonomy** is a classification of which economic activities count as environmentally sustainable. It is based on six environmental objectives, the “do no significant harm” principle and minimum social safeguards. It matters for green finance.',
    ru: '**Таксономия ЕС** — классификация видов экономической деятельности, которые считаются экологически устойчивыми. Она основана на шести экологических целях, принципе «не наносить существенного вреда» и минимальных социальных гарантиях. Важна для зелёного финансирования.'
  },
  {
    keys: ['dövriyyə iqtisadiyyatı', 'dovriyye iqtisadiyyati', 'circular economy', 'циркулярная экономика', 'экономика замкнутого цикла'],
    az: '**Dövriyyə iqtisadiyyatı** — “almaq, istifadə etmək, atmaq” modelinin əvəzinə materialların mümkün qədər uzun müddət istifadədə saxlanması, təkrar emal və yenidən istifadə edilməsidir. Tullantıları xammala çevirməklə həm xərclər, həm də ekoloji təsir azalır.',
    en: '**The circular economy** replaces “take, make, dispose” with keeping materials in use as long as possible through reuse, repair and recycling. Turning waste into feedstock reduces both costs and environmental impact.',
    ru: '**Циркулярная экономика** заменяет модель «взять — использовать — выбросить» на максимально долгое использование материалов, повторное применение и переработку. Превращение отходов в сырьё снижает и затраты, и экологическое воздействие.'
  },
  {
    keys: ['biomüxtəliflik', 'biodiversity', 'биоразнообразие'],
    az: '**Biomüxtəliflik** — ekosistemlərin, növlərin və genetik müxtəlifliyin zənginliyidir. Sənaye sahələri üçün torpaqdan istifadə, suyun çirklənməsi və təchizat zənciri vasitəsilə əhəmiyyətlidir. ESG hesabatlarında biomüxtəlifliyə təsir getdikcə daha çox tələb olunur.',
    en: '**Biodiversity** is the richness of ecosystems, species and genetic diversity. For industry it matters through land use, water pollution and supply chains. Biodiversity impact is increasingly required in ESG reporting.',
    ru: '**Биоразнообразие** — богатство экосистем, видов и генетического разнообразия. Для промышленности оно важно через землепользование, загрязнение воды и цепочки поставок. Воздействие на биоразнообразие всё чаще требуется раскрывать в ESG-отчётах.'
  },
  {
    keys: ['greenwashing', 'yaşıl yuma', 'yasil yuma', 'гринвошинг', 'зелёный камуфляж'],
    az: '**Greenwashing (yaşıl yuma)** — şirkətin real fəaliyyətindən daha “yaşıl” görünmək üçün əsassız və ya yanıltıcı ekoloji iddialar irəli sürməsidir. Bundan qaçmaq üçün hər iddianı ölçülə bilən data, metodologiya və üçüncü tərəf auditi ilə dəstəkləmək lazımdır.',
    en: '**Greenwashing** is making unsupported or misleading environmental claims to appear greener than you are. To avoid it, back every claim with measurable data, a clear methodology and third-party assurance.',
    ru: '**Гринвошинг** — необоснованные или вводящие в заблуждение экологические заявления, чтобы казаться «зеленее», чем есть на самом деле. Чтобы избежать этого, каждое заявление должно подкрепляться измеримыми данными, методологией и независимой проверкой.'
  },
  {
    keys: ['iqlim riski', 'climate risk', 'климатический риск', 'fiziki risk', 'keçid riski'],
    az: '**İqlim riskləri** iki yerə bölünür: **fiziki risklər** (sel, quraqlıq, isti dalğalar, tufanlar) və **keçid riskləri** (karbon qiymətləri, yeni qaydalar, texnologiya dəyişikliyi, bazar tələbi). ESG idarəetməsində hər ikisi maliyyə riski kimi qiymətləndirilməlidir.',
    en: '**Climate risks** fall into two groups: **physical risks** (floods, droughts, heatwaves, storms) and **transition risks** (carbon prices, new regulation, technology shifts, market demand). Both should be assessed as financial risks in ESG management.',
    ru: '**Климатические риски** делятся на **физические** (наводнения, засухи, волны жары, штормы) и **переходные** (углеродные цены, новое регулирование, смена технологий, спрос рынка). Оба типа следует оценивать как финансовые риски в ESG-менеджменте.'
  },
  {
    keys: ['esg investisiya', 'esg investing', 'responsible investment', 'esg инвестиции', 'ответственное инвестирование'],
    az: '**ESG investisiyası** — investisiya qərarlarında yalnız maliyyə göstəricilərini deyil, ekoloji, sosial və idarəetmə risklərini də nəzərə alan yanaşmadır. Yüksək ESG balı olan şirkətlər adətən daha aşağı risk və daha sabit uzunmüddətli gəlirlə əlaqələndirilir, lakin bu zəmanət deyil.',
    en: '**ESG investing** considers environmental, social and governance risks alongside financial metrics. Companies with stronger ESG profiles are often associated with lower risk and more stable long-term returns, though this is not a guarantee.',
    ru: '**ESG-инвестирование** учитывает экологические, социальные и управленческие риски наряду с финансовыми показателями. Компании с более высоким ESG-профилем часто связывают с меньшим риском и более стабильной долгосрочной доходностью, но это не гарантия.'
  },
  {
    keys: ['azərbaycan', 'azerbaijan', 'азербайджан'],
    az: '**Azərbaycan** Cənubi Qafqazda, Xəzər dənizinin qərb sahilində yerləşir; paytaxtı **Bakı**dır. İqtisadiyyatında neft-qaz sektoru mühüm yer tutur, son illərdə bərpa olunan enerji (günəş və külək) və yaşıl keçid layihələri də sürətlə inkişaf edir. ESG baxımından enerji keçidi, su ehtiyatları və sosial inkluziya əsas mövzulardır.',
    en: '**Azerbaijan** is located in the South Caucasus on the western shore of the Caspian Sea; its capital is **Baku**. Oil and gas remain important, while renewable energy (solar and wind) and green transition projects are growing fast. Key ESG topics include energy transition, water resources and social inclusion.',
    ru: '**Азербайджан** расположен на Южном Кавказе на западном берегу Каспийского моря; столица — **Баку**. Нефтегазовый сектор остаётся важным, при этом быстро развиваются ВИЭ (солнце и ветер) и проекты зелёного перехода. Ключевые ESG-темы — энергопереход, водные ресурсы и социальная инклюзия.'
  },
  {
    keys: ['bakı', 'baku', 'баку'],
    az: '**Bakı** Azərbaycanın paytaxtı və Xəzər dənizinin ən böyük liman şəhəridir. Ölkənin sənaye, maliyyə və logistika mərkəzidir. Havasının keyfiyyəti, su və tullantı idarəetməsi kimi şəhər ESG məsələləri burada xüsusilə aktualdır.',
    en: '**Baku** is the capital of Azerbaijan and the largest port city on the Caspian Sea. It is the country’s industrial, financial and logistics hub. Urban ESG issues such as air quality, water and waste management are especially relevant there.',
    ru: '**Баку** — столица Азербайджана и крупнейший портовый город на Каспийском море. Это промышленный, финансовый и логистический центр страны. Городские ESG-вопросы — качество воздуха, вода и управление отходами — особенно актуальны.'
  },
  {
    keys: ['süni intellekt və esg', 'ai və esg', 'ai and esg', 'ии и esg', 'искусственный интеллект esg'],
    az: '**Süni intellekt ESG-də** data toplama, emissiya proqnozu, anomaliya aşkarlama, enerji optimizasiyası və hesabatın avtomatlaşdırılması üçün istifadə olunur. AI-ın özü də enerji və su istehlak edir, ona görə “məsuliyyətli AI” prinsipləri getdikcə vacib olur.',
    en: '**AI in ESG** is used for data collection, emissions forecasting, anomaly detection, energy optimisation and report automation. AI itself consumes energy and water, so responsible AI principles are increasingly important.',
    ru: '**ИИ в ESG** применяется для сбора данных, прогнозирования выбросов, выявления аномалий, оптимизации энергии и автоматизации отчётности. Сам ИИ потребляет энергию и воду, поэтому принципы ответственного ИИ становятся всё важнее.'
  }
];

/* ------------------------------------------------------------------ */
/*  ƏSAS NİYYƏTLƏR                                                     */
/* ------------------------------------------------------------------ */

const INTENTS = [
  {
    id: 'identity',
    keywords: ['kim sən', 'sən kimsən', 'who are you', 'кто ты', 'adın nədir', 'səni kim yaratdı', 'bluegreen ai nədir', 'what are you'],
    reply: ({ lang }) => pick(
      lang,
      'Mən **BlueGreen AI** — bu platformanın ESG və davamlılıq köməkçisiyəm. Karbon, enerji, su, tullantı, sosial və idarəetmə göstəricilərini izah edir, riskləri görməyə və hesabat hazırlamağa kömək edirəm. Eyni zamanda saytın istifadəsi ilə bağlı istənilən sualınıza cavab verə bilərəm.',
      'I am **BlueGreen AI**, the ESG and sustainability assistant of this platform. I explain carbon, energy, water, waste, social and governance metrics, help you spot risks and prepare reports. I can also answer any question about using the site.',
      'Я **BlueGreen AI** — ESG- и sustainability-помощник этой платформы. Я объясняю показатели углерода, энергии, воды, отходов, социальной сферы и управления, помогаю выявлять риски и готовить отчёты. Также отвечаю на любые вопросы по использованию сайта.'
    )
  },
  {
    id: 'greeting',
    keywords: ['salam', 'salamlar', 'hello', 'hi ', 'hey', 'привет', 'здравствуйте', 'sabahın xeyir', 'axşamın xeyir'],
    reply: ({ lang, metrics }) => {
      const m = snapshot(metrics);
      return pick(
        lang,
        `Salam! 👋 Mən BlueGreen AI-yəm. ESG, davamlılıq və saytın göstəriciləri ilə bağlı istənilən sualınızı verə bilərsiniz.\n\n${summaryLine(lang, m)}`,
        `Hello! 👋 I am BlueGreen AI. Ask me anything about ESG, sustainability or the metrics on this site.\n\n${summaryLine(lang, m)}`,
        `Здравствуйте! 👋 Я BlueGreen AI. Спрашивайте о ESG, устойчивом развитии или показателях сайта.\n\n${summaryLine(lang, m)}`
      );
    }
  },
  {
    id: 'thanks',
    keywords: ['sağ ol', 'sag ol', 'təşəkkür', 'tesekkur', 'thanks', 'thank you', 'спасибо', 'razıyam'],
    reply: ({ lang }) => pick(
      lang,
      'Buyurun! 😊 Başqa sualınız varsa, çəkinmədən yazın — ESG, göstəricilər, hesabat və ya saytın istifadəsi ilə bağlı kömək edə bilərəm.',
      'You are welcome! 😊 If you have another question, just ask — I can help with ESG, metrics, reporting or using the site.',
      'Пожалуйста! 😊 Если есть другие вопросы — спрашивайте, я помогу с ESG, показателями, отчётностью или использованием сайта.'
    )
  },
  {
    id: 'capabilities',
    keywords: ['nə edə bilərsən', 'neler ede bilersen', 'kömək', 'komek', 'help', 'what can you do', 'что умеешь', 'imkanların', 'funksiyaların'],
    reply: ({ lang }) => pick(
      lang,
      'Mən bunlarla kömək edə bilərəm:\n\n• **ESG anlayışları** — E, S, G, GRI, CSRD, ISO, Paris Sazişi və s.\n• **Cari göstəricilərin izahı** — CO₂, enerji, su, tullantı, HSE, təlim.\n• **Tövsiyələr** — göstəriciləri necə yaxşılaşdırmaq olar.\n• **Hesabat və profil** — Excel/PDF ixracı, profil yeniləmə, şifrə.\n• **Ümumi bilik** — davamlılıq, iqlim, dövriyyə iqtisadiyyatı və s.\n• **Sadə hesablamalar** — riyazi ifadə yazsanız, hesablayaram.\n\nSadəcə sualınızı yazın.',
      'I can help with:\n\n• **ESG concepts** — E, S, G, GRI, CSRD, ISO, the Paris Agreement, etc.\n• **Explaining current metrics** — CO₂, energy, water, waste, HSE, training.\n• **Recommendations** — how to improve performance.\n• **Reports and profile** — Excel/PDF export, profile updates, password.\n• **General knowledge** — sustainability, climate, circular economy, etc.\n• **Simple calculations** — type a maths expression and I will calculate it.\n\nJust ask your question.',
      'Я могу помочь с:\n\n• **Понятиями ESG** — E, S, G, GRI, CSRD, ISO, Парижское соглашение и др.\n• **Объяснением текущих показателей** — CO₂, энергия, вода, отходы, HSE, обучение.\n• **Рекомендациями** — как улучшить показатели.\n• **Отчётами и профилем** — экспорт Excel/PDF, обновление профиля, пароль.\n• **Общими знаниями** — устойчивое развитие, климат, циркулярная экономика и др.\n• **Простыми расчётами** — напишите выражение, и я посчитаю.\n\nПросто задайте вопрос.'
    )
  },
  {
    id: 'esg_definition',
    keywords: ['esg nədir', 'esg nedir', 'what is esg', 'что такое esg', 'esg nə deməkdir', 'esg prinsipləri', 'esg mənası'],
    reply: ({ lang, metrics }) => {
      const m = snapshot(metrics);
      return pick(
        lang,
        `**ESG** — “Environment, Social, Governance” (Ətraf mühit, Sosial, İdarəetmə) sözünün qısaltmasıdır. Şirkətin yalnız maliyyə göstəricilərini deyil, davamlılıq və məsuliyyətini qiymətləndirən çərçivədir:\n\n• **E (Ətraf mühit):** CO₂ emissiyaları, enerji, su, tullantı, biomüxtəliflik.\n• **S (Sosial):** işçi hüquqları, təhlükəsizlik, təlim, bərabərlik, icma.\n• **G (İdarəetmə):** şəffaflıq, audit, etika, kiber təhlükəsizlik, risk idarəetməsi.\n\nSizin cari göstəriciləriniz: ${summaryLine(lang, m).replace('Cari göstəricilər — ', '').replace('Current readings — ', '').replace('Текущие показатели — ', '')}`,
        `**ESG** stands for “Environment, Social, Governance”. It is a framework for assessing a company’s sustainability and responsibility, not just its financial performance:\n\n• **E (Environment):** CO₂ emissions, energy, water, waste, biodiversity.\n• **S (Social):** labour rights, safety, training, equality, community.\n• **G (Governance):** transparency, audit, ethics, cybersecurity, risk management.\n\nYour current readings: ${summaryLine(lang, m).replace('Current readings — ', '')}`,
        `**ESG** расшифровывается как “Environment, Social, Governance” (экология, социальная сфера, управление). Это система оценки устойчивости и ответственности компании, а не только финансовых результатов:\n\n• **E (Экология):** выбросы CO₂, энергия, вода, отходы, биоразнообразие.\n• **S (Социальная сфера):** права работников, безопасность, обучение, равенство, общество.\n• **G (Управление):** прозрачность, аудит, этика, кибербезопасность, управление рисками.\n\nВаши текущие показатели: ${summaryLine(lang, m).replace('Текущие показатели — ', '')}`
      );
    }
  },
  {
    id: 'carbon',
    keywords: ['co2', 'co₂', 'karbon', 'carbon', 'emissiya', 'emission', 'scope 1', 'scope 2', 'scope 3', 'skop', 'выброс', 'углерод', 'karbon izi', 'carbon footprint'],
    reply: ({ lang, metrics }) => {
      const m = snapshot(metrics);
      const co2 = Number(m.co2);
      const status = co2 <= 50
        ? pick(lang, 'nəzarət altındadır', 'is under control', 'находится под контролем')
        : pick(lang, 'diqqət tələb edir', 'needs attention', 'требует внимания');
      return pick(
        lang,
        `**Cari CO₂ göstəriciniz: ${m.co2} tCO₂e** — ${status}.\n\n**Scope-lar nədir?**\n• **Scope 1** — öz yanacaq istifadəniz (qazanlar, avtomobillər, generatorlar).\n• **Scope 2** — aldığınız elektrik və istilik enerjisinin emissiyaları.\n• **Scope 3** — təchizat zənciri, logistika, işçilərin gediş-gəlişi, məhsulun istifadəsi.\n\n**Azaltma yolları:**\n1. Enerji səmərəliliyi və itkilərin aradan qaldırılması.\n2. Günəş/külək kimi bərpa olunan enerjiyə keçid.\n3. Logistikanın optimizasiyası və yük doldurma dərəcəsinin artırılması.\n4. Tullantı və material itkilərinin azaldılması.\n5. Aylıq monitorinq və hədəf qoyulması.`,
        `**Your current CO₂ reading: ${m.co2} tCO₂e** — ${status}.\n\n**What are scopes?**\n• **Scope 1** — your own fuel use (boilers, vehicles, generators).\n• **Scope 2** — emissions from purchased electricity and heat.\n• **Scope 3** — supply chain, logistics, commuting and product use.\n\n**How to reduce it:**\n1. Improve energy efficiency and eliminate losses.\n2. Switch to renewables such as solar and wind.\n3. Optimise logistics and increase load factors.\n4. Reduce waste and material losses.\n5. Monitor monthly and set targets.`,
        `**Ваш текущий показатель CO₂: ${m.co2} тCO₂e** — ${status}.\n\n**Что такое Scope?**\n• **Scope 1** — собственное сжигание топлива (котлы, транспорт, генераторы).\n• **Scope 2** — выбросы от купленной электроэнергии и тепла.\n• **Scope 3** — цепочка поставок, логистика, поездки сотрудников, использование продукции.\n\n**Как снизить:**\n1. Повысить энергоэффективность и устранить потери.\n2. Перейти на ВИЭ (солнце, ветер).\n3. Оптимизировать логистику и загрузку транспорта.\n4. Сократить отходы и потери материалов.\n5. Вести ежемесячный мониторинг и ставить цели.`
      );
    }
  },
  {
    id: 'energy',
    keywords: ['enerji', 'energy', 'elektrik', 'electricity', 'bərpa olunan', 'renewable', 'günəş', 'külək', 'solar', 'wind', 'энерг', 'электрич', 'enerji istehlak', 'enerji sərfiyyatı', 'energy consumption', 'потребление энергии', 'энергопотребление'],
    reply: ({ lang, metrics }) => {
      const m = snapshot(metrics);
      return pick(
        lang,
        `**Cari enerji istehlakınız: ${m.energy} kWh.**\n\nEnerji həm xərc, həm də Scope 2 emissiyasının əsas mənbəyidir. Praktiki addımlar:\n\n1. **Enerji auditi** — hansı avadanlıq və proseslərin ən çox istehlak etdiyini müəyyən edin.\n2. **Səmərəlilik** — LED işıqlandırma, tezlik çeviriciləri, kompressor və nasosların optimizasiyası.\n3. **Bərpa olunan enerji** — damda günəş panelləri, mümkünsə külək və yaşıl tarif.\n4. **İstilik bərpası** — isti su və egzoz istiliyinin təkrar istifadəsi.\n5. **Davranış** — boş sahələrdə işıq/cihazların söndürülməsi, gecə rejimləri.\n\nHədəf: əvvəlcə 5–10% azalma, sonra bərpa olunan payını artırmaq.`,
        `**Your current energy consumption: ${m.energy} kWh.**\n\nEnergy is both a cost and the main source of Scope 2 emissions. Practical steps:\n\n1. **Energy audit** — identify which equipment and processes consume the most.\n2. **Efficiency** — LED lighting, variable frequency drives, optimised compressors and pumps.\n3. **Renewables** — rooftop solar, wind where feasible, or a green tariff.\n4. **Heat recovery** — reuse waste heat from hot water and exhaust.\n5. **Behaviour** — switch off idle equipment and lights, use night modes.\n\nTarget: a 5–10% reduction first, then increase the renewable share.`,
        `**Ваше текущее потребление энергии: ${m.energy} кВт·ч.**\n\nЭнергия — это и затраты, и основной источник выбросов Scope 2. Практические шаги:\n\n1. **Энергоаудит** — определите, какое оборудование и процессы потребляют больше всего.\n2. **Эффективность** — LED-освещение, частотные преобразователи, оптимизация компрессоров и насосов.\n3. **ВИЭ** — солнечные панели на крыше, ветер где возможно или зелёный тариф.\n4. **Рекуперация тепла** — повторное использование тепла горячей воды и выхлопа.\n5. **Поведение** — выключать оборудование и свет, ночные режимы.\n\nЦель: сначала снижение на 5–10%, затем рост доли ВИЭ.`
      );
    }
  },
  {
    id: 'water',
    keywords: ['su istehlakı', 'su istehlaki', 'su istehlak', 'su sərfiyyatı', 'su qənaəti', 'su itkisi', 'su sızması', 'suyu', 'sudan', 'suya', 'suyun', 'su ehtiyat', 'water', 'water consumption', 'вода', 'воды', 'water usage'],
    reply: ({ lang, metrics }) => {
      const m = snapshot(metrics);
      return pick(
        lang,
        `**Cari su istehlakınız: ${m.water} m³.**\n\nSu ESG-nin “E” hissəsində vacib göstəricidir, xüsusilə su qıtlığı olan bölgələrdə. Azaltma yolları:\n\n1. **Sızmaların aşkarlanması** — gecə sayğac oxunuşları ilə gizli itkiləri tapın.\n2. **Təkrar istifadə** — təmizlənmiş çirkli suyu yuma, soyutma və ya torpaq suvarmada istifadə edin.\n3. **Yağış suyu** — dam sularını toplayıb texniki ehtiyaclara yönəldin.\n4. **Sayğaclar** — sexlər üzrə ayrıca ölçmə və hədəflər.\n5. **Texnologiya** — quru təmizləmə, yüksək təzyiqli az su sərf edən avadanlıq.\n\nSu riski hesabatında su stressi olan hövzələr xüsusi qeyd olunmalıdır.`,
        `**Your current water consumption: ${m.water} m³.**\n\nWater is a key part of the “E” in ESG, especially in water-stressed regions. Ways to reduce it:\n\n1. **Leak detection** — use night-time meter readings to find hidden losses.\n2. **Reuse** — use treated wastewater for washing, cooling or irrigation.\n3. **Rainwater** — harvest roof water for technical needs.\n4. **Metering** — separate meters and targets per workshop.\n5. **Technology** — dry cleaning, low-flow high-pressure equipment.\n\nIn water reporting, basins with high water stress should be explicitly disclosed.`,
        `**Ваше текущее потребление воды: ${m.water} м³.**\n\nВода — важная часть «E» в ESG, особенно в регионах водного стресса. Способы снижения:\n\n1. **Поиск утечек** — ночные показания счётчиков помогут найти скрытые потери.\n2. **Повторное использование** — очищенные стоки для мойки, охлаждения или полива.\n3. **Дождевая вода** — сбор с крыш для технических нужд.\n4. **Учёт** — отдельные счётчики и цели по цехам.\n5. **Технологии** — сухая очистка, оборудование с низким расходом.\n\nВ отчётности следует отдельно раскрывать водный стресс в бассейнах.`
      );
    }
  },
  {
    id: 'waste',
    keywords: ['tullantı', 'tullanti', 'utilizasiya', 'recycle', 'recycling', 'waste', 'отход', 'təkrar emal', 'dövriyyə iqtisadiyyatı'],
    reply: ({ lang, metrics }) => {
      const m = snapshot(metrics);
      return pick(
        lang,
        `**Tullantıların utilizasiya payı: ${m.waste}%.**\n\nBu göstərici nə qədər yüksəkdirsə, bir o qədər yaxşıdır. Yaxşılaşdırma üçün:\n\n1. **Ayrı toplama** — kağız, plastik, metal, şüşə və təhlükəli tullantılar üçün ayrı qablar.\n2. **Təchizatçı ilə razılaşma** — qablaşdırmanın geri qaytarılması.\n3. **Kompost** — üzvi tullantıların ayrılması.\n4. **Daxili təkrar istifadə** — material qırıntılarının yenidən istehsala qaytarılması.\n5. **Ölçmə** — tullantı növləri üzrə aylıq miqdar və hədəf.\n\n“Dövriyyə iqtisadiyyatı” yanaşması tullantını xammala çevirməyə kömək edir.`,
        `**Your waste recycling rate: ${m.waste}%.**\n\nThe higher this is, the better. To improve it:\n\n1. **Segregation** — separate bins for paper, plastic, metal, glass and hazardous waste.\n2. **Supplier agreements** — take-back schemes for packaging.\n3. **Composting** — separate organic waste.\n4. **Internal reuse** — return material offcuts to production.\n5. **Measurement** — monthly quantities and targets by waste type.\n\nA circular-economy approach turns waste into feedstock.`,
        `**Доля переработки отходов: ${m.waste}%.**\n\nЧем выше, тем лучше. Для улучшения:\n\n1. **Раздельный сбор** — отдельные контейнеры для бумаги, пластика, металла, стекла и опасных отходов.\n2. **Договоры с поставщиками** — возврат упаковки.\n3. **Компостирование** — отдельный сбор органики.\n4. **Внутреннее повторное использование** — возврат обрезков в производство.\n5. **Измерение** — ежемесячные объёмы и цели по видам отходов.\n\nПодход циркулярной экономики превращает отходы в сырьё.`
      );
    }
  },
  {
    id: 'social_hse',
    keywords: ['hse', 'təhlükəsizlik', 'tehlukesizlik', 'insident', 'incident', 'işçi', 'isci', 'heyət', 'heyet', 'təlim', 'telim', 'training', 'sosial', 'social', 'employee', 'безопасн', 'сотрудник', 'обучен'],
    reply: ({ lang, metrics }) => {
      const m = snapshot(metrics);
      return pick(
        lang,
        `**Sosial göstəricilər:** HSE üzrə ${m.hse} insidentsiz gün, işçilərin orta təlimi ${m.training} saat.\n\n“S” komponenti işçilər, təchizatçılar və icma ilə münasibətləri əhatə edir. Prioritetlər:\n\n1. **Təhlükəsizlik** — risk qiymətləndirməsi, fərdi qoruyucu vasitələr, insidentlərin kök səbəb araşdırması.\n2. **Təlim** — yeni işçilər üçün orientasiya, təhlükəsizlik və ESG təlimləri.\n3. **İşçi məmnuniyyəti** — rəy sorğuları, karyera və ədalətli əməkhaqqı.\n4. **Bərabərlik** — gender balansı və inklüziv iş mühiti.\n5. **İcma** — yerli layihələr və sosial investisiyalar.\n\nHSE göstəricisini ISO 45001 çərçivəsində idarə etmək hesabatı gücləndirir.`,
        `**Social metrics:** ${m.hse} incident-free HSE days and ${m.training} average training hours per employee.\n\nThe “S” pillar covers employees, suppliers and communities. Priorities:\n\n1. **Safety** — risk assessment, PPE, root-cause investigation of incidents.\n2. **Training** — onboarding, safety and ESG training.\n3. **Employee satisfaction** — surveys, career development and fair pay.\n4. **Equality** — gender balance and an inclusive workplace.\n5. **Community** — local projects and social investment.\n\nManaging HSE under ISO 45001 strengthens your reporting.`,
        `**Социальные показатели:** ${m.hse} дней без инцидентов HSE и ${m.training} ч среднего обучения на сотрудника.\n\nКомпонент «S» охватывает сотрудников, поставщиков и общество. Приоритеты:\n\n1. **Безопасность** — оценка рисков, СИЗ, расследование корневых причин инцидентов.\n2. **Обучение** — адаптация, охрана труда и ESG-обучение.\n3. **Удовлетворённость** — опросы, карьерное развитие и справедливая оплата.\n4. **Равенство** — гендерный баланс и инклюзивная среда.\n5. **Общество** — местные проекты и социальные инвестиции.\n\nУправление HSE по ISO 45001 усиливает отчётность.`
      );
    }
  },
  {
    id: 'governance',
    keywords: ['idarəetmə', 'idareetme', 'governance', 'gri', 'audit', 'şəffaflıq', 'seffaflik', 'transparency', 'kiber', 'cyber', 'etika', 'ethics', 'korrupsiya', 'управлен', 'аудит', 'прозрачн'],
    reply: ({ lang }) => pick(
      lang,
      '**GRI (Global Reporting Initiative)** — şirkətlərin ESG göstəricilərini beynəlxalq standartlarla açıqlaması üçün ən geniş yayılmış çərçivədir. **“G” — İdarəetmə** komponenti isə şirkətin necə idarə olunduğunu, qərarların şəffaflığını və hesabatlılığını əhatə edir.\n\nSizin göstəriciləriniz yüksəkdir:\n• GRI uyğunluğu: **98.5%**\n• Şəffaflıq: **96%**\n• Kiber təhlükəsizlik təlimi: **95%**\n• Audit uyğunluğu: **92%**\n\nGücləndirmək üçün:\n1. Rüblük daxili audit və risk reyestri.\n2. Etika kodeksi və “whistleblowing” kanalı.\n3. Kiber təhlükəsizlik təlimlərini bütün işçilərə yaymaq.\n4. İdarə heyətində müxtəliflik və münaqişə maraqlarının idarəsi.\n5. GRI/CSRD uyğun illik hesabatın üçüncü tərəf təsdiqi.',
      '**GRI (Global Reporting Initiative)** is the most widely used framework for companies to disclose ESG metrics under international standards. The **“G” — Governance** pillar covers how the company is run, transparency and accountability.\n\nYour indicators are strong:\n• GRI compliance: **98.5%**\n• Transparency: **96%**\n• Cybersecurity training: **95%**\n• Audit compliance: **92%**\n\nTo strengthen them:\n1. Quarterly internal audit and a risk register.\n2. A code of ethics and a whistleblowing channel.\n3. Extend cybersecurity training to all employees.\n4. Board diversity and conflict-of-interest management.\n5. Third-party assurance of the annual GRI/CSRD report.',
      '**GRI (Global Reporting Initiative)** — наиболее широко используемая основа для раскрытия ESG-показателей по международным стандартам. Компонент **«G» — Управление** охватывает то, как управляется компания, прозрачность и подотчётность.\n\nВаши показатели высокие:\n• Соответствие GRI: **98,5%**\n• Прозрачность: **96%**\n• Обучение кибербезопасности: **95%**\n• Соответствие аудиту: **92%**\n\nДля усиления:\n1. Ежеквартальный внутренний аудит и реестр рисков.\n2. Кодекс этики и канал для сообщений о нарушениях.\n3. Распространение обучения кибербезопасности на всех сотрудников.\n4. Разнообразие совета директоров и управление конфликтами интересов.\n5. Независимое заверение годового отчёта GRI/CSRD.'
    )
  },
  {
    id: 'reports',
    keywords: ['hesabat', 'report', 'pdf', 'excel', 'ixrac', 'export', 'отчет', 'скачать', 'yüklə'],
    reply: ({ lang }) => pick(
      lang,
      '**Hesabat bölməsi** 12 aylıq ESG göstəricilərini cədvəl şəklində göstərir.\n\nİxrac etmək üçün:\n1. Sol menyudan **“Hesabat”** bölməsini açın.\n2. Cədvəlin üstündəki **Excel** və ya **PDF** düyməsini basın.\n3. Fayl avtomatik yüklənəcək.\n\nExcel faylı əlavə analiz üçün, PDF isə rəhbərliyə və ya auditə təqdim etmək üçün uyğundur. Hesabatda ətraf mühit, sosial və idarəetmə göstəriciləri ayrı-ayrı sütunlarda verilir.',
      'The **Reports** section shows 12 months of ESG metrics in a table.\n\nTo export:\n1. Open **“Report”** in the left menu.\n2. Click the **Excel** or **PDF** button above the table.\n3. The file downloads automatically.\n\nExcel is suitable for further analysis; PDF is suitable for management or audit submission. The report separates environmental, social and governance indicators.',
      'Раздел **«Отчёт»** показывает ESG-показатели за 12 месяцев в таблице.\n\nЧтобы экспортировать:\n1. Откройте **«Отчёт»** в левом меню.\n2. Нажмите кнопку **Excel** или **PDF** над таблицей.\n3. Файл скачается автоматически.\n\nExcel подходит для дальнейшего анализа, PDF — для руководства и аудита. В отчёте отдельно показаны экологические, социальные и управленческие показатели.'
    )
  },
  {
    id: 'profile',
    keywords: ['profil', 'profile', 'şifrə', 'sifre', 'password', 'parol', 'hesab', 'account', 'login', 'giriş', 'daxil ol', 'аккаунт', 'пароль', 'вход'],
    reply: ({ lang }) => pick(
      lang,
      '**Profil bölməsində** müəssisənin adını, e-poçtu və şifrəni dəyişə bilərsiniz.\n\n1. Sol menyudan **“Profil”** bölməsini açın.\n2. Müəssisənin adını və ya e-poçtu redaktə edin.\n3. Yeni şifrə yazın (ən azı 6 simvol) — boş buraxsanız, köhnə şifrə qalır.\n4. **“Yadda Saxla”** düyməsini basın.\n\nSessiya 24 saat etibarlıdır. Çıxış etmək üçün yuxarı sağdakı **“Çıxış”** düyməsindən istifadə edin. Şifrəni unutmusunuzsa, hazırda bərpa funksiyası yoxdur — yeni hesab yaratmalı və ya administratorla əlaqə saxlamalısınız.',
      'In the **Profile** section you can change the company name, email and password.\n\n1. Open **“Profile”** in the left menu.\n2. Edit the company name or email.\n3. Enter a new password (at least 6 characters) — leave it blank to keep the current one.\n4. Click **“Save”**.\n\nSessions are valid for 24 hours. Use the **“Log out”** button in the top-right corner to sign out. If you forget your password, there is currently no reset flow — create a new account or contact the administrator.',
      'В разделе **«Профиль»** можно изменить название компании, email и пароль.\n\n1. Откройте **«Профиль»** в левом меню.\n2. Измените название компании или email.\n3. Введите новый пароль (не менее 6 символов) — оставьте пустым, чтобы сохранить текущий.\n4. Нажмите **«Сохранить»**.\n\nСессия действует 24 часа. Для выхода используйте кнопку **«Выход»** справа вверху. Если вы забыли пароль, функции сброса пока нет — создайте новый аккаунт или обратитесь к администратору.'
    )
  },
  {
    id: 'metrics',
    keywords: ['göstərici', 'gosterici', 'metrik', 'metric', 'cari vəziyyət', 'current status', 'məlumat', 'показател', 'данные', 'neçədir', 'nə qədər'],
    reply: ({ lang, metrics }) => {
      const m = snapshot(metrics);
      const co2 = Number(m.co2);
      const energy = Number(m.energy);
      const water = Number(m.water);
      const waste = Number(m.waste);
      const training = Number(m.training);
      return pick(
        lang,
        `**Cari ESG göstəriciləri:**\n\n• CO₂: **${m.co2} tCO₂e** ${co2 <= 50 ? '✅ yaxşı' : '⚠️ diqqət'}\n• Enerji: **${m.energy} kWh** ${energy <= 62 ? '✅ yaxşı' : '⚠️ diqqət'}\n• Su: **${m.water} m³** ${water <= 3400 ? '✅ yaxşı' : '⚠️ diqqət'}\n• Tullantı utilizasiyası: **${m.waste}%** ${waste >= 75 ? '✅ yaxşı' : '⚠️ diqqət'}\n• HSE: **${m.hse} insidentsiz gün**\n• Təlim: **${m.training} saat** ${training >= 16 ? '✅ yaxşı' : '⚠️ diqqət'}\n\nQısa şərh: ən böyük fürsət enerji və su səmərəliliyindədir; tullantı və təlim göstəriciləri nisbətən yaxşı səviyyədədir.`,
        `**Current ESG readings:**\n\n• CO₂: **${m.co2} tCO₂e** ${co2 <= 50 ? '✅ good' : '⚠️ watch'}\n• Energy: **${m.energy} kWh** ${energy <= 62 ? '✅ good' : '⚠️ watch'}\n• Water: **${m.water} m³** ${water <= 3400 ? '✅ good' : '⚠️ watch'}\n• Waste recycling: **${m.waste}%** ${waste >= 75 ? '✅ good' : '⚠️ watch'}\n• HSE: **${m.hse} incident-free days**\n• Training: **${m.training} h** ${training >= 16 ? '✅ good' : '⚠️ watch'}\n\nBrief take: the biggest opportunity is energy and water efficiency; waste and training are relatively healthy.`,
        `**Текущие ESG-показатели:**\n\n• CO₂: **${m.co2} тCO₂e** ${co2 <= 50 ? '✅ хорошо' : '⚠️ внимание'}\n• Энергия: **${m.energy} кВт·ч** ${energy <= 62 ? '✅ хорошо' : '⚠️ внимание'}\n• Вода: **${m.water} м³** ${water <= 3400 ? '✅ хорошо' : '⚠️ внимание'}\n• Переработка отходов: **${m.waste}%** ${waste >= 75 ? '✅ хорошо' : '⚠️ внимание'}\n• HSE: **${m.hse} дней без инцидентов**\n• Обучение: **${m.training} ч** ${training >= 16 ? '✅ хорошо' : '⚠️ внимание'}\n\nКратко: наибольший потенциал — в энерго- и водосбережении; отходы и обучение на относительно хорошем уровне.`
      );
    }
  },
  {
    id: 'recommendations',
    keywords: ['tövsiyə', 'tovsiye', 'recommend', 'məsləhət', 'meslehet', 'yaxşılaşdır', 'yaxsilasdir', 'azalt', 'reduce', 'nə etməli', 'ne etmeli', 'improve', 'рекоменд', 'улучш', 'снизить'],
    reply: ({ lang, metrics }) => {
      const m = snapshot(metrics);
      const co2 = Number(m.co2);
      const energy = Number(m.energy);
      const water = Number(m.water);
      const waste = Number(m.waste);
      const training = Number(m.training);

      const actions = [];
      if (co2 > 50 || energy > 62) {
        actions.push(pick(
          lang,
          '**Enerji səmərəliliyi:** kompressor, nasos və havalandırma sistemlərini yoxlayın; gecə boş istehlakı azaldın; mümkünsə günəş panelləri əlavə edin.',
          '**Energy efficiency:** check compressors, pumps and ventilation; cut idle night-time consumption; add solar where feasible.',
          '**Энергоэффективность:** проверьте компрессоры, насосы и вентиляцию; сократите ночное потребление; добавьте солнечные панели, где возможно.'
        ));
      }
      if (water > 3400) {
        actions.push(pick(
          lang,
          '**Su itkiləri:** gecə sayğac oxunuşları ilə sızmaları tapın və təmizlənmiş suyu təkrar istifadə edin.',
          '**Water losses:** detect leaks with night-time meter readings and reuse treated water.',
          '**Потери воды:** найдите утечки по ночным показаниям счётчиков и повторно используйте очищенную воду.'
        ));
      }
      if (waste < 78) {
        actions.push(pick(
          lang,
          '**Tullantı:** ayrı toplama qablarını genişləndirin və təchizatçılarla qablaşdırmanın geri qaytarılması barədə razılaşın.',
          '**Waste:** expand segregated bins and agree packaging take-back with suppliers.',
          '**Отходы:** расширьте раздельный сбор и договоритесь с поставщиками о возврате упаковки.'
        ));
      }
      if (training < 18) {
        actions.push(pick(
          lang,
          '**Təlim:** rüblük ESG və təhlükəsizlik təlimləri keçirin, iştirakı ölçün.',
          '**Training:** run quarterly ESG and safety training and measure participation.',
          '**Обучение:** проводите ежеквартальное ESG- и обучение по безопасности, измеряйте участие.'
        ));
      }
      if (!actions.length) {
        actions.push(pick(
          lang,
          'Göstəricilər yaxşı səviyyədədir. İndi əsas fürsət hesabatın keyfiyyətini artırmaq və hədəfləri rəsmiləşdirməkdir.',
          'The metrics are in good shape. The main opportunity now is to improve reporting quality and formalise targets.',
          'Показатели в хорошем состоянии. Основная возможность — повысить качество отчётности и формализовать цели.'
        ));
      }

      return pick(
        lang,
        `**Prioritet tövsiyələr:**\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n${summaryLine(lang, m)}`,
        `**Priority recommendations:**\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n${summaryLine(lang, m)}`,
        `**Приоритетные рекомендации:**\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n${summaryLine(lang, m)}`
      );
    }
  },
  {
    id: 'forecast',
    keywords: ['proqnoz', 'forecast', 'gələcək', 'gelecek', 'trend', 'future', 'прогноз', 'будущ'],
    reply: ({ lang, reportData, metrics }) => {
      const m = snapshot(metrics);
      if (!Array.isArray(reportData) || reportData.length < 4) {
        return pick(
          lang,
          `Hazırda proqnoz üçün kifayət qədər tarixi data yoxdur. Cari göstəricilər: ${summaryLine(lang, m)}. Ən azı 3–4 ayın məlumatı toplandıqdan sonra trend proqnozu vermək olar.`,
          `There is not enough historical data for a forecast yet. Current readings: ${summaryLine(lang, m)}. Once at least 3–4 months of data are available, a trend forecast is possible.`,
          `Пока недостаточно исторических данных для прогноза. Текущие показатели: ${summaryLine(lang, m)}. После накопления 3–4 месяцев данных можно построить тренд.`
        );
      }
      const recent = reportData.slice(-3);
      const previous = reportData.slice(-6, -3);
      const avg = (rows) => rows.reduce((s, r) => s + (Number(r.scope1) + Number(r.scope2)) / 2, 0) / rows.length;
      const recentAvg = avg(recent);
      const prevAvg = previous.length ? avg(previous) : recentAvg;
      const delta = recentAvg - prevAvg;
      const next = recentAvg + delta;
      const direction = delta > 0.5
        ? pick(lang, 'artım', 'an increase', 'рост')
        : delta < -0.5
          ? pick(lang, 'azalma', 'a decrease', 'снижение')
          : pick(lang, 'sabitlik', 'a stable trend', 'стабильность');
      return pick(
        lang,
        `**Qısamüddətli proqnoz:** son 3 ayın orta emissiyası ${recentAvg.toFixed(1)} t, əvvəlki 3 ay ${prevAvg.toFixed(1)} t olub. Trend ${direction} göstərir. Sadə xətti proqnoza görə növbəti ay təxminən **${Math.max(0, next).toFixed(1)} t** gözlənilir.\n\n⚠️ Bu, yalnız mövcud dataya əsaslanan sadə trend proqnozudur; mövsüm, istehsal həcmi və təchizat dəyişiklikləri nəticəni dəyişə bilər.\n\n${summaryLine(lang, m)}`,
        `**Short-term outlook:** the last 3 months averaged ${recentAvg.toFixed(1)} t, versus ${prevAvg.toFixed(1)} t in the previous 3 months. The trend shows ${direction}. A simple linear projection suggests about **${Math.max(0, next).toFixed(1)} t** next month.\n\n⚠️ This is a simple trend based on available data only; seasonality, production volume and supply changes can alter the result.\n\n${summaryLine(lang, m)}`,
        `**Краткосрочный прогноз:** среднее за последние 3 месяца — ${recentAvg.toFixed(1)} т, за предыдущие 3 месяца — ${prevAvg.toFixed(1)} т. Тренд показывает ${direction}. Простая линейная проекция даёт около **${Math.max(0, next).toFixed(1)} т** на следующий месяц.\n\n⚠️ Это простой тренд на основе имеющихся данных; сезонность, объём производства и изменения поставок могут повлиять на результат.\n\n${summaryLine(lang, m)}`
      );
    }
  },
  {
    id: 'site_help',
    keywords: ['sayt', 'dashboard', 'panel', 'tab', 'bölmə', 'bolme', 'necə istifadə', 'how to use', 'как пользоваться', 'menyu', 'menu'],
    reply: ({ lang }) => pick(
      lang,
      '**Saytdan istifadə:**\n\n• **Ümumi Panel** — əsas ESG kartları, qrafiklər və canlı sensorlar.\n• **E / S / G** — ətraf mühit, sosial və idarəetmə bölmələri.\n• **Hesabat** — 12 aylıq cədvəl, Excel/PDF ixracı.\n• **Profil** — müəssisə adı, e-poçt və şifrə.\n• **AI düyməsi** (sağ aşağıda) — istənilən sual üçün mənimlə söhbət.\n• **Dil düymələri** — AZ / EN / RU.\n• **Çıxış** — yuxarı sağda.\n\nMobil və planşetdə menyu avtomatik uyğunlaşır.',
      '**How to use the site:**\n\n• **Overview** — main ESG cards, charts and live sensors.\n• **E / S / G** — environment, social and governance sections.\n• **Report** — 12-month table with Excel/PDF export.\n• **Profile** — company name, email and password.\n• **AI button** (bottom-right) — chat with me about anything.\n• **Language buttons** — AZ / EN / RU.\n• **Log out** — top-right.\n\nThe menu adapts automatically on mobile and tablet.',
      '**Как пользоваться сайтом:**\n\n• **Обзор** — основные ESG-карточки, графики и живые датчики.\n• **E / S / G** — разделы экологии, социальной сферы и управления.\n• **Отчёт** — таблица за 12 месяцев с экспортом Excel/PDF.\n• **Профиль** — название компании, email и пароль.\n• **Кнопка AI** (внизу справа) — чат со мной по любому вопросу.\n• **Кнопки языка** — AZ / EN / RU.\n• **Выход** — справа вверху.\n\nМеню автоматически адаптируется на мобильных и планшетах.'
    )
  },
  {
    id: 'weather',
    keywords: ['hava', 'weather', 'погода', 'temperatur'],
    reply: ({ lang }) => pick(
      lang,
      'Mənim canlı hava məlumatına çıxışım yoxdur, ona görə hazırda Bakının faktiki havasını deyə bilmərəm. Ancaq iqlim baxımından qeyd edim: hava keyfiyyəti və temperatur ekstremalları ESG-nin “E” hissəsində risk kimi qiymətləndirilir. Dəqiq hava proqnozu üçün etibarlı hava tətbiqindən istifadə edin.',
      'I do not have access to live weather data, so I cannot tell you the current weather in Baku. From a climate perspective, air quality and temperature extremes are assessed as “E” risks in ESG. For an accurate forecast, please use a reliable weather app.',
      'У меня нет доступа к живым погодным данным, поэтому я не могу назвать текущую погоду в Баку. С точки зрения климата качество воздуха и температурные экстремумы оцениваются как риски «E» в ESG. Для точного прогноза используйте надёжное погодное приложение.'
    )
  }
];

/* ------------------------------------------------------------------ */
/*  KÖMƏKÇİ FUNKSİYALAR                                               */
/* ------------------------------------------------------------------ */

function tryMath(question) {
  const raw = String(question || '').trim().replace(/,/g, '.');
  if (!/^[\d\s+\-*/().%]+$/.test(raw)) return null;
  if (!/[+\-*/%]/.test(raw)) return null;
  try {
    // Yalnız rəqəm və operatorlardan ibarət ifadə olduğu üçün təhlükəsizdir.
    const result = Function(`"use strict"; return (${raw});`)();
    if (typeof result !== 'number' || !Number.isFinite(result)) return null;
    const pretty = Number.isInteger(result) ? String(result) : result.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
    return pretty;
  } catch {
    return null;
  }
}

function findFact(text) {
  let best = null;
  let bestScore = 0;
  for (const fact of SPECIAL_FACTS) {
    const score = scoreText(text, fact.keys);
    if (score > bestScore) {
      best = fact;
      bestScore = score;
    }
  }
  return bestScore >= 3 ? best : null;
}

function findIntent(text) {
  let best = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const score = scoreText(text, intent.keywords);
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}

/* ------------------------------------------------------------------ */
/*  AÇIQ API                                                           */
/* ------------------------------------------------------------------ */

export function buildWelcomeMessage({ lang = 'az', profileName, metrics } = {}) {
  const m = snapshot(metrics);
  const name = profileName || 'BlueGreen';
  return pick(
    lang,
    `Salam, **${name}**! 👋 Mən **BlueGreen AI**-yəm. ESG, davamlılıq, karbon, enerji, su, tullantı, sosial və idarəetmə mövzularında — həmçinin saytın istifadəsi ilə bağlı — istənilən sualınıza cavab verə bilərəm.\n\n${summaryLine(lang, m)}\n\nNə bilmək istəyirsiniz?`,
    `Hello, **${name}**! 👋 I am **BlueGreen AI**. I can answer questions about ESG, sustainability, carbon, energy, water, waste, social and governance topics — and about using this site.\n\n${summaryLine(lang, m)}\n\nWhat would you like to know?`,
    `Здравствуйте, **${name}**! 👋 Я **BlueGreen AI**. Я отвечаю на вопросы об ESG, устойчивом развитии, углероде, энергии, воде, отходах, социальной сфере и управлении — а также о работе сайта.\n\n${summaryLine(lang, m)}\n\nЧто вы хотите узнать?`
  );
}

export function buildAiReply({ question, lang = 'az', profileName, metrics, reportData, activeTab } = {}) {
  const raw = String(question || '').trim();
  if (!raw) {
    return pick(
      lang,
      'Sualınızı yazın — ESG, göstəricilər, hesabat və ya saytın istifadəsi ilə bağlı kömək edə bilərəm.',
      'Please type your question — I can help with ESG, metrics, reporting or using the site.',
      'Напишите вопрос — я помогу с ESG, показателями, отчётностью или использованием сайта.'
    );
  }

  const resolvedLang = detectLang(raw, lang);
  const text = normalize(raw);
  const ctx = { question: raw, lang: resolvedLang, profileName, metrics, reportData, activeTab };
  const m = snapshot(metrics);

  // 1. Sadə riyazi ifadələr
  const math = tryMath(raw);
  if (math !== null) {
    return pick(
      resolvedLang,
      `**${raw} = ${math}**\n\nBaşqa hesablama lazımdırsa, yazın.`,
      `**${raw} = ${math}**\n\nIf you need another calculation, just type it.`,
      `**${raw} = ${math}**\n\nЕсли нужен другой расчёт, напишите.`
    );
  }

  // 2. Xüsusi bilik bazası (Paris, SDG, ISO, CSRD və s.)
  const fact = findFact(text);
  if (fact) {
    return fact[resolvedLang] || fact.az;
  }

  // 3. Geniş niyyət bazası
  const intent = findIntent(text);
  if (intent) {
    try {
      return intent.reply(ctx);
    } catch (err) {
      console.error('AI cavab xətası:', err);
    }
  }

  // 4. Fallback — sualı kontekstə bağlayır və istiqamət təklif edir.
  return pick(
    resolvedLang,
    `Sualınızı qeyd etdim: **“${raw}”**.\n\nBu mövzuda dəqiq fakt bazam məhduddur, amma ESG və davamlılıq baxımından belə yanaşa bilərəm:\n\n• Əgər bu, şirkətin fəaliyyəti ilə bağlıdırsa, cari göstəricilərə əsasən risk və fürsətləri qiymətləndirə bilərəm.\n• Əgər ümumi bilik sualıdırsa, mövzunu bir az konkretləşdirin — məsələn, “karbon neytrallığı nədir?”, “GRI nədir?”, “enerji necə azaldılır?”.\n• Hesabat, profil və ya saytın istifadəsi ilə bağlı addım-addım təlimat verə bilərəm.\n\n${summaryLine(resolvedLang, m)}\n\nMövzunu bir az da dəqiqləşdirsəniz, daha faydalı cavab verə bilərəm.`,
    `I have noted your question: **“${raw}”**.\n\nMy precise fact base on this topic is limited, but from an ESG and sustainability perspective I can help like this:\n\n• If it concerns your operations, I can assess risks and opportunities from the current metrics.\n• If it is a general knowledge question, make it a little more specific — for example, “what is net zero?”, “what is GRI?”, “how can I reduce energy?”.\n• I can give step-by-step guidance on reports, profile or using the site.\n\n${summaryLine(resolvedLang, m)}\n\nIf you narrow the topic down, I can give a more useful answer.`,
    `Я зафиксировал ваш вопрос: **«${raw}»**.\n\nПо этой теме моя точная база фактов ограничена, но с точки зрения ESG и устойчивого развития я могу помочь так:\n\n• Если речь о деятельности компании, я оценю риски и возможности по текущим показателям.\n• Если это общий вопрос, уточните тему — например, «что такое net zero?», «что такое GRI?», «как снизить энергопотребление?».\n• Я могу дать пошаговые инструкции по отчётам, профилю или использованию сайта.\n\n${summaryLine(resolvedLang, m)}\n\nЕсли уточните тему, я смогу ответить полезнее.`
  );
}

export function getSuggestedQuestions(lang = 'az') {
  if (lang === 'en') {
    return [
      'What is ESG?',
      'How can I reduce CO₂?',
      'Explain the current metrics',
      'How do I export a report?'
    ];
  }
  if (lang === 'ru') {
    return [
      'Что такое ESG?',
      'Как снизить CO₂?',
      'Объясни текущие показатели',
      'Как экспортировать отчёт?'
    ];
  }
  return [
    'ESG nədir?',
    'CO₂-i necə azaldım?',
    'Cari göstəriciləri izah et',
    'Hesabatı necə ixrac edim?'
  ];
}
