import { PainterStyle } from './types';

export const MODEL_OPTIONS = [
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3-pro-preview',
  'gpt-4o-mini',
  'gpt-4.1-mini'
];

export const PAINTER_STYLES: PainterStyle[] = [
  {
    id: 'van_gogh',
    name: 'Vincent van Gogh',
    description: 'Post-Impressionist swirls of blue and yellow.',
    colors: { primary: '#1d4e89', secondary: '#f4b41a', accent: '#e86f2c', bg: '#f0f4f8', text: '#0b1c33', card: '#ffffff' }
  },
  {
    id: 'monet',
    name: 'Claude Monet',
    description: 'Soft Impressionist pastels.',
    colors: { primary: '#72a0c1', secondary: '#99c5c4', accent: '#ffb7b2', bg: '#fdfdfd', text: '#2c3e50', card: '#f0f8ff' }
  },
  {
    id: 'picasso',
    name: 'Pablo Picasso',
    description: 'Cubist geometry and bold primary colors.',
    colors: { primary: '#e63946', secondary: '#457b9d', accent: '#f1faee', bg: '#f4f4f4', text: '#1d3557', card: '#ffffff' }
  },
  {
    id: 'da_vinci',
    name: 'Leonardo da Vinci',
    description: 'Renaissance sepia and parchment.',
    colors: { primary: '#8d6e63', secondary: '#d7ccc8', accent: '#5d4037', bg: '#efebe9', text: '#3e2723', card: '#fff8e1' }
  },
  {
    id: 'dali',
    name: 'Salvador Dalí',
    description: 'Surreal melting dreamscapes.',
    colors: { primary: '#ff6b6b', secondary: '#ffa502', accent: '#1e90ff', bg: '#fff0e6', text: '#2f3542', card: '#ffffff' }
  },
  {
    id: 'rembrandt',
    name: 'Rembrandt',
    description: 'Chiaroscuro: dramatic light and shadow.',
    colors: { primary: '#4a3b2a', secondary: '#c5a065', accent: '#e0c097', bg: '#2b2118', text: '#f5f5f5', card: '#3e3226' }
  },
  {
    id: 'warhol',
    name: 'Andy Warhol',
    description: 'Pop Art high contrast and neon.',
    colors: { primary: '#ff007f', secondary: '#00ffff', accent: '#ffff00', bg: '#1a1a1a', text: '#ffffff', card: '#333333' }
  },
  {
    id: 'pollock',
    name: 'Jackson Pollock',
    description: 'Abstract expressionist splatter chaos.',
    colors: { primary: '#000000', secondary: '#7f8c8d', accent: '#c0392b', bg: '#ecf0f1', text: '#2c3e50', card: '#ffffff' }
  },
  {
    id: 'klimt',
    name: 'Gustav Klimt',
    description: 'Golden phase art nouveau patterns.',
    colors: { primary: '#d4af37', secondary: '#8a6e2f', accent: '#000000', bg: '#fffaf0', text: '#2c2c2c', card: '#fffff0' }
  },
  {
    id: 'munch',
    name: 'Edvard Munch',
    description: 'Expressionist psychological intensity.',
    colors: { primary: '#e05220', secondary: '#2c3e50', accent: '#f39c12', bg: '#2c3e50', text: '#ecf0f1', card: '#34495e' }
  },
  {
    id: 'hokusai',
    name: 'Hokusai',
    description: 'Ukiyo-e woodblock print aesthetics.',
    colors: { primary: '#204060', secondary: '#f0f0f0', accent: '#d05050', bg: '#fdfdfd', text: '#102030', card: '#ffffff' }
  },
  {
    id: 'matisse',
    name: 'Henri Matisse',
    description: 'Fauvism with vibrant, unnatural colors.',
    colors: { primary: '#ff0000', secondary: '#00ff00', accent: '#0000ff', bg: '#ffffff', text: '#000000', card: '#f0f0f0' }
  },
  {
    id: 'okeeffe',
    name: 'Georgia O\'Keeffe',
    description: 'Modernist large-format flowers.',
    colors: { primary: '#9b59b6', secondary: '#e74c3c', accent: '#ecf0f1', bg: '#fbe4e4', text: '#2c3e50', card: '#ffffff' }
  },
  {
    id: 'kahlo',
    name: 'Frida Kahlo',
    description: 'Naive art with Mexican surrealism.',
    colors: { primary: '#27ae60', secondary: '#c0392b', accent: '#f1c40f', bg: '#f9f9f9', text: '#2c3e50', card: '#ffffff' }
  },
  {
    id: 'mondrian',
    name: 'Piet Mondrian',
    description: 'De Stijl grid of primary colors.',
    colors: { primary: '#e74c3c', secondary: '#3498db', accent: '#f1c40f', bg: '#ffffff', text: '#000000', card: '#f0f0f0' }
  },
  {
    id: 'renoir',
    name: 'Pierre-Auguste Renoir',
    description: 'Impressionist soft focus and light.',
    colors: { primary: '#e8daef', secondary: '#a569bd', accent: '#5dade2', bg: '#fdfefe', text: '#4a235a', card: '#ffffff' }
  },
  {
    id: 'cezanne',
    name: 'Paul Cézanne',
    description: 'Post-Impressionist earth tones.',
    colors: { primary: '#784212', secondary: '#1e8449', accent: '#d35400', bg: '#f5eef8', text: '#1b2631', card: '#ffffff' }
  },
  {
    id: 'hopper',
    name: 'Edward Hopper',
    description: 'Realist urban solitude.',
    colors: { primary: '#154360', secondary: '#641e16', accent: '#145a32', bg: '#eaeded', text: '#17202a', card: '#ffffff' }
  },
  {
    id: 'basquiat',
    name: 'Jean-Michel Basquiat',
    description: 'Neo-expressionist graffiti.',
    colors: { primary: '#000000', secondary: '#f1c40f', accent: '#e74c3c', bg: '#ecf0f1', text: '#000000', card: '#ffffff' }
  },
  {
    id: 'vermeer',
    name: 'Johannes Vermeer',
    description: 'Baroque pearl-like luminosity.',
    colors: { primary: '#3498db', secondary: '#f39c12', accent: '#ecf0f1', bg: '#f4f6f7', text: '#212f3d', card: '#ffffff' }
  }
];

