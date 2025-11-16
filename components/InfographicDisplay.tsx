import React, { useRef, useState } from 'react';
import { InfographicData, Benefit, IconName } from '../types';
import Icon from './Icon';
import InfographicSkeleton from './InfographicSkeleton';

declare const html2canvas: any;

export const InfographicDisplay: React.FC<{ data: InfographicData | null, isLoading: boolean }> = ({ data, isLoading }) => {
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
          Use o formulário para ver a mágica acontecer.
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