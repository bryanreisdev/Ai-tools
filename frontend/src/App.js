import React, { useState, useRef, useEffect, useCallback } from 'react';
import FaceAnalyzerOverlay from './FaceAnalyzerOverlay';
function App() {
  const [url, setUrl] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [activeTab, setActiveTab] = useState('qrcode');
  const [demographicsResult, setDemographicsResult] = useState(null);
  const [isDemographicsAnalyzing, setIsDemographicsAnalyzing] = useState(false);
  const [selectedDemographicsImage, setSelectedDemographicsImage] = useState(null);
  const [demographicsPreviewUrl, setDemographicsPreviewUrl] = useState(null);

  // Tabs config e comportamento em telas pequenas
  const tabs = [
    { key: 'qrcode', label: 'QR Code', icon: '📱', activeText: 'text-blue-400', gradient: 'btn-gradient-blue' },
    { key: 'demographics', label: 'Demografia', icon: '👤', activeText: 'text-orange-400', gradient: 'btn-gradient-orange' },
  ];
  const mobileTabsContainerRef = useRef(null);
  const tabRefs = useRef({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateMobileTabScrollState = () => {
    const el = mobileTabsContainerRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
  };

  const centerActiveMobileTab = useCallback(() => {
    const container = mobileTabsContainerRef.current;
    const activeEl = tabRefs.current[activeTab];
    if (!container || !activeEl) return;
    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    const offsetLeft = activeRect.left - containerRect.left + container.scrollLeft;
    const targetScrollLeft = Math.max(0, offsetLeft - (container.clientWidth / 2 - activeEl.clientWidth / 2));
    container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
  }, [activeTab]);

  const scrollMobileTabs = (direction) => {
    const el = mobileTabsContainerRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  useEffect(() => {
    centerActiveMobileTab();
    updateMobileTabScrollState();
  }, [activeTab, centerActiveMobileTab]);

  useEffect(() => {
    const el = mobileTabsContainerRef.current;
    if (!el) return;
    updateMobileTabScrollState();
    const onScroll = () => updateMobileTabScrollState();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateMobileTabScrollState);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateMobileTabScrollState);
    };
  }, []);

  const apiBase = (process.env.REACT_APP_API_BASE && process.env.REACT_APP_API_BASE.trim())
    || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');

  const resolveApi = (path) => {
    if (!path.startsWith('/')) return path;
    if (!apiBase) return path; 
    return `${apiBase}${path}`;
  };

  const handleQRSubmit = async (e) => {
    e.preventDefault();
    setQrCode(null);
    
    const apiUrl = resolveApi('/api/qrcode');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (response.ok) {
      const blob = await response.blob();
      setQrCode(URL.createObjectURL(blob));
    } else {
      alert('Erro ao gerar QR Code');
    }
  };

  const downloadQRCode = async () => {
    if (!url) {
      alert('Por favor, gere um QR Code primeiro');
      return;
    }
    
    const apiUrl = resolveApi('/api/qrcode/download');
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url,
          filename: `qrcode_${new Date().getTime()}`
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `qrcode_${new Date().getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        alert('Erro ao baixar QR Code');
      }
    } catch (error) {
      alert('Erro ao baixar QR Code');
    }
  };

  const printQRCode = async () => {
    if (!url) {
      alert('Por favor, gere um QR Code primeiro');
      return;
    }
    
    const apiUrl = resolveApi('/api/qrcode/base64');
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${url}</title>
              <style>
                body { 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  height: 100vh; 
                  margin: 0; 
                  font-family: Arial, sans-serif;
                  flex-direction: column;
                  background: #0f172a;
                  color: #f3f4f6;
                }
                .qr-container {
                  text-align: center;
                  border: 2px solid #3b82f6;
                  padding: 20px;
                  border-radius: 10px;
                  background: rgba(30, 41, 59, 0.8);
                  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
                }
                img { 
                  max-width: 300px; 
                  height: auto; 
                  margin-bottom: 10px;
                }
                .url-text {
                  font-size: 12px;
                  color: #9ca3af;
                  margin-top: 10px;
                  word-break: break-all;
                }
                @media print {
                  body { height: auto; background: white; color: black; }
                  .qr-container { background: white; border-color: #000; }
                  .url-text { color: #666; }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <h2>QR Code</h2>
                <img src="${data.image_base64}" alt="QR Code" />
                <div class="url-text">${url}</div>
                <div class="url-text">Gerado em: ${new Date().toLocaleString()}</div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      } else {
        alert('Erro ao preparar QR Code para impressão');
      }
    } catch (error) {
      alert('Erro ao preparar QR Code para impressão');
    }
  };

  





  const handleDemographicsImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedDemographicsImage(file);
      setDemographicsResult(null);
      if (demographicsPreviewUrl) {
        URL.revokeObjectURL(demographicsPreviewUrl);
      }
      const objectUrl = URL.createObjectURL(file);
      setDemographicsPreviewUrl(objectUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (demographicsPreviewUrl) {
        URL.revokeObjectURL(demographicsPreviewUrl);
      }
    };
  }, [demographicsPreviewUrl]);

  const analyzeDemographics = async () => {
    if (!selectedDemographicsImage) {
      alert('Por favor, selecione uma imagem primeiro');
      return;
    }

    setIsDemographicsAnalyzing(true);
    setDemographicsResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target.result;
        
        const apiUrl = resolveApi('/api/demographics');

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
        });

        const ct = (response.headers.get('content-type') || '').toLowerCase();

        if (!response.ok) {
          if (ct.includes('application/json')) {
            const error = await response.json();
            alert(`Erro: ${error.error || response.statusText} (${response.status})`);
          } else {
            alert(`Erro ${response.status}: o servidor retornou conteúdo não-JSON (possível 504).`);
          }
          setIsDemographicsAnalyzing(false);
          return;
        }

        const result = ct.includes('application/json') ? await response.json() : null;
        if (!result) {
          alert('Resposta inválida do servidor.');
          setIsDemographicsAnalyzing(false);
          return;
        }
        setDemographicsResult(result);
        setIsDemographicsAnalyzing(false);
      };
      reader.readAsDataURL(selectedDemographicsImage);
    } catch (error) {
      alert('Erro ao analisar a imagem');
      setIsDemographicsAnalyzing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0f172a] bg-animated bg-aurora overflow-hidden py-8 sm:py-12 px-3 sm:px-4 font-sans">
 
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="grid-pattern opacity-20"></div>
        <div className="orb orb-blue"></div>
        <div className="orb orb-purple"></div>
        <div className="orb orb-green"></div>
      </div>
      

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative">

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 sm:mb-4 shimmer">
            🔗 AI Tools
          </h1>
          <p className="text-lg sm:text-xl  max-w-3xl mx-auto leading-relaxed">
            Transforme URLs, gere QR Codes e analise demográfica e de emoções com tecnologia de ponta
          </p>
        </div>

   
        <div className="text-center mb-8 space-y-4">
          {/* Tecnologias */}
          <div className="glass-light rounded-2xl px-6 py-4 border border-white/10">
            <h3 className="text-white/90 text-sm font-semibold mb-3">🛠️ Tecnologias Utilizadas</h3>
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-400/30">
                React.js
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full border border-green-400/30">
                Python
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-400/30">
                Flask
              </span>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-400/30">
                OpenCV
              </span>
              <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full border border-red-400/30">
                TensorFlow Lite
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/30">
                Tailwind CSS
              </span>
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full border border-teal-400/30">
                Docker
              </span>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full border border-orange-400/30">
                Redis
              </span>
            </div>
          </div>

          {/* Desenvolvedor */}
          <div className="inline-flex items-center space-x-6 glass-light rounded-2xl px-6 py-4 border border-white/10">
            <span className="text-white/80 text-sm font-medium">
              Desenvolvido por Bryan Reis
            </span>
            <div className="flex items-center space-x-4">
              <a
                href="https://linkedin.com/in/bryan-reis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-300 transform hover:scale-110"
                title="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://github.com/bryanreisdev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-300 transform hover:scale-110"
                title="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="card-dark rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8 md:p-10 glass neon-border">
          {/* Tabs */}
          {(() => {
            const activeIndex = Math.max(0, tabs.findIndex(t => t.key === activeTab));
            return (
              <div className="mb-8">

                <div className="relative hidden md:grid grid-cols-2 gap-2 glass-light rounded-2xl p-2">
                  <span
                    className="absolute top-2 bottom-2 left-2 w-1/2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 shadow-lg transition-transform duration-300 ease-out border border-white/20"
                    style={{ transform: `translateX(${activeIndex * 100}%)` }}
                  />
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative z-10 py-4 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${
                        activeTab === tab.key
                          ? `${tab.activeText} text-glow transform scale-105`
                          : 'text-gray-400 hover:text-white'
                      } btn-neon`}
                    >
                      <span className="text-2xl mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Mobile Tabs */}
                <div className="md:hidden relative">
                  <div className="relative no-scrollbar snap-x snap-mandatory scroll-px-4 tabs-mobile-scroll" ref={mobileTabsContainerRef}>
                    <div className="relative flex gap-3 px-1 py-1 tabs-mobile">
                      {/* Indicador animado para mobile */}
                      <span
                        className="absolute top-1 bottom-1 left-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 shadow-lg transition-transform duration-300 ease-out border border-white/20"
                        style={{
                          width: `calc(53.5% - 0.9rem)`,
                          transform: `translateX(${activeIndex * 100}%)`,
                          zIndex: 1
                        }}
                      />
                      {tabs.map((tab) => (
                        <button
                          key={tab.key}
                          ref={el => { if (el) tabRefs.current[tab.key] = el; }}
                          onClick={() => setActiveTab(tab.key)}
                                                      className={`relative z-10 flex-none min-w-[60%] xs:min-w-[50%] sm:min-w-[40%] px-4 py-3 rounded-full border font-semibold transition-all duration-300 snap-center tab-pill ${
                              activeTab === tab.key
                                ? `${tab.activeText} text-glow transform scale-105`
                                : 'text-gray-400 hover:text-white'
                            } btn-neon ${tab.key === 'demographics' ? 'tab-pill-demographics' : ''}`}
                        >
                          <span className="text-xl mr-2">{tab.icon}</span>
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
            
                </div>
            
            );
          })()}

          {/* QR Code Tab */}
          {activeTab === 'qrcode' && (
            <div className="space-y-8">
              <form onSubmit={handleQRSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="Digite a URL para gerar QR Code"
                    required
                    className="w-full px-6 text-black py-4 text-lg input-dark rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-300"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full btn-gradient-blue text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 text-lg btn-hover-effect btn-neon"
                >
                  <span className="mr-2">✨</span>
                  Gerar QR Code
                </button>
              </form>
              
              {qrCode && (
                <div className="mt-10 text-center animate-fade-in">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center justify-center">
                    <span className="mr-3">🎯</span>
                    Seu QR Code:
                  </h2>
                  <div className="glass p-8 sm:p-10 rounded-3xl border border-white/20 shadow-2xl inline-block transform hover:scale-105 transition-all duration-300 animate-pulse-soft neon-border">
                    <img src={qrCode} alt="QR Code" className="max-w-full max-h-[50vh] h-auto rounded-2xl" />
                  </div>
                  <p className="mt-6 text-white text-lg">Escaneie com seu dispositivo móvel</p>
                  <p className="mt-3 text-sm text-green-400">
                    <span className="mr-2">💾</span>
                    QR Code salvo no cache para acesso rápido
                  </p>
                  
                  {/* Botões de Download e Impressão */}
                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:space-x-6">
                    <button
                      onClick={downloadQRCode}
                      className="btn-gradient-blue text-white font-bold py-4 px-8 rounded-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg"
                    >
                      <span className="text-xl">📥</span>
                      <span>Baixar PNG</span>
                    </button>
                    
                    <button
                      onClick={printQRCode}
                      className="btn-gradient-green text-white font-bold py-4 px-8 rounded-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg"
                    >
                      <span className="text-xl">🖨️</span>
                      <span>Imprimir</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}



        {/* Emotion Detection Tab removida */}

          {/* Demographics Analysis Tab */}
          {activeTab === 'demographics' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  <span className="mr-3">👤</span>
                  Análise Demográfica
                </h2>
                <p className="text-white">Detecte idade, gênero e características faciais</p>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDemographicsImageUpload}
                    className="hidden"
                    id="demographics-image-upload"
                  />
                  <label
                    htmlFor="demographics-image-upload"
                    className="block w-full p-8 border-2 border-dashed border-orange-400/50 rounded-2xl text-center cursor-pointer hover:border-orange-400 transition-colors duration-300 glass"
                  >
                    <div className="text-4xl mb-4">📷</div>
                    <div className="text-white font-semibold mb-2">
                      {selectedDemographicsImage ? 'Imagem selecionada' : 'Clique para selecionar uma imagem'}
                    </div>
                    <div className="text-black-400 text-sm">
                      {selectedDemographicsImage ? selectedDemographicsImage.name : 'PNG, JPG, JPEG até 50MB'}
                    </div>
                  </label>
                </div>

                {selectedDemographicsImage && (
                  <div className="space-y-4">
                    <div className="relative w-full rounded-2xl border border-white/10 glass overflow-hidden">
                      <div className="relative">
                        {demographicsPreviewUrl && (
                          <img
                            src={demographicsPreviewUrl}
                            alt="Pré-visualização da imagem"
                            className="w-full max-h-[60vh] object-contain bg-black/20"
                          />
                        )}
                        <FaceAnalyzerOverlay isAnalyzing={isDemographicsAnalyzing} />
                      </div>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={analyzeDemographics}
                        disabled={isDemographicsAnalyzing}
                        className="btn-gradient-orange text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 text-lg btn-hover-effect btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDemographicsAnalyzing ? (
                          <>
                            <span className="mr-2">⏳</span>
                            Analisando...
                          </>
                        ) : (
                          <>
                            <span className="mr-2">🔍</span>
                            Analisar Demografia
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

  
              {demographicsResult && (
                <div className="mt-8 sm:mt-10 space-y-6 sm:space-y-8 animate-fade-in">
             
                  <div className="text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold  text-white  mb-3 sm:mb-4 flex items-center justify-center">
                      📊 Análise Completa - {demographicsResult.total_faces} pessoa(s) detectada(s)
                    </h3>
                    <div className="flex justify-center gap-2 sm:space-x-4 mb-4 sm:mb-6 flex-wrap">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        demographicsResult.confidence_level === 'Alto' ? 'bg-green-100 text-green-800' :
                        demographicsResult.confidence_level === 'Médio' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        🎯 Confiança: {demographicsResult.confidence_level}
                      </span>
                      <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                        🔬 Versão: {demographicsResult.analysis_version}
                      </span>
                    </div>
                  </div>

              
                  {demographicsResult.summary && (
                    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-5 sm:p-8 rounded-2xl border-2 border-purple-100 shadow-lg">
                      <h4 className="text-2xl font-bold text-black mb-6 flex items-center justify-center">
                        📈 Estatísticas Globais
                      </h4>
                       <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4">
                        <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm">
                          <div className="text-3xl font-bold text-blue-600 mb-1">{demographicsResult.summary?.idade_media || 0}</div>
                          <div className="text-sm font-medium text-black">Idade Média</div>
                          <div className="text-xs text-black">{demographicsResult.summary?.faixa_etaria || 'N/A'}</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm">
                          <div className="text-3xl font-bold text-green-600 mb-1">{demographicsResult.summary?.categoria_predominante || 'N/A'}</div>
                          <div className="text-sm font-medium text-black">Categoria</div>
                          <div className="text-xs text-black">Diversidade: {demographicsResult.summary?.diversidade_etaria || 0}</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm">
                          <div className="mb-2 flex flex-col items-center">
                            <div
                              className="circular-progress"
                              style={{
                                '--progress': `${demographicsResult.summary?.confianca_media ? (demographicsResult.summary.confianca_media * 100).toFixed(0) : 0}`,
                                '--color': '#7C3AED'
                              }}
                            >
                              <span className="relative z-10 text-sm font-bold text-purple-700">
                                {demographicsResult.summary?.confianca_media ? (demographicsResult.summary.confianca_media * 100).toFixed(0) : 0}%
                              </span>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm font-medium text-black">Confiança Média</div>
                          <div className="text-xs text-black">Qualidade: {demographicsResult.summary?.qualidade_analise || 'N/A'}</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm">
                          <div className="text-sm font-medium text-black mb-2">Distribuição de Gênero</div>
                          <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-200">
                            <div
                              className="bg-blue-500"
                              style={{ width: `${(((demographicsResult.summary?.distribuicao_genero?.masculino || 0)) / Math.max(1, ((demographicsResult.summary?.distribuicao_genero?.masculino || 0) + (demographicsResult.summary?.distribuicao_genero?.feminino || 0)))) * 100}%` }}
                            />
                            <div
                              className="bg-pink-500"
                              style={{ width: `${(((demographicsResult.summary?.distribuicao_genero?.feminino || 0)) / Math.max(1, ((demographicsResult.summary?.distribuicao_genero?.masculino || 0) + (demographicsResult.summary?.distribuicao_genero?.feminino || 0)))) * 100}%` }}
                            />
                          </div>
                          <div className="mt-2 text-[10px] sm:text-xs text-black flex justify-between">
                            <span className="font-semibold text-blue-600">
                              M: {Math.round((((demographicsResult.summary?.distribuicao_genero?.masculino || 0)) / Math.max(1, ((demographicsResult.summary?.distribuicao_genero?.masculino || 0) + (demographicsResult.summary?.distribuicao_genero?.feminino || 0)))) * 100)}%
                            </span>
                            <span className="font-semibold text-pink-600">
                              F: {Math.round((((demographicsResult.summary?.distribuicao_genero?.feminino || 0)) / Math.max(1, ((demographicsResult.summary?.distribuicao_genero?.masculino || 0) + (demographicsResult.summary?.distribuicao_genero?.feminino || 0)))) * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm">
                          <div className="text-3xl font-bold text-indigo-600 mb-1">{demographicsResult.summary?.etnias_detectadas || 0}</div>
                          <div className="text-sm font-medium text-black">Etnias</div>
                          <div className="text-xs text-black">Detectadas</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm">
                          <div className="text-3xl font-bold text-teal-600 mb-1">{demographicsResult.summary?.faces_com_sorriso || 0}</div>
                          <div className="text-sm font-medium text-black">Sorrisos</div>
                          <div className="text-xs text-black">Detectados</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm">
                          <div className="mb-2 flex flex-col items-center">
                            <div
                              className="circular-progress"
                              style={{
                                '--progress': `${demographicsResult.summary?.qualidade_score ? (demographicsResult.summary.qualidade_score * 100).toFixed(0) : 0}`,
                                '--color': '#F97316'
                              }}
                            >
                              <span className="relative z-10 text-sm font-bold text-orange-700">
                                {demographicsResult.summary?.qualidade_score ? (demographicsResult.summary.qualidade_score * 100).toFixed(0) : 0}%
                              </span>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-black">Qualidade</div>
                          <div className="text-xs text-black">da Imagem</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm">
                          <div className="text-3xl font-bold text-red-600 mb-1">{demographicsResult.total_faces}</div>
                          <div className="text-sm font-medium text-black">Faces</div>
                          <div className="text-xs text-black">Analisadas</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Individual Analysis */}
                  <div className="space-y-5 sm:space-y-6">
                    <h4 className="text-2xl font-bold text-white text-center mb-6">
                      👥 Análise Individual Detalhada
                    </h4>
                    {demographicsResult.demographics.map((person, index) => (
                     <div key={index} className="bg-white border-2 border-gray-100 rounded-2xl p-5 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                        {/* Person Header */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5 sm:mb-6">
                          <h5 className="text-xl font-bold text-black flex items-center">
                            👤 Pessoa {person.face_id}
                          </h5>
                          <div className="flex space-x-3">
                             <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                              person.confidence_score > 0.7 ? 'bg-green-100 text-green-800' :
                              person.confidence_score > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              🎯 {(person.confidence_score * 100).toFixed(0)}% confiança
                            </span>
                             <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                              person.quality_score > 0.7 ? 'bg-blue-100 text-blue-800' :
                              person.quality_score > 0.5 ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-black'
                            }`}>
                              📸 Qualidade {(person.quality_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-5 sm:gap-8 lg:grid-cols-2">
                          {/* Age Analysis */}
                          <div className="space-y-4">
                            <h6 className="font-semibold text-black text-lg flex items-center">
                              🎂 Análise de Idade
                            </h6>
                             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 sm:p-6 rounded-xl border border-blue-100">
                               <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="text-center">
                                   <div className="text-2xl sm:text-3xl font-bold text-blue-600">{person.age.estimated_age}</div>
                                  <div className="text-sm text-black">Anos Estimados</div>
                                </div>
                                <div className="text-center">
                                   <div className="text-base sm:text-lg font-bold text-blue-500">{person.age.category}</div>
                                  <div className="text-sm text-black">Categoria</div>
                                </div>
                              </div>
                              <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-black">Faixa Etária:</span>
                                  <span className="font-semibold text-black">{person.age.age_range}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-black">Confiança:</span>
                                  <span className="font-semibold text-blue-600">{(person.age.confidence * 100).toFixed(0)}%</span>
                                </div>
                               <div className="bg-blue-200 rounded-full h-2 mt-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${person.age.confidence * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Gender Analysis */}
                          <div className="space-y-4">
                            <h6 className="font-semibold text-black text-lg flex items-center">
                              ⚧ Análise de Gênero
                            </h6>
                             <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-5 sm:p-6 rounded-xl border border-pink-100">
                              <div className="text-center mb-4">
                                <div className="text-xl sm:text-2xl font-bold text-pink-600 mb-1">{person.gender.predicted_gender}</div>
                                <div className="text-sm text-black">Gênero Predito</div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-black">Masculino:</span>
                                  <span className="font-semibold text-black">{(person.gender.male_probability * 100).toFixed(0)}%</span>
                                </div>
                                 <div className="bg-blue-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${person.gender.male_probability * 100}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-black">Feminino:</span>
                                  <span className="font-semibold text-black">{(person.gender.female_probability * 100).toFixed(0)}%</span>
                                </div>
                                 <div className="bg-pink-200 rounded-full h-2">
                                  <div
                                    className="bg-pink-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${person.gender.female_probability * 100}%` }}
                                  ></div>
                                </div>
                                <div className="text-center text-sm text-pink-600 font-semibold mt-3">
                                  Confiança: {(person.gender.confidence * 100).toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Facial Features */}
                          <div className="space-y-4">
                            <h6 className="font-semibold text-black text-lg flex items-center">
                              ✨ Características Faciais
                            </h6>
                             <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 sm:p-6 rounded-xl border border-green-100">
                               <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                                <div className="flex justify-between">
                                  <span className="text-black">Rosto:</span>
                                  <span className="font-semibold text-black">{person.facial_features?.formato_rosto || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-black">Pele:</span>
                                  <span className="font-semibold text-black">{person.facial_features?.tipo_pele || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-black">Olhos:</span>
                                  <span className="font-semibold text-black">{person.facial_features?.formato_olhos || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-black">Cor Olhos:</span>
                                  <span className="font-semibold text-black">{person.facial_features?.cor_olhos_estimada || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-black">Nariz:</span>
                                  <span className="font-semibold text-black">{person.facial_features?.nariz || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-black">Lábios:</span>
                                  <span className="font-semibold text-black">{person.facial_features?.labios || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between col-span-2">
                                  <span className="text-black">Sobrancelhas:</span>
                                  <span className="font-semibold text-black">{person.facial_features?.sobrancelhas || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Ethnicity and Expression */}
                          <div className="space-y-4">
                            <h6 className="font-semibold text-black text-lg flex items-center">
                              🌍 Etnia e Expressão
                            </h6>
                             <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-5 sm:p-6 rounded-xl border border-purple-100">
                              {/* Ethnicity */}
                              <div className="mb-4">
                                <div className="text-center mb-2">
                                  <div className="text-base sm:text-lg font-bold text-purple-600">
                                    {person.ethnicity?.predicted_ethnicity || 'Não determinado'}
                                  </div>
                                  <div className="text-sm text-black">Etnia Estimada</div>
                                </div>
                                <div className="text-center text-sm text-purple-600">
                                  Confiança: {person.ethnicity?.confidence ? (person.ethnicity.confidence * 100).toFixed(0) : 0}%
                                </div>
                              </div>
                              
                              {/* Expression */}
                              <div className="border-t border-purple-200 pt-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-purple-600 mb-2">
                                    {person.expression?.expressions?.join(', ') || 'Neutro'}
                                  </div>
                                   <div className="text-xs sm:text-sm text-black">Expressões Detectadas</div>
                                   {person.expression?.probabilities && (
                                     <div className="mt-3 space-y-2 text-left max-w-md mx-auto">
                                       {Object.entries(person.expression.probabilities)
                                         .sort((a,b)=>b[1]-a[1])
                                         .slice(0,3)
                                         .map(([emo, prob]) => (
                                           <div key={emo}>
                                             <div className="flex justify-between text-[10px] sm:text-xs text-black">
                                               <span className="font-medium">{emo}</span>
                                               <span className="font-mono">{(prob*100).toFixed(0)}%</span>
                                             </div>
                                             <div className="w-full h-2 bg-purple-100 rounded">
                                               <div className="h-2 rounded bg-purple-500" style={{ width: `${prob*100}%` }} />
                                             </div>
                                           </div>
                                         ))}
                                     </div>
                                   )}
                                   <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] sm:text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-black">Sorriso:</span>
                                      <span className={person.expression?.has_smile ? 'text-green-600' : 'text-black'}>
                                        {person.expression?.has_smile ? '✓' : '✗'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-black">Olhos Abertos:</span>
                                      <span className="text-black">{person.expression?.eye_openness ? (person.expression.eye_openness * 100).toFixed(0) : 50}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Position Info */}
                         <div className="mt-5 sm:mt-6 p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center text-sm text-black">
                            <span>Posição na imagem:</span>
                            <span>X: {person.position?.x || 0}, Y: {person.position?.y || 0}</span>
                            <span>Tamanho: {person.face_size?.width || 0}×{person.face_size?.height || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Info */}
                   <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-5 sm:p-6 rounded-xl border border-gray-200">
                    <div className="text-center space-y-2">
                      <p className="text-black text-sm">
                        <span className="mr-1">🧠</span>
                        Tecnologia: OpenCV + IA Avançada para análise demográfica completa
                      </p>
                      {demographicsResult && demographicsResult.from_cache && (
                        <p className="text-blue-600 text-sm">
                          <span className="mr-1">🔄</span>
                          Resultado recuperado do cache (analisado em {new Date(demographicsResult.analyzed_at).toLocaleString()})
                        </p>
                      )}
                      {demographicsResult && !demographicsResult.from_cache && (
                        <p className="text-green-600 text-sm">
                          <span className="mr-1">💾</span>
                          Análise realizada e salva no cache para futuras consultas
                        </p>
                      )}
                      <p className="text-xs text-black">
                        Hash da imagem: {demographicsResult.image_hash} | Versão: {demographicsResult.analysis_version}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default App;