export const SAMPLE_CSV = `Suppliername,deliverdate,customer,licenseID,DeviceCategory,UDI,DeviceName,LotNumber,SN,ModelNum,Numbers,Unit
B00079,45968,C05278,衛部醫器輸字第033951號,E.3610植入式心律器之脈搏產生器,00802526576331,“波士頓科技”英吉尼心臟節律器,890057,,L111,1,組
B00079,45967,C06030,衛部醫器輸字第033951號,E.3610植入式心律器之脈搏產生器,00802526576331,“波士頓科技”英吉尼心臟節律器,872177,,L111,1,組
B00079,45967,C00123,衛部醫器輸字第033951號,E.3610植入式心律器之脈搏產生器,00802526576331,“波士頓科技”英吉尼心臟節律器,889490,,L111,1,組
B00079,45966,C06034,衛部醫器輸字第033951號,E.3610植入式心律器之脈搏產生器,00802526576331,“波士頓科技”英吉尼心臟節律器,889253,,L111,1,組
B00079,45964,C05363,衛部醫器輸字第029100號,E.3610植入式心律器之脈搏產生器,00802526576461,“波士頓科技”艾科雷心臟節律器,869531,,L311,1,組
B00079,45964,C06034,衛部醫器輸字第033951號,E.3610植入式心律器之脈搏產生器,00802526576331,“波士頓科技”英吉尼心臟節律器,889230,,L111,1,組
B00079,45964,C05278,衛部醫器輸字第029100號,E.3610植入式心律器之脈搏產生器,00802526576485,“波士頓科技”艾科雷心臟節律器,182310,,L331,1,組
B00079,45960,C00123,衛部醫器輸字第033951號,E.3610植入式心律器之脈搏產生器,00802526576324,“波士頓科技”英吉尼心臟節律器,915900,,L110,1,組
B00079,45947,C06034,衛部醫器輸字第030901號,E.3610植入式心律器之脈搏產生器,00802526594069,“波士頓科技”恩璽植入式心律去顫器,710753,,D433,1,組
B00079,45946,C06028,衛部醫器輸字第029675號,E.3610植入式心律器之脈搏產生器,00802526576447,“波士頓科技”艾科雷心臟節律器,809748,,L301,1,組
B00079,45943,C06034,衛部醫器輸字第033951號,E.3610植入式心律器之脈搏產生器,00802526576331,“波士頓科技”英吉尼心臟節律器,888053,,L111,1,組
B00079,45939,C00123,衛部醫器輸字第033951號,E.3610植入式心律器之脈搏產生器,00802526576324,“波士頓科技”英吉尼心臟節律器,926298,,L110,1,組
B00079,45933,C06034,衛部醫器輸字第029100號,E.3610植入式心律器之脈搏產生器,00802526576461,“波士頓科技”艾科雷心臟節律器,868683,,L311,1,組
B00079,45932,C05278,衛部醫器輸字第030901號,E.3610植入式心律器之脈搏產生器,00802526593925,“波士頓科技”恩璽植入式心律去顫器,239736,,D412,1,組
B00079,45930,C06052,衛部醫器輸字第029100號,E.3610植入式心律器之脈搏產生器,00802526576485,“波士頓科技”艾科雷心臟節律器,,138953,L331,1,組
B00018,45930,C00993,衛部醫器輸字第034223號,E.3610植入式心律器之脈搏產生器,05415067031990,“雅培”給力植入式心律去顫器,,810134078,CDVRA500Q,1,個
B00018,45930,C03618,衛部醫器輸字第026580號,E.3610植入式心律器之脈搏產生器,05414734509596,“雅培”恩德拉第心臟節律器,,5161842,PM1172,1,個
B00047,45930,C00547,衛部醫器輸字第030166號,E.3610植入式心律器之脈搏產生器,00763000612207,“美敦力”維希亞磁振造影植入式心臟整流去顫器,,PLX622672S,DVFB2D4,1,組
B00047,45930,C00543,衛部醫器輸字第030761號,E.3610植入式心律器之脈搏產生器,00763000955809,“美敦力” 博視達磁振造影植入式心臟再同步節律器,,RNU615713S,W1TR04,1,組
B00159,45930,C02000,衛部醫器輸字第026582號,E.3610植入式心律器之脈搏產生器,05414734509589,“雅培”安速拉第心臟節律器,,5136600,PM2272,1,個
B00047,45930,C00515,衛部醫器輸字第032275號,E.3610植入式心律器之脈搏產生器,00763000630089,“美敦力”艾視達磁振造影植入式心臟節律器,,FNB275172G,ATDR01,1,組
B00018,45930,C01746,衛部醫器輸字第026582號,E.3610植入式心律器之脈搏產生器,05414734509589,“雅培”安速拉第心臟節律器,,5136600,PM2272,1,個
B00018,45930,C00980,衛部醫器輸字第026580號,E.3610植入式心律器之脈搏產生器,05414734509794,“雅培”恩德拉第心臟節律器,,5198697,PM2140,1,個
B00047,45930,C05816,衛部醫器輸字第030635號,E.3610植入式心律器之脈搏產生器,00763000727475,“美敦力”亞士卓磁振造影植入式心臟節律器,,RNH720882S,X2DR01,1,組
B00047,45930,C00515,衛部醫器輸字第032275號,E.3610植入式心律器之脈搏產生器,00763000630089,“美敦力”艾視達磁振造影植入式心臟節律器,,FNB275113G,ATDR01,1,組
B00018,45930,C00975,衛部醫器輸字第026582號,E.3610植入式心律器之脈搏產生器,05414734509572,“雅培”安速拉第心臟節律器,,5944385,PM1272,1,個
B00047,45930,C05816,衛部醫器輸字第032275號,E.3610植入式心律器之脈搏產生器,00763000630089,“美敦力”艾視達磁振造影植入式心臟節律器,,FNB276003G,ATDR01,1,組
B00047,45930,C00543,衛部醫器輸字第028253號,E.3610植入式心律器之脈搏產生器,00763000612009,“美敦力”艾維拉磁振造影植入式心臟整流去顫器,,PGZ666466S,DDMB2D4,1,組
B00018,45930,C00975,衛部醫器輸字第026580號,E.3610植入式心律器之脈搏產生器,05414734509794,“雅培”恩德拉第心臟節律器,,5198695,PM2140,1,個
B00047,45930,C05816,衛部醫器輸字第030635號,E.3610植入式心律器之脈搏產生器,00763000955861,“美敦力”亞士卓磁振造影植入式心臟節律器,,RNH731438S,X2DR01,1,組
B00047,45930,C05816,衛部醫器輸字第028253號,E.3610植入式心律器之脈搏產生器,00763000612009,“美敦力”艾維拉磁振造影植入式心臟整流去顫器,,PGZ665415S,DDMB2D4,1,組
B00047,45930,C00547,衛署醫器輸字第023295號,E.3610植入式心律器之脈搏產生器,00613994741684,“美敦力”黛拉心臟節律器,,NWE075071G,ADDRL1,1,組
B00047,45930,C05816,衛部醫器輸字第028253號,E.3610植入式心律器之脈搏產生器,00763000612047,“美敦力”艾維拉磁振造影植入式心臟整流去顫器,,PLZ618834S,DVMB2D4,1,組`;

