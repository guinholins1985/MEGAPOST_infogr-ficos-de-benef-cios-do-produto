
import React, { useState, useCallback, useRef } from 'react';
import { generateInfographicFromUrl } from './services/geminiService';
import { InfographicData, Benefit, IconName } from './types';
import Icon from './components/Icon';
import InfographicSkeleton from './components/InfographicSkeleton';
import { useTheme } from './hooks/useTheme';

declare const html2canvas: any;

const ProductForm: React.FC<{
  onSubmit: (data: { marketplaceUrl: string; imageUrl: string }) => void;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const [marketplaceUrl, setMarketplaceUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (marketplaceUrl) {
      onSubmit({ marketplaceUrl, imageUrl });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="marketplace-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          URL do Anúncio do Produto
        </label>
        <div className="mt-1">
          <input
            type="url"
            id="marketplace-url"
            value={marketplaceUrl}
            onChange={(e) => setMarketplaceUrl(e.target.value)}
            className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Cole a URL do anúncio do produto aqui"
            required
          />
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">A IA irá analisar esta página para criar o infográfico.</p>
      </div>

      <div>
        <label htmlFor="product-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          URL da Imagem do Produto (Opcional)
        </label>
        <div className="mt-1">
          <input
            type="url"
            id="product-image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Cole uma URL de imagem de alta qualidade"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Forneça uma imagem para incluir no infográfico. Se deixado em branco, nenhuma imagem será usada.</p>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Analisando e Gerando...' : '✨ Gerar Infográfico a partir da URL'}
        </button>
      </div>
    </form>
  );
};

const InfographicDisplay: React.FC<{ data: InfographicData | null, isLoading: boolean }> = ({ data, isLoading }) => {
  const infographicRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isCopying, setIsCopying] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));

  const handleDownload = async () => {
    if (!infographicRef.current || typeof html2canvas === 'undefined') return;
    setIsDownloading(true);
    try {
        const canvas = await html2canvas(infographicRef.current, { scale: 2, backgroundColor: null });
        const link = document.createElement('a');
        link.download = `infografico-${data?.productName?.replace(/\s+/g, '-') || 'produto'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error("Failed to download infographic:", error);
        alert("Falha ao baixar o infográfico.");
    } finally {
        setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!infographicRef.current || typeof html2canvas === 'undefined' || !navigator.clipboard?.write) {
        alert('A cópia da imagem não é suportada neste navegador.');
        return;
    }
    if (isCopying || hasCopied) return;

    setIsCopying(true);
    try {
        const canvas = await html2canvas(infographicRef.current, { scale: 2, backgroundColor: null });
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        
        if (!blob) {
            throw new Error('Não foi possível criar a imagem para cópia.');
        }

        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    } catch (error) {
        console.error("Falha ao copiar imagem:", error);
        const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        alert(`Falha ao copiar imagem: ${message}`);
    } finally {
        setIsCopying(false);
    }
  };

  if (isLoading) {
    return <InfographicSkeleton />;
  }
  
  if (!data) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-5xl mb-4">🎨</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Seu Infográfico Aguarda</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Cole a URL de um produto no formulário para ver a mágica acontecer.
        </p>
      </div>
    );
  }

  const iconColors = [
      'text-emerald-500 bg-emerald-100 dark:bg-emerald-900',
      'text-sky-500 bg-sky-100 dark:bg-sky-900',
      'text-amber-500 bg-amber-100 dark:bg-amber-900',
      'text-rose-500 bg-rose-100 dark:bg-rose-900',
      'text-violet-500 bg-violet-100 dark:bg-violet-900',
      'text-teal-500 bg-teal-100 dark:bg-teal-900',
  ];

  const ActionButton: React.FC<{onClick: () => void, icon: IconName, label: string, disabled?: boolean, text?: string}> = ({onClick, icon, label, disabled, text}) => (
    <div className="tooltip">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className="p-2 rounded-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {text ? <span className="text-xs font-bold w-6 h-6 flex items-center justify-center">{text}</span> : <Icon name={icon} className="h-6 w-6" />}
      </button>
      <span className="tooltiptext">{label}</span>
    </div>
  );

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-full shadow-lg">
        <ActionButton onClick={handleCopy} icon="DocumentDuplicate" label={hasCopied ? "Copiado!" : "Copiar Imagem"} disabled={isCopying || hasCopied} text={hasCopied ? "✓" : (isCopying ? '...' : undefined)} />
        <ActionButton onClick={handleDownload} icon="Download" label="Baixar PNG" disabled={isDownloading} />
        <ActionButton onClick={handleZoomIn} icon="ZoomIn" label="Aumentar Zoom" disabled={zoomLevel >= 2} />
        <ActionButton onClick={handleZoomOut} icon="ZoomOut" label="Diminuir Zoom" disabled={zoomLevel <= 0.5} />
      </div>

      <div 
        ref={infographicRef} 
        className="transition-transform duration-300 ease-in-out" 
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top' }}
      >
        <div className="p-8 md:p-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-fade-in">
          {data.productImageUrl && (
            <div className="mb-8 overflow-hidden rounded-lg shadow-md">
                <img 
                    src={data.productImageUrl} 
                    alt={data.productName} 
                    className="w-full h-auto object-cover max-h-80"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            </div>
          )}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {data.productName}
            </h1>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {data.headline}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
              {data.summary}
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {data.benefits.map((benefit: Benefit, index: number) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg ${iconColors[index % iconColors.length]}`}>
                  <Icon name={benefit.icon as IconName} className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{benefit.title}</h3>
                  <p className="mt-1 text-base text-gray-600 dark:text-gray-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


function App() {
  const [infographicData, setInfographicData] = useState<InfographicData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, toggleTheme] = useTheme();

  const handleGenerate = useCallback(async ({ marketplaceUrl, imageUrl }: { marketplaceUrl: string; imageUrl: string; }) => {
    if (!marketplaceUrl) {
      setError('Por favor, insira a URL do anúncio.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setInfographicData(null);
    try {
      const data = await generateInfographicFromUrl(marketplaceUrl);
      const finalData = { ...data, productImageUrl: imageUrl };
      setInfographicData(finalData);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-10 relative">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          Gerador de Infográficos com IA
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Cole a URL de um produto e deixe a IA criar um infográfico de benefícios impressionante.
        </p>
        <div className="absolute top-0 right-0">
          <button
            onClick={toggleTheme}
            aria-label={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707.707M6.343 6.343l-.707.707m12.728 0l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="p-8 bg-gray-100 dark:bg-gray-800/50 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">1. Forneça a URL do Produto</h2>
            <ProductForm 
                onSubmit={handleGenerate} 
                isLoading={isLoading}
             />
          </div>

          <div className="lg:sticky top-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center lg:text-left">2. Seu Infográfico Gerado</h2>
            {error && (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
                <span className="font-medium">Erro!</span> {error}
              </div>
            )}
            <div className="min-h-[400px]">
              <InfographicDisplay data={infographicData} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="text-center mt-16 py-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">Desenvolvido com Gemini & React</p>
      </footer>
    </div>
  );
}

export default App;
