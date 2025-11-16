import React, { useState, useCallback } from 'react';
import { generateInfographicFromUrl, generateInfographicContent } from './services/geminiService';
import { InfographicData } from './types';
import { useTheme } from './hooks/useTheme';
import { ProductForm } from './components/ProductForm';
import { ManualInputForm } from './components/ManualInputForm';
import { InfographicDisplay } from './components/InfographicDisplay';

type Tab = 'url' | 'manual';

const App: React.FC = () => {
  const [infographicData, setInfographicData] = useState<InfographicData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, toggleTheme] = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('url');

  const handleUrlGenerate = useCallback(async ({ marketplaceUrl, imageUrl }: { marketplaceUrl: string; imageUrl: string; }) => {
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

  const handleManualGenerate = useCallback(async ({ productName, productDescription, benefitsList, imageUrl }: { productName: string; productDescription: string; benefitsList: string; imageUrl: string }) => {
     if (!productName || !productDescription || !benefitsList) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setInfographicData(null);
    try {
      const data = await generateInfographicContent(productName, productDescription, benefitsList);
      const finalData = { ...data, productImageUrl: imageUrl };
      setInfographicData(finalData);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTabClassName = (tabName: Tab) => {
    const isActive = activeTab === tabName;
    return `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none ${
      isActive
        ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
    }`;
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-10 relative">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          Gerador de Infográficos com IA
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Crie um infográfico de benefícios impressionante a partir de uma URL ou preenchendo os dados manualmente.
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
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">1. Forneça os Dados</h2>
             <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <button onClick={() => setActiveTab('url')} className={getTabClassName('url')}>
                        Gerar via URL
                    </button>
                    <button onClick={() => setActiveTab('manual')} className={getTabClassName('manual')}>
                        Preencher Manualmente
                    </button>
                </nav>
            </div>
            {activeTab === 'url' ? (
                 <ProductForm onSubmit={handleUrlGenerate} isLoading={isLoading} />
            ) : (
                <ManualInputForm onSubmit={handleManualGenerate} isLoading={isLoading} />
            )}
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
};

export default App;