export const DEFAULT_AGENTS_YAML = `agents:
  nlp_analyzer:
    description: "泛用型自然語言分析代理，負責從對話或文字指令中抽取需求、欄位與分析目標，並將其轉換為結構化任務。"
    llm_provider: "openai"
    model: "gpt-4o-mini"
    capabilities:
      - "理解使用者以中英混合輸入的問題與背景"
      - "識別與醫療器材配銷、UDI、批號、客戶分群相關的關鍵詞"
      - "將自然語言需求轉譯為具體統計與視覺化任務描述"
    system_prompt: |-
      你是一位精通醫療器材供應鏈與配銷分析的自然語言理解專家。
      使用者的輸入可能包含中英文混雜、專有名詞、醫療器材型號與批號。
      你的任務：
      1. 準確理解使用者的問題與分析目標（例如：想看哪些欄位的分佈、想比較哪些客戶或型號）。
      2. 將需求整理為「結構化分析計畫」，例如：
         - 目標維度（客戶、型號、日期、供應商、UDI、LicenseID）
         - 需要的圖表類型（長條圖、折線圖、散佈圖、分佈圖、網路關聯圖等）
         - 是否需要時間序列、客戶分群或異常偵測。
      3. 最終輸出請使用繁體中文，並以條列與 Markdown 表格方式清楚呈現分析計畫。
      4. 不要假造實際數值，只描述「應該如何分析」與「應該產出的圖表與指標」。
      
  kpi_dashboard_designer:
    description: "KPI 儀表板設計代理，整合多種分佈與視覺化成一頁式總覽。"
    llm_provider: "gemini"
    model: "gemini-2.5-flash"
    capabilities:
      - "為配銷與合規同時設計指標集"
      - "定義儀表板版面配置與圖表組合"
      - "用故事線說明從 KPI 閱讀到決策的流程"
    system_prompt: |-
      你是一位醫療器材供應鏈 KPI 儀表板設計師。
      請：
      1. 定義適合放在首頁的 8–12 個核心指標（量、客戶、批號、License、風險等）。
      2. 建議圖表布局與互動（例如：點選客戶後其他圖跟著篩選）。
      3. 以繁體中文輸出，方便前端工程師與 PM 直接參考。
`;

