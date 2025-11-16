import React, { useState } from 'react';

export const ManualInputForm: React.FC<{
  onSubmit: (data: { productName: string; productDescription: string; benefitsList: string; imageUrl: string }) => void;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [benefitsList, setBenefitsList] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productName && productDescription && benefitsList) {
      onSubmit({ productName, productDescription, benefitsList, imageUrl });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div>
        <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nome do Produto
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="product-name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: Fone de Ouvido ProSound"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Descrição do Produto
        </label>
        <div className="mt-1">
          <textarea
            id="product-description"
            rows={3}
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Uma descrição curta e persuasiva do produto."
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="benefits-list" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Principais Benefícios
        </label>
        <div className="mt-1">
          <textarea
            id="benefits-list"
            rows={4}
            value={benefitsList}
            onChange={(e) => setBenefitsList(e.target.value)}
            className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="- Cancelamento de ruído ativo&#10;- Bateria com 24h de duração&#10;- Conexão Bluetooth 5.2"
            required
          />
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Liste os benefícios, um por linha, começando com '-'.</p>
      </div>

       <div>
        <label htmlFor="manual-product-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          URL da Imagem do Produto (Opcional)
        </label>
        <div className="mt-1">
          <input
            type="url"
            id="manual-product-image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Cole uma URL de imagem de alta qualidade"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Gerando Infográfico...' : '✨ Gerar Infográfico Manualmente'}
        </button>
      </div>
    </form>
  );
};
