import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend 
} from 'recharts';
import * as d3 from 'd3';
import yaml from 'js-yaml';
import { marked } from 'marked';

import { PAINTER_STYLES, SAMPLE_CSV, TRANSLATIONS, DEFAULT_AGENTS_YAML, MODEL_OPTIONS } from './constants';
import { parseCSV, aggregateData, filterData } from './services/dataService';
import { generateResponse } from './services/geminiService';
import { PackingListItem, PainterStyle, Language, AppTab, ChatMessage, UsageLog, AgentDef, DataFilters, NoteState, GraphNode } from './types';

// Icons
const IconMenu = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const IconUpload = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const IconSparkles = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const IconTable = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const IconZoomIn = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>;
const IconZoomOut = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>;
const IconRefresh = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;

export default function App() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<AppTab>('analytics');
  const [data, setData] = useState<PackingListItem[]>([]);
  
  // Filtering
  const [filters, setFilters] = useState<DataFilters>({ supplier: '', device: '', startDate: '', endDate: '' });
  const [showPreview, setShowPreview] = useState(false);

  // Styling & Config
  const [theme, setTheme] = useState<PainterStyle>(PAINTER_STYLES[0]);
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [isJackpotSpinning, setIsJackpotSpinning] = useState(false);
  const [logs, setLogs] = useState<UsageLog[]>([]);

  // Agents
  const [agentsYaml, setAgentsYaml] = useState(DEFAULT_AGENTS_YAML);
  const [parsedAgents, setParsedAgents] = useState<AgentDef[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Note Keeper
  const [noteState, setNoteState] = useState<NoteState>({
    originalContent: '',
    content: '',
    mode: 'edit',
    customKeywords: []
  });
  const [noteChatInput, setNoteChatInput] = useState('');
  const [noteChatHistory, setNoteChatHistory] = useState<ChatMessage[]>([]);
  const [isNoteProcessing, setIsNoteProcessing] = useState(false);

  // Summary
  const [summaryPrompt, setSummaryPrompt] = useState("Please provide a comprehensive summary of the supply chain analysis based on the filtered data, focusing on top suppliers, device trends, and potential risks.");
  const [summaryResult, setSummaryResult] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // --- Derived State ---
  const t = TRANSLATIONS[lang];
  
  // Filter Data
  const filteredData = useMemo(() => filterData(data, filters), [data, filters]);
  const analytics = useMemo(() => aggregateData(filteredData), [filteredData]);
  
  const currentAgent = parsedAgents.find(a => a.id === selectedAgentId) || parsedAgents[0];

  // Unique options for filters
  const uniqueSuppliers = useMemo(() => Array.from(new Set(data.map(d => d.Suppliername))).sort(), [data]);
  const uniqueDevices = useMemo(() => Array.from(new Set(data.map(d => d.DeviceName))).sort(), [data]);

  // --- Effects ---
  useEffect(() => {
    try {
      const doc = yaml.load(agentsYaml) as any;
      if (doc && doc.agents) {
        const agentsList: AgentDef[] = Object.entries(doc.agents).map(([key, val]: [string, any]) => ({
          id: key,
          name: key.replace(/_/g, ' ').toUpperCase(),
          description: val.description,
          llm_provider: val.llm_provider,
          model: val.model,
          capabilities: val.capabilities || [],
          system_prompt: val.system_prompt
        }));
        setParsedAgents(agentsList);
        if (agentsList.length > 0 && !selectedAgentId) {
            setSelectedAgentId(agentsList[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to parse agents YAML", e);
    }
  }, [agentsYaml]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--painter-primary', theme.colors.primary);
    root.style.setProperty('--painter-secondary', theme.colors.secondary);
    root.style.setProperty('--painter-accent', theme.colors.accent);
    root.style.setProperty('--painter-bg', isDark ? '#1a1a1a' : theme.colors.bg);
    root.style.setProperty('--painter-text', isDark ? '#f0f0f0' : theme.colors.text);
    root.style.setProperty('--painter-card', isDark ? '#2d2d2d' : theme.colors.card);
    
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme, isDark]);

  useEffect(() => {
    handleLoadSample();
  }, []);

  // --- Handlers ---

  const logEvent = (event: string, details: string) => {
    setLogs(prev => [{ timestamp: Date.now(), event, details }, ...prev]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        const parsed = parseCSV(text);
        setData(parsed);
        logEvent('Data Upload', `Uploaded ${file.name}, ${parsed.length} rows`);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = () => {
    const parsed = parseCSV(SAMPLE_CSV);
    setData(parsed);
    logEvent('Data Load', 'Loaded Sample Data');
  };

  const handleSpinJackpot = () => {
    setIsJackpotSpinning(true);
    let spins = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * PAINTER_STYLES.length);
      setTheme(PAINTER_STYLES[randomIdx]);
      spins++;
      if (spins > 10) {
        clearInterval(interval);
        setIsJackpotSpinning(false);
        logEvent('Theme Change', `Spun to ${PAINTER_STYLES[randomIdx].name}`);
      }
    }, 100);
  };

  const handleAgentYamlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
              const text = evt.target?.result as string;
              setAgentsYaml(text);
              logEvent('Agent Config', 'Uploaded new agents.yaml');
          };
          reader.readAsText(file);
      }
  };

  const handleDownloadYaml = () => {
      const blob = new Blob([agentsYaml], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'agents.yaml';
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !currentAgent) return;

    const userMsg: ChatMessage = { role: 'user', text: chatInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    const dataContext = `
      Current Data Snapshot (Filtered):
      Total Lines: ${analytics.totalLines}
      Total Units: ${analytics.totalUnits}
      Unique Suppliers: ${analytics.uniqueSuppliers}
      Top Device: ${analytics.topDevices[0]?.name || 'N/A'}
      Time Range: ${filters.startDate || 'Start'} to ${filters.endDate || 'End'}
      Filter Applied: Supplier=${filters.supplier || 'All'}, Device=${filters.device || 'All'}
    `;

    const fullPrompt = `
      ${currentAgent.system_prompt}
      
      DATA CONTEXT:
      ${dataContext}
      
      USER QUERY:
      ${userMsg.text}
    `;

    const responseText = await generateResponse(
      fullPrompt, 
      selectedModel,
      undefined, 
      0.7
    );

    const botMsg: ChatMessage = { 
      role: 'model', 
      text: responseText, 
      timestamp: Date.now(),
      agentId: currentAgent.id,
      modelUsed: selectedModel
    };

    setChatMessages(prev => [...prev, botMsg]);
    setIsChatLoading(false);
    logEvent('Agent Chat', `Used ${currentAgent.name} with ${selectedModel}`);
  };

  // --- Note Keeper Handlers ---

  const handleNoteFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
         setNoteState(prev => ({ 
           ...prev, 
           content: `[PDF Uploaded: ${file.name}]\n\n(Note: Full PDF text extraction is limited in this browser-only demo. Please upload Text/Markdown or copy-paste content for best results.)`,
           originalContent: `[PDF Uploaded: ${file.name}]` 
         }));
         logEvent('Note Upload', 'PDF file uploaded');
      } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const text = evt.target?.result as string;
          setNoteState(prev => ({ ...prev, content: text, originalContent: text }));
          logEvent('Note Upload', `Text file uploaded ${file.name}`);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleOrganizeNote = async () => {
      setIsNoteProcessing(true);
      const prompt = `
        You are an AI Note Organizer. 
        Task: Reorganize the following raw text into structured Markdown.
        Requirements:
        1. Use Headers (#, ##) for sections.
        2. Use bullet points for lists.
        3. Highlight key entities (names, devices, dates, actions) using **bold** syntax.
        4. Keep the tone professional and concise.
        5. DO NOT remove important information, just structure it.

        Raw Text:
        ${noteState.content}
      `;
      const response = await generateResponse(prompt, selectedModel);
      setNoteState(prev => ({ ...prev, content: response, mode: 'preview' }));
      setIsNoteProcessing(false);
      logEvent('Note Magic', 'Organized Note');
  };

  const handleMagic = async (type: string) => {
      if (type === 'keywords') {
        const keyword = prompt("Enter keyword to highlight (Coral Color):");
        const color = prompt("Enter color (hex or name) or leave empty for Coral:", "#ff7f50");
        if (keyword) {
           const finalColor = color || "#ff7f50";
           // Use HTML span for custom coloring in Markdown preview
           const regex = new RegExp(`(${keyword})`, 'gi');
           const newContent = noteState.content.replace(regex, `<span style="color: ${finalColor}; font-weight: bold;">$1</span>`); 
           setNoteState(prev => ({ ...prev, content: newContent, mode: 'preview' }));
           return; 
        }
        return;
      }

      setIsNoteProcessing(true);
      let promptText = '';
      switch(type) {
          case 'summarize': promptText = "Summarize the following note in 3 bullet points:"; break;
          case 'action_items': promptText = "Extract actionable tasks from the following note as a checklist:"; break;
          case 'translate': promptText = "Translate the following note to " + (lang === 'en' ? 'Traditional Chinese' : 'English') + ":"; break;
          case 'polish': promptText = "Polish the grammar and tone of the following note to be professional:"; break;
          case 'simplify': promptText = "Simplify the following note for a general audience:"; break;
      }

      if (promptText) {
          const fullPrompt = `${promptText}\n\n${noteState.content}`;
          const response = await generateResponse(fullPrompt, selectedModel);
          setNoteState(prev => ({ ...prev, content: response, mode: 'preview' }));
      }
      setIsNoteProcessing(false);
  };

  const handleNoteChat = async () => {
      if (!noteChatInput.trim()) return;
      const userMsg: ChatMessage = { role: 'user', text: noteChatInput, timestamp: Date.now() };
      setNoteChatHistory(prev => [...prev, userMsg]);
      setNoteChatInput('');
      setIsNoteProcessing(true);

      const prompt = `
        Context: You are an assistant helping with the following note content.
        Note Content:
        ${noteState.content}

        User Question: ${noteChatInput}
      `;
      const response = await generateResponse(prompt, selectedModel);
      setNoteChatHistory(prev => [...prev, { role: 'model', text: response, timestamp: Date.now(), modelUsed: selectedModel }]);
      setIsNoteProcessing(false);
  };

  // --- Summary Handler ---
  const handleGenerateSummary = async () => {
     setIsSummaryLoading(true);
     const dataContext = `
      Total Lines: ${analytics.totalLines}
      Total Units: ${analytics.totalUnits}
      Unique Suppliers: ${analytics.uniqueSuppliers}
      Top 5 Devices: ${analytics.topDevices.slice(0,5).map(d => `${d.name} (${d.value})`).join(', ')}
      Top 5 Customers: ${analytics.customerVolume.slice(0,5).map(c => `${c.name} (${c.value})`).join(', ')}
      Date Range: ${filters.startDate || 'Start'} to ${filters.endDate || 'End'}
     `;
     const fullPrompt = `${summaryPrompt}\n\nData Context:\n${dataContext}`;
     const response = await generateResponse(fullPrompt, selectedModel);
     setSummaryResult(response);
     setIsSummaryLoading(false);
     logEvent('Analytics', 'Generated Comprehensive Report');
  };

  // --- Render Helpers ---

  const renderForceGraph = useCallback(() => {
    if (filteredData.length === 0) return null;
    const graphData = filteredData.slice(0, 150); // Increased limit slightly
    
    const nodes: any[] = [];
    const links: any[] = [];
    const nodeSet = new Set<string>();

    graphData.forEach(d => {
      const sup = `SUP:${d.Suppliername}`;
      const dev = `DEV:${d.DeviceName}`;
      const cust = `CUST:${d.customer}`;

      if (!nodeSet.has(sup)) { nodes.push({ id: sup, group: 'supplier', label: d.Suppliername, totalUnits: 0 }); nodeSet.add(sup); }
      if (!nodeSet.has(dev)) { nodes.push({ id: dev, group: 'device', label: d.DeviceName, totalUnits: 0 }); nodeSet.add(dev); }
      if (!nodeSet.has(cust)) { nodes.push({ id: cust, group: 'customer', label: d.customer, totalUnits: 0 }); nodeSet.add(cust); }

      links.push({ source: sup, target: dev, value: 1 });
      links.push({ source: dev, target: cust, value: d.Numbers });
      
      // Aggregate units for graph tooltip info
      const supNode = nodes.find(n => n.id === sup); if(supNode) supNode.totalUnits += d.Numbers;
      const devNode = nodes.find(n => n.id === dev); if(devNode) devNode.totalUnits += d.Numbers;
      const custNode = nodes.find(n => n.id === cust); if(custNode) custNode.totalUnits += d.Numbers;
    });

    return <GraphComponent nodes={nodes} links={links} theme={theme} />;
  }, [filteredData, theme]);

  return (
    <div className={`flex h-screen bg-painter-bg text-painter-text font-sans transition-colors duration-500 overflow-hidden`}>
      
      {/* Sidebar */}
      <aside className="w-64 bg-painter-card shadow-xl flex flex-col z-20 border-r border-painter-primary/20">
        <div className="p-6 border-b border-painter-primary/10">
          <h1 className="text-xl font-bold text-painter-primary">{t.title}</h1>
          <p className="text-xs text-painter-secondary mt-1 opacity-80">{t.subtitle}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {(['analytics', 'chat', 'notes', 'hq', 'docs'] as AppTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-painter-primary text-white shadow-md translate-x-1' 
                  : 'hover:bg-painter-secondary/10 text-painter-text/80'
              }`}
            >
              <span className="capitalize">{t[tab]}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-painter-primary/10 space-y-4 bg-painter-bg/50">
          {/* Style Jackpot */}
          <div className="bg-painter-card rounded-xl p-3 shadow-inner border border-painter-secondary/20 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-painter-primary to-painter-accent opacity-50"></div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-painter-secondary mb-2">{t.jackpot}</h3>
            <div className="text-sm font-medium mb-3 truncate">{theme.name}</div>
            <button 
              onClick={handleSpinJackpot}
              disabled={isJackpotSpinning}
              className="w-full bg-painter-accent hover:bg-painter-primary text-white font-bold py-2 px-4 rounded-full transition-all transform active:scale-95 flex justify-center items-center gap-2"
            >
              <IconSparkles />
              {isJackpotSpinning ? '...' : 'SPIN'}
            </button>
          </div>

          <div className="flex gap-2 justify-between">
             <button onClick={() => setIsDark(!isDark)} className="p-2 rounded bg-painter-card border border-painter-primary/20 hover:bg-painter-primary/10">
               {isDark ? '🌙' : '☀️'}
             </button>
             <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} className="p-2 rounded bg-painter-card border border-painter-primary/20 hover:bg-painter-primary/10 font-bold text-xs">
               {lang === 'en' ? 'EN' : '中文'}
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-8">
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none z-0"
          style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.bg})` }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          
          {/* Header & Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
             <div>
                <h2 className="text-3xl font-bold text-painter-primary drop-shadow-sm">{t[activeTab]}</h2>
                <div className="text-sm text-painter-secondary mt-1">
                    {filteredData.length} / {data.length} records • {theme.name} Style
                </div>
             </div>
             
             {activeTab === 'analytics' && (
                <div className="flex flex-wrap gap-2 bg-painter-card p-3 rounded-xl shadow-lg border border-painter-primary/10 items-center">
                    <select 
                        className="bg-painter-bg border border-painter-secondary/30 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-painter-accent max-w-[150px]"
                        value={filters.supplier}
                        onChange={e => setFilters({...filters, supplier: e.target.value})}
                    >
                        <option value="">All Suppliers</option>
                        {uniqueSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    
                    <select 
                        className="bg-painter-bg border border-painter-secondary/30 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-painter-accent max-w-[150px]"
                        value={filters.device}
                        onChange={e => setFilters({...filters, device: e.target.value})}
                    >
                        <option value="">All Devices</option>
                        {uniqueDevices.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <input 
                        type="date" 
                        className="bg-painter-bg border border-painter-secondary/30 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-painter-accent"
                        value={filters.startDate}
                        onChange={e => setFilters({...filters, startDate: e.target.value})}
                    />
                     <span className="self-center text-painter-secondary">-</span>
                    <input 
                        type="date" 
                        className="bg-painter-bg border border-painter-secondary/30 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-painter-accent"
                        value={filters.endDate}
                        onChange={e => setFilters({...filters, endDate: e.target.value})}
                    />

                    <button 
                        onClick={() => setShowPreview(!showPreview)}
                        className={`p-2 rounded-lg transition-colors border ${showPreview ? 'bg-painter-accent text-white' : 'bg-painter-bg hover:bg-painter-primary/10'}`}
                        title={t.dataPreview}
                    >
                        <IconTable />
                    </button>
                </div>
             )}
          </div>

          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Summary Generator */}
              <div className="bg-painter-card p-6 rounded-2xl shadow-lg border border-painter-primary/5">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-painter-primary">{t.comprehensiveReport}</h3>
                     <select 
                        className="bg-painter-bg border border-painter-secondary/30 rounded-lg px-3 py-1 text-sm"
                        value={selectedModel}
                        onChange={e => setSelectedModel(e.target.value)}
                    >
                        {MODEL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                      <textarea 
                         className="w-full bg-painter-bg border border-painter-secondary/20 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-painter-accent"
                         rows={2}
                         value={summaryPrompt}
                         onChange={(e) => setSummaryPrompt(e.target.value)}
                      />
                      <button 
                        onClick={handleGenerateSummary}
                        disabled={isSummaryLoading}
                        className="bg-painter-accent text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-painter-primary transition-colors disabled:opacity-50"
                      >
                          {isSummaryLoading ? t.analyzing : t.generate}
                      </button>
                  </div>
                  {summaryResult && (
                      <div className="mt-6 p-4 bg-painter-bg/50 rounded-lg border border-painter-secondary/10 markdown-body text-sm max-h-96 overflow-y-auto"
                           dangerouslySetInnerHTML={{ __html: marked(summaryResult) }}
                      />
                  )}
              </div>

              {/* Data Preview Table */}
              {showPreview && (
                  <div className="bg-painter-card rounded-2xl shadow-lg border border-painter-primary/5 overflow-hidden animate-slide-down">
                      <div className="p-4 border-b border-painter-primary/10 flex justify-between items-center bg-painter-bg/30">
                          <h3 className="font-bold text-painter-primary">{t.dataPreview}</h3>
                          <span className="text-xs opacity-60">Showing first 50 filtered rows</span>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                              <thead className="text-xs uppercase bg-painter-secondary/10 text-painter-secondary">
                                  <tr>
                                      {['Suppliername', 'deliverdate', 'customer', 'DeviceName', 'Numbers', 'ModelNum'].map(h => (
                                          <th key={h} className="px-6 py-3">{h}</th>
                                      ))}
                                  </tr>
                              </thead>
                              <tbody>
                                  {filteredData.slice(0, 50).map((row, i) => (
                                      <tr key={i} className="border-b border-painter-secondary/5 hover:bg-painter-primary/5">
                                          <td className="px-6 py-2 font-medium">{row.Suppliername}</td>
                                          <td className="px-6 py-2">{row.deliverdate}</td>
                                          <td className="px-6 py-2">{row.customer}</td>
                                          <td className="px-6 py-2">{row.DeviceName}</td>
                                          <td className="px-6 py-2">{row.Numbers}</td>
                                          <td className="px-6 py-2">{row.ModelNum}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: t.totalLines, val: analytics.totalLines },
                  { label: t.totalUnits, val: analytics.totalUnits.toLocaleString() },
                  { label: t.uniqueSuppliers, val: analytics.uniqueSuppliers },
                  { label: t.uniqueCustomers, val: analytics.uniqueCustomers }
                ].map((stat, i) => (
                  <div key={i} className="bg-painter-card p-6 rounded-2xl shadow-lg border-l-4 border-painter-accent transform hover:-translate-y-1 transition-transform">
                    <p className="text-painter-secondary text-sm font-semibold uppercase">{stat.label}</p>
                    <p className="text-3xl font-bold text-painter-text mt-2">{stat.val}</p>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-painter-card p-6 rounded-2xl shadow-lg border border-painter-primary/5">
                  <h3 className="text-lg font-bold mb-4 text-painter-primary">{t.timeSeries}</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.timeSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.secondary} opacity={0.2} />
                        <XAxis dataKey="date" stroke={theme.colors.text} tick={{fontSize: 12}} />
                        <YAxis stroke={theme.colors.text} tick={{fontSize: 12}} />
                        <RechartsTooltip contentStyle={{backgroundColor: theme.colors.card, borderColor: theme.colors.primary}} />
                        <Line type="monotone" dataKey="value" stroke={theme.colors.primary} strokeWidth={3} dot={{fill: theme.colors.accent}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-painter-card p-6 rounded-2xl shadow-lg border border-painter-primary/5">
                  <h3 className="text-lg font-bold mb-4 text-painter-primary">{t.topDevices}</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.topDevices} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.colors.secondary} opacity={0.2} />
                        <XAxis type="number" stroke={theme.colors.text} />
                        <YAxis dataKey="name" type="category" width={150} stroke={theme.colors.text} tick={{fontSize: 10}} />
                        <RechartsTooltip contentStyle={{backgroundColor: theme.colors.card}} />
                        <Bar dataKey="value" fill={theme.colors.accent} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Graph */}
              <div className="bg-painter-card p-6 rounded-2xl shadow-lg border border-painter-primary/5">
                <h3 className="text-lg font-bold mb-4 text-painter-primary">{t.graph}</h3>
                <div className="h-[500px] w-full bg-painter-bg/30 rounded-lg overflow-hidden relative">
                   {renderForceGraph()}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'notes' && (
              <div className="h-[calc(100vh-160px)] grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Note Editor Area */}
                  <div className="lg:col-span-2 bg-painter-card rounded-2xl shadow-lg flex flex-col border border-painter-primary/10 overflow-hidden">
                      {/* Toolbar */}
                      <div className="p-4 border-b border-painter-primary/10 flex flex-wrap gap-2 items-center bg-painter-bg/30">
                          <label className="bg-painter-secondary/10 hover:bg-painter-secondary/20 px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1">
                             <IconUpload /> {t.uploadNoteFile}
                             <input type="file" className="hidden" accept=".txt,.md,.pdf" onChange={handleNoteFileUpload} />
                          </label>
                          <button onClick={handleOrganizeNote} disabled={isNoteProcessing} className="bg-painter-accent text-white px-3 py-1.5 rounded-lg text-xs hover:bg-painter-primary transition-colors flex items-center gap-1">
                              <IconSparkles /> {t.organizeNote}
                          </button>
                          <div className="h-6 w-px bg-painter-secondary/20 mx-1"></div>
                          {['keywords', 'summarize', 'action_items', 'translate', 'polish', 'simplify'].map(magic => (
                              <button 
                                key={magic} 
                                onClick={() => handleMagic(magic)}
                                disabled={isNoteProcessing}
                                className="bg-painter-bg hover:bg-painter-secondary/10 border border-painter-secondary/20 px-2 py-1.5 rounded-lg text-xs transition-colors"
                              >
                                  {t[`magic${magic.charAt(0).toUpperCase() + magic.slice(1)}` as keyof typeof t]}
                              </button>
                          ))}
                      </div>
                      
                      {/* Editor/Preview */}
                      <div className="flex-1 relative">
                          <div className="absolute top-2 right-2 z-10 flex gap-1 bg-painter-card/80 p-1 rounded-lg backdrop-blur-sm border border-painter-primary/10">
                              <button 
                                onClick={() => setNoteState(p => ({...p, mode: 'edit'}))}
                                className={`px-3 py-1 text-xs rounded-md ${noteState.mode === 'edit' ? 'bg-painter-primary text-white' : 'hover:bg-painter-secondary/10'}`}
                              >
                                  {t.editNote}
                              </button>
                              <button 
                                onClick={() => setNoteState(p => ({...p, mode: 'preview'}))}
                                className={`px-3 py-1 text-xs rounded-md ${noteState.mode === 'preview' ? 'bg-painter-primary text-white' : 'hover:bg-painter-secondary/10'}`}
                              >
                                  {t.previewNote}
                              </button>
                          </div>

                          {noteState.mode === 'edit' ? (
                              <textarea 
                                  className="w-full h-full bg-painter-bg p-6 resize-none focus:outline-none font-mono text-sm"
                                  value={noteState.content}
                                  onChange={e => setNoteState(prev => ({...prev, content: e.target.value}))}
                                  placeholder={t.noteInputPlaceholder}
                              />
                          ) : (
                              <div 
                                  className="w-full h-full bg-painter-bg p-6 overflow-y-auto markdown-body"
                                  dangerouslySetInnerHTML={{ __html: marked(noteState.content) }}
                              />
                          )}
                      </div>
                  </div>

                  {/* Note Chat */}
                  <div className="bg-painter-card rounded-2xl shadow-lg border border-painter-primary/10 flex flex-col overflow-hidden">
                      <div className="p-4 border-b border-painter-primary/10 bg-painter-bg/30">
                          <h3 className="font-bold text-painter-primary mb-2">Note Assistant</h3>
                          <select 
                            className="w-full bg-painter-bg border border-painter-secondary/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-painter-accent"
                            value={selectedModel}
                            onChange={e => setSelectedModel(e.target.value)}
                        >
                            {MODEL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-painter-bg/5">
                          {noteChatHistory.map((msg, idx) => (
                             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-painter-primary text-white' : 'bg-painter-bg border border-painter-secondary/20'}`}>
                                    {msg.text}
                                </div>
                             </div>
                          ))}
                          {isNoteProcessing && <div className="text-xs animate-pulse opacity-50">Thinking...</div>}
                      </div>
                      <div className="p-4 border-t border-painter-primary/10">
                          <div className="flex gap-2">
                              <input 
                                className="flex-1 bg-painter-bg border border-painter-secondary/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-painter-accent"
                                value={noteChatInput}
                                onChange={e => setNoteChatInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleNoteChat()}
                                placeholder="Ask about the note..."
                              />
                              <button onClick={handleNoteChat} disabled={isNoteProcessing} className="bg-painter-accent text-white p-2 rounded-lg">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
               {/* Agent List */}
               <div className="bg-painter-card rounded-2xl shadow-lg p-4 overflow-y-auto border border-painter-primary/10 flex flex-col">
                 <h3 className="font-bold text-painter-primary mb-2">Select Agent</h3>
                 
                 {/* Model Selection */}
                 <div className="mb-4">
                    <label className="text-xs text-painter-secondary uppercase font-semibold mb-1 block">{t.modelSelection}</label>
                    <select 
                        className="w-full bg-painter-bg border border-painter-secondary/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-painter-accent"
                        value={selectedModel}
                        onChange={e => setSelectedModel(e.target.value)}
                    >
                        {MODEL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                 </div>

                 <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                   {parsedAgents.map(agent => (
                     <div 
                        key={agent.id}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all border ${
                          selectedAgentId === agent.id 
                            ? 'bg-painter-primary text-white border-painter-primary' 
                            : 'bg-painter-bg hover:bg-painter-secondary/10 border-painter-secondary/20'
                        }`}
                     >
                       <div className="font-bold text-sm">{agent.name}</div>
                       <div className="text-xs opacity-80 mt-1 line-clamp-2">{agent.description}</div>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Chat Area */}
               <div className="lg:col-span-2 bg-painter-card rounded-2xl shadow-lg flex flex-col border border-painter-primary/10 overflow-hidden">
                  <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-painter-bg/5">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-painter-secondary mt-20 opacity-50">
                        <IconSparkles />
                        <p className="mt-2">Start a conversation with {currentAgent?.name}</p>
                        <p className="text-xs">Context aware of filtered dataset ({filteredData.length} rows)</p>
                      </div>
                    )}
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-painter-primary text-white rounded-br-none' 
                            : 'bg-painter-bg text-painter-text border border-painter-secondary/20 rounded-bl-none'
                        }`}>
                          <div className="text-xs opacity-70 mb-1 flex justify-between gap-4">
                             <div className="flex gap-2">
                                <span>{msg.role === 'model' ? currentAgent?.name : 'You'}</span>
                                {msg.modelUsed && <span className="opacity-50 text-[10px] bg-black/10 px-1 rounded">{msg.modelUsed}</span>}
                             </div>
                             <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                         <div className="bg-painter-bg p-4 rounded-2xl rounded-bl-none border border-painter-secondary/20 animate-pulse">
                           {t.analyzing}
                         </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-painter-card border-t border-painter-primary/10">
                    <div className="flex gap-2">
                      <input 
                        className="flex-1 bg-painter-bg border border-painter-secondary/30 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-painter-accent"
                        placeholder="Type your query..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button 
                        onClick={handleSendMessage}
                        disabled={isChatLoading}
                        className="bg-painter-accent hover:bg-painter-primary text-white rounded-full p-3 transition-colors shadow-md disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'hq' && (
             <div className="bg-painter-card rounded-2xl shadow-lg p-8 border border-painter-primary/10 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-painter-primary">{t.hq}</h3>
                    <div className="flex gap-2">
                        <label className="bg-painter-secondary/10 hover:bg-painter-secondary/20 text-painter-text px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm flex items-center gap-2">
                            <IconUpload /> {t.uploadYaml}
                            <input type="file" className="hidden" accept=".yaml,.yml" onChange={handleAgentYamlUpload} />
                        </label>
                        <button onClick={handleDownloadYaml} className="bg-painter-primary hover:bg-painter-accent text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            {t.downloadYaml}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold text-lg mb-2">Edit agents.yaml</h4>
                        <p className="text-xs text-painter-secondary mb-2">Modify the definitions below to add or change agent behaviors.</p>
                        <textarea 
                            className="w-full h-96 bg-painter-bg font-mono text-xs border border-painter-secondary/30 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-painter-accent"
                            value={agentsYaml}
                            onChange={(e) => setAgentsYaml(e.target.value)}
                        />
                        <button className="mt-2 bg-painter-accent text-white px-4 py-2 rounded-lg text-sm shadow-md hover:bg-painter-primary transition-colors">
                            {t.saveYaml}
                        </button>
                    </div>

                    <div>
                         <h4 className="font-bold text-lg mb-2">System Logs</h4>
                        <div className="bg-painter-bg p-4 rounded-lg font-mono text-xs h-96 overflow-y-auto border border-painter-secondary/20 shadow-inner">
                            {logs.length === 0 && <span className="opacity-50">No logs yet.</span>}
                            {logs.map((log, i) => (
                            <div key={i} className="mb-2 border-b border-painter-secondary/10 pb-1">
                                <span className="text-painter-accent mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span className="font-bold text-painter-primary mr-2">{log.event}:</span>
                                <span className="opacity-80">{log.details}</span>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'docs' && (
             <div className="bg-painter-card rounded-2xl shadow-lg p-8 border border-painter-primary/10 animate-fade-in">
                <h3 className="text-2xl font-bold text-painter-primary mb-6">Documentation</h3>
                <div className="space-y-6 text-painter-text">
                   <div className="p-6 bg-painter-bg rounded-xl border border-painter-secondary/20">
                     <h4 className="font-bold text-lg mb-2 text-painter-accent">Overview</h4>
                     <p>GUDID Chronicles allows for deep inspection of medical device supply chains. Use the Analytics tab for visual insights and the Chat tab to converse with specialized AI agents.</p>
                   </div>
                   <div className="p-6 bg-painter-bg rounded-xl border border-painter-secondary/20">
                     <h4 className="font-bold text-lg mb-2 text-painter-accent">Advanced Filtering</h4>
                     <p>You can now filter the entire dataset by Supplier, Device, and Date Range directly in the Analytics tab. These filters apply to all charts, the graph, and the AI agent context.</p>
                   </div>
                   <div className="p-6 bg-painter-bg rounded-xl border border-painter-secondary/20">
                     <h4 className="font-bold text-lg mb-2 text-painter-accent">AI Note Keeper</h4>
                     <p>Paste text or upload files to the Note Keeper. Use AI Magics to organize, summarize, or translate content. Use the "AI Keywords" magic to highlight specific terms in Coral color.</p>
                   </div>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}

// Separate component for Graph to handle D3 logic cleanly
const GraphComponent = ({ nodes, links, theme }: { nodes: any[], links: any[], theme: PainterStyle }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const zoomGroupRef = React.useRef<SVGGElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
      if (!svgRef.current || !zoomGroupRef.current) return;
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom().on("zoom", (e) => {
          d3.select(zoomGroupRef.current).attr("transform", e.transform);
      });

      if (direction === 'reset') {
          svg.transition().duration(750).call(zoom.transform as any, d3.zoomIdentity);
      } else {
          svg.transition().duration(750).call(zoom.scaleBy as any, direction === 'in' ? 1.2 : 0.8);
      }
  };

  useEffect(() => {
    if (!svgRef.current || !zoomGroupRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = 500;

    // Clear previous elements inside the group, but keep the group
    const g = d3.select(zoomGroupRef.current);
    g.selectAll("*").remove();

    // Setup Zoom behavior on the SVG
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (e) => {
            g.attr("transform", e.transform);
        });

    d3.select(svgRef.current).call(zoom as any);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = g.append("g")
        .attr("stroke", theme.colors.secondary)
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", (d: any) => Math.sqrt(d.value || 1));

    const node = g.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 8)
        .attr("fill", (d: any) => {
            if (d.group === 'supplier') return theme.colors.primary; 
            if (d.group === 'device') return theme.colors.accent; 
            return theme.colors.secondary;
        })
        .style("cursor", "pointer")
        .on("click", (event, d) => {
            setSelectedNode(d);
            event.stopPropagation();
        })
        .call(drag(simulation) as any);

    // Labels
    const labels = g.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .text((d: any) => d.label.length > 10 ? d.label.substring(0,10)+'...' : d.label)
        .attr("x", 12)
        .attr("y", 4)
        .style("font-size", "10px")
        .style("fill", theme.colors.text)
        .style("pointer-events", "none");

    simulation.on("tick", () => {
        link
            .attr("x1", (d: any) => d.source.x)
            .attr("y1", (d: any) => d.source.y)
            .attr("x2", (d: any) => d.target.x)
            .attr("y2", (d: any) => d.target.y);

        node
            .attr("cx", (d: any) => d.x)
            .attr("cy", (d: any) => d.y);
            
        labels
            .attr("x", (d: any) => d.x + 12)
            .attr("y", (d: any) => d.y + 4);
    });

    function drag(simulation: any) {
        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

  }, [nodes, links, theme]);

  return (
    <div className="relative w-full h-full">
        <svg ref={svgRef} className="w-full h-full" onClick={() => setSelectedNode(null)}>
            <g ref={zoomGroupRef}></g>
        </svg>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button onClick={() => handleZoom('in')} className="bg-painter-card hover:bg-painter-secondary/20 p-2 rounded-full shadow-md border border-painter-primary/20 text-painter-primary">
                <IconZoomIn />
            </button>
            <button onClick={() => handleZoom('out')} className="bg-painter-card hover:bg-painter-secondary/20 p-2 rounded-full shadow-md border border-painter-primary/20 text-painter-primary">
                <IconZoomOut />
            </button>
            <button onClick={() => handleZoom('reset')} className="bg-painter-card hover:bg-painter-secondary/20 p-2 rounded-full shadow-md border border-painter-primary/20 text-painter-primary" title="Reset Zoom">
                <IconRefresh />
            </button>
        </div>

        {/* Node Details Card */}
        {selectedNode && (
            <div className="absolute top-4 right-4 w-64 bg-painter-card/95 backdrop-blur shadow-xl rounded-xl p-4 border border-painter-primary/20 animate-fade-in text-sm">
                <h4 className="font-bold text-painter-primary mb-2 text-lg">{selectedNode.label}</h4>
                <div className="space-y-1 text-painter-text">
                    <p><span className="opacity-70">Type:</span> <span className="capitalize font-medium">{selectedNode.group}</span></p>
                    <p><span className="opacity-70">Total Volume:</span> <span className="font-mono font-bold text-painter-accent">{selectedNode.totalUnits}</span> units</p>
                </div>
                <button onClick={() => setSelectedNode(null)} className="mt-3 text-xs text-painter-secondary hover:text-painter-primary underline w-full text-right">
                    Close
                </button>
            </div>
        )}
    </div>
  );
};
