
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  Settings2,
  Flower2,
  X,
  ShieldCheck,
  History,
  Trash2,
  Ticket
} from 'lucide-react';
import { FileData, CheckResult } from './types';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [inputNumber, setInputNumber] = useState('');
  const [lastResult, setLastResult] = useState<{ number: string; isValid: boolean } | null>(null);
  const [history, setHistory] = useState<CheckResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Cập nhật nội dung nhãn mặc định theo yêu cầu mới
  const [successLabel, setSuccessLabel] = useState('CHƯA BÁN - Quay tiếp');
  const [failureLabel, setFailureLabel] = useState('ĐÃ BÁN - Trúng giải');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const savedHistory = localStorage.getItem('check_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('check_history', JSON.stringify(history));
  }, [history]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      let foundNumbers: string[] = [];
      try {
        if (isExcel) {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            jsonData.forEach(row => {
              row.forEach(cell => {
                if (cell !== null && cell !== undefined) {
                  const matches = String(cell).match(/\d+/g);
                  if (matches) {
                    foundNumbers.push(...matches.map(m => Number(m).toString()));
                  }
                }
              });
            });
          });
        } else {
          const text = e.target?.result as string;
          const rawMatches = text.match(/\d+/g) || [];
          foundNumbers = rawMatches.map(m => Number(m).toString());
        }

        const numberSet = new Set(foundNumbers);
        setFileData({ name: file.name, count: numberSet.size, numbers: numberSet });
        setIsProcessing(false);
        inputRef.current?.focus();
      } catch (error) {
        setIsProcessing(false);
        alert("Lỗi xử lý file.");
      }
    };

    if (isExcel) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileData || !inputNumber.trim()) return;

    const num = inputNumber.trim();
    const normalizedNum = Number(num).toString();
    const isValid = fileData.numbers.has(normalizedNum);
    
    setLastResult({ number: num, isValid });
    
    const historyItem: CheckResult = {
      id: Date.now().toString(),
      number: num,
      isValid: isValid,
      timestamp: new Date()
    };
    setHistory(prev => [historyItem, ...prev].slice(0, 50));
    setInputNumber('');
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHistory([]);
    localStorage.removeItem('check_history');
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#7c0000] via-[#8b0000] to-[#5a0000] flex flex-col items-center overflow-hidden relative">
      <div className="absolute top-0 left-0 p-4 opacity-5 pointer-events-none">
        <Flower2 className="w-48 h-48 text-yellow-400 rotate-12" />
      </div>
      <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none">
        <Flower2 className="w-48 h-48 text-yellow-400 -rotate-12" />
      </div>

      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-4 right-4 p-3 bg-black/20 hover:bg-black/40 border border-yellow-500/30 rounded-full text-yellow-400 z-50 transition-all shadow-lg"
      >
        <Settings2 className="w-5 h-5" />
      </button>

      <div className="flex-1 w-full max-w-7xl flex flex-col px-6 py-4 space-y-4 overflow-hidden">
        
        {/* Header - Trở về bố cục gọn gàng */}
        <header className="text-center space-y-4 flex-shrink-0">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-yellow-400/80 font-medium tracking-[0.4em] text-[10px] uppercase">
              Ban Giáo Lý Thiếu Nhi Tân Thành
            </span>
            <div className="h-[1px] w-32 bg-yellow-400/20"></div>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-xl uppercase tracking-tight leading-tight">
            XUÂN PHÚC LỘC <span className="text-yellow-400">HỒNG ÂN</span>
          </h1>
        </header>

        {/* Input Bar */}
        <div className="w-full max-w-xl mx-auto relative flex-shrink-0">
          <form onSubmit={handleCheck} className="relative group">
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-yellow-500/40 group-focus-within:text-yellow-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value.replace(/[^\d]/g, ''))}
              disabled={!fileData}
              placeholder={fileData ? "NHẬP MÃ SỐ VÉ..." : "CHƯA NẠP DỮ LIỆU..."}
              className="w-full pl-20 pr-8 py-6 md:py-7 text-5xl md:text-6xl font-black bg-black/40 border-4 border-yellow-500/20 rounded-[40px] shadow-2xl focus:border-yellow-400 focus:bg-black/60 outline-none transition-all placeholder:text-white/10 text-yellow-400 text-center tracking-widest disabled:opacity-20 leading-none"
            />
          </form>
        </div>

        {/* Workspace Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* Main Display Area - Trở về bố cục nhãn nằm dưới số */}
          <div className="lg:col-span-7 h-full flex items-center justify-center min-h-0">
            {lastResult ? (
              <div className={`w-full max-w-2xl p-6 md:p-10 rounded-[50px] shadow-2xl flex flex-col items-center text-center animate-in zoom-in duration-200 border-8 transition-all h-full justify-center ${
                lastResult.isValid 
                ? 'bg-[#002855] border-blue-400/30 text-blue-50' 
                : 'bg-yellow-400 border-white text-red-950'
              }`}>
                <div className="mb-4">
                  {lastResult.isValid ? (
                    <XCircle className="w-20 h-20 md:w-24 md:h-24 text-blue-300" />
                  ) : (
                    <div className="p-4 bg-red-700 rounded-full shadow-lg">
                      <CheckCircle2 className="w-20 h-20 md:w-24 md:h-24 text-yellow-400" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-none drop-shadow-xl">
                    {lastResult.number}
                  </h2>
                  <div className={`px-10 py-5 rounded-[24px] text-2xl md:text-4xl font-black uppercase tracking-wide shadow-xl leading-tight ${
                    lastResult.isValid ? 'bg-blue-600 text-white animate-pulse' : 'bg-red-700 text-white'
                  }`}>
                    {lastResult.isValid ? successLabel : failureLabel}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center opacity-10 flex flex-col items-center justify-center h-full">
                 <Ticket className="w-32 h-32 text-yellow-500" />
              </div>
            )}
          </div>

          {/* Side History Panel */}
          <div className="lg:col-span-5 h-full min-h-0">
            <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-[40px] p-6 h-full flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2 text-yellow-400/80 leading-none">
                  <History className="w-5 h-5" /> Lịch sử
                </h3>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="p-2.5 bg-red-500/10 hover:bg-red-500/30 rounded-xl text-red-400 transition-all flex items-center justify-center"
                    title="Xóa ngay"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar min-h-0">
                {history.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/10 italic text-xs font-medium tracking-widest text-center">
                    Chưa có mã số nào
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id}
                      className={`flex items-center justify-between p-4 rounded-[20px] border-2 transition-all ${
                        item.isValid 
                        ? 'bg-blue-900/40 border-blue-500/20 text-blue-100' 
                        : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-100'
                      }`}
                    >
                      <div className="flex flex-col space-y-1">
                        <span className="text-2xl font-black tracking-wider leading-none">{item.number}</span>
                        <span className="text-[9px] opacity-40 uppercase font-bold leading-none">
                          {new Date(item.timestamp).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                      <div className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest leading-none ${
                        item.isValid ? 'bg-blue-600 text-white' : 'bg-red-700 text-white'
                      }`}>
                        {item.isValid ? 'Chưa bán' : 'Trúng giải'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <footer className="text-center py-2 flex-shrink-0">
           <div className="inline-flex items-center gap-3 px-6 py-2 bg-black/20 rounded-full border border-white/5 opacity-60">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-yellow-500/80 leading-none">
                 © Ban Giáo Lý Thiếu Nhi Tân Thành - Sài Gòn
              </p>
              <div className="w-1 h-1 rounded-full bg-yellow-500/30"></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 leading-none">
                 Xuân Bính Ngọ 2026
              </p>
           </div>
        </footer>
      </div>

      {/* Settings Dialog */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-[32px] p-8 max-w-lg w-full shadow-2xl relative border-4 border-yellow-500/30 overflow-hidden">
            <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-700 uppercase leading-none">
              <Settings2 className="w-6 h-6" /> Cấu hình hệ thống
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest leading-none">1. Tải lên danh sách vé</label>
                <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${fileData ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-red-400'}`}>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.csv,.xlsx,.xls" />
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  ) : fileData ? (
                    <div className="text-center">
                      <ShieldCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-bold text-green-700 leading-none">{fileData.count.toLocaleString()} mã đã nạp</p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <Upload className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-[10px] font-bold uppercase leading-none">Bấm chọn tệp</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">2. Tùy chỉnh thông báo</label>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-indigo-600 uppercase leading-none px-1 tracking-widest">Khi tìm thấy (Trùng):</div>
                    <input type="text" value={successLabel} onChange={(e) => setSuccessLabel(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold leading-none focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-red-600 uppercase leading-none px-1 tracking-widest">Khi không thấy:</div>
                    <input type="text" value={failureLabel} onChange={(e) => setFailureLabel(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold leading-none focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full mt-8 py-4 bg-red-700 text-white font-bold rounded-xl uppercase tracking-widest leading-none shadow-lg active:scale-[0.98] transition-transform">
              Hoàn tất & Lưu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