export const TRANSLATIONS = {
  en: {
    title: "GUDID Chronicles",
    subtitle: "WOW Supply Chain Analytics",
    upload: "Upload CSV",
    useSample: "Use Sample Data",
    analytics: "Analytics",
    chat: "Agent Chat",
    hq: "Agent HQ",
    docs: "Documentation",
    notes: "AI Note Keeper",
    jackpot: "Spin for Style",
    totalLines: "Total Lines",
    totalUnits: "Total Units",
    uniqueSuppliers: "Suppliers",
    uniqueCustomers: "Customers",
    style: "Current Style",
    sendMessage: "Send Message",
    analyzing: "Analyzing...",
    graph: "Supply Chain Graph",
    timeSeries: "Deliveries Over Time",
    topDevices: "Top Devices",
    dataPreview: "Dataset Preview",
    applyFilters: "Apply Filters",
    supplier: "Supplier",
    device: "Device",
    dateRange: "Date Range",
    saveYaml: "Save Agents YAML",
    downloadYaml: "Download YAML",
    uploadYaml: "Upload YAML",
    modelSelection: "Model Selection",
    noteInputPlaceholder: "Paste your text here or upload a file...",
    organizeNote: "Organize Note (AI)",
    editNote: "Edit Note",
    previewNote: "Preview Note",
    magicKeywords: "AI Keywords",
    magicSummarize: "Summarize",
    magicActionItems: "Action Items",
    magicTranslate: "Translate (ZH/EN)",
    magicPolisher: "Polish Text",
    magicSimplify: "Simplify",
    comprehensiveReport: "Generate Comprehensive Report",
    reportPrompt: "Report Prompt",
    generate: "Generate",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    resetZoom: "Reset",
    uploadNoteFile: "Upload Text/MD/PDF",
  },
  zh: {
    title: "GUDID 紀事",
    subtitle: "WOW 供應鏈分析",
    upload: "上傳 CSV",
    useSample: "使用範例數據",
    analytics: "分析儀表板",
    chat: "代理人聊天",
    hq: "代理人總部",
    docs: "文檔",
    notes: "AI 筆記助手",
    jackpot: "幸運風格",
    totalLines: "總行數",
    totalUnits: "總單位數",
    uniqueSuppliers: "供應商",
    uniqueCustomers: "客戶",
    style: "當前風格",
    sendMessage: "發送訊息",
    analyzing: "分析中...",
    graph: "供應鏈關係圖",
    timeSeries: "交付時間趨勢",
    topDevices: "熱門設備",
    dataPreview: "數據預覽",
    applyFilters: "套用篩選",
    supplier: "供應商",
    device: "設備",
    dateRange: "日期範圍",
    saveYaml: "儲存代理人 YAML",
    downloadYaml: "下載 YAML",
    uploadYaml: "上傳 YAML",
    modelSelection: "模型選擇",
    noteInputPlaceholder: "在此貼上文字或上傳檔案...",
    organizeNote: "AI 整理筆記",
    editNote: "編輯筆記",
    previewNote: "預覽筆記",
    magicKeywords: "AI 關鍵字",
    magicSummarize: "摘要",
    magicActionItems: "行動清單",
    magicTranslate: "翻譯 (中/英)",
    magicPolisher: "潤飾文字",
    magicSimplify: "簡化內容",
    comprehensiveReport: "產生綜合報告",
    reportPrompt: "報告提示詞",
    generate: "產生",
    zoomIn: "放大",
    zoomOut: "縮小",
    resetZoom: "重置",
    uploadNoteFile: "上傳 Text/MD/PDF",
  }
};
