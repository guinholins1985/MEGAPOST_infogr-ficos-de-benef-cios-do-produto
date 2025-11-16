import React, { useState } from 'react';

export const ProductForm: React.FC<{
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
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
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
        <label htmlFor="product-image-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          URL da Imagem do Produto (Opcional)
        </label>
        <div className="mt-1">
          <input
            type="url"
            id="product-image-url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Cole uma URL de imagem de alta qualidade"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Forneça uma imagem para incluir no infográfico.</p>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Analisando e Gerando...' : '✨ Gerar Infográfico a partir da URL'}
        </button>
      </div>
    </form>
  );
};