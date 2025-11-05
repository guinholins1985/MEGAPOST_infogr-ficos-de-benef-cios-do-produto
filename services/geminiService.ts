import { GoogleGenAI, Type } from "@google/genai";
import { InfographicData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const infographicSchema = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING },
    headline: { type: Type.STRING },
    summary: { type: Type.STRING },
    benefits: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          icon: { type: Type.STRING },
        },
        required: ["title", "description", "icon"],
      },
    },
  },
  required: ["productName", "headline", "summary", "benefits"],
};

const extractionSchema = {
    type: Type.OBJECT,
    properties: {
      productName: { type: Type.STRING },
      productDescription: { type: Type.STRING },
      benefitsList: { type: Type.STRING },
    },
    required: ["productName", "productDescription", "benefitsList"],
};

export async function extractProductInfoFromUrl(url: string): Promise<{ productName: string, productDescription: string, benefitsList: string }> {
    const prompt = `
      Você é um assistente de marketing especialista em extrair informações de páginas de produtos.
      Analise o conteúdo da seguinte URL de um anúncio de marketplace: "${url}"
  
      Extraia as seguintes informações:
      1.  **Nome do Produto:** O nome principal e conciso do produto.
      2.  **Descrição do Produto:** Um resumo persuasivo do que o produto faz.
      3.  **Lista de Benefícios:** Uma lista dos principais benefícios ou características, formatada com um item por linha começando com '-'.
  
      Retorne um objeto JSON com as chaves "productName", "productDescription", e "benefitsList".
      Não inclua nenhum texto fora do objeto JSON.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: extractionSchema,
        },
      });
  
      const jsonText = response.text.trim();
      const data = JSON.parse(jsonText);
      return data;
    } catch (error) {
      console.error("Error extracting product info:", error);
      throw new Error("Falha ao extrair informações do anúncio. Verifique a URL e tente novamente.");
    }
}

export async function generateInfographicContent(
  productName: string,
  productDescription: string,
  benefitsList: string
): Promise<Omit<InfographicData, 'productImageUrl'>> {
  const prompt = `
    Você é um designer de marketing especialista em criar infográficos de produtos persuasivos.
    Com base nas informações a seguir, gere o conteúdo para um infográfico visualmente atraente.
    O tom deve ser persuasivo, empolgante e focado nos benefícios.

    Nome do Produto: "${productName}"
    Descrição do Produto: "${productDescription}"
    Lista de Benefícios Principais:
    ${benefitsList}

    Gere um objeto JSON que siga estritamente o schema fornecido.
    Para o campo "icon", escolha o nome de ícone mais adequado desta lista: 
    'CheckCircle', 'LightningBolt', 'ShieldCheck', 'Star', 'Heart', 'Rocket', 
    'AcademicCap', 'Adjustments', 'Annotation', 'Archive', 'ArrowCircleUp', 'Beaker'.
    Garanta que cada benefício tenha um título conciso (2-4 palavras) e uma descrição curta e impactante.
    Não inclua nenhum texto fora do objeto JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: infographicSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    
    if (!data.productName || !data.headline || !data.summary || !Array.isArray(data.benefits)) {
        throw new Error("Estrutura de dados inválida recebida da API.");
    }

    return data as InfographicData;
  } catch (error) {
    console.error("Erro ao gerar conteúdo do infográfico:", error);
    throw new Error("Falha ao gerar o conteúdo do infográfico. Verifique os dados de entrada e tente novamente.");
  }
}


export async function generateInfographicFromUrl(url: string): Promise<Omit<InfographicData, 'productImageUrl'>> {
  try {
    const { productName, productDescription, benefitsList } = await extractProductInfoFromUrl(url);
    if (!productName || !productDescription || !benefitsList) {
        throw new Error("Não foi possível extrair informações completas do produto da URL. Verifique se a página contém nome, descrição e benefícios claros.");
    }
    const infographicContent = await generateInfographicContent(productName, productDescription, benefitsList);
    return infographicContent;
  } catch (error) {
    console.error("Erro no processo de geração a partir da URL:", error);
    if (error instanceof Error) {
        throw new Error(`Falha ao gerar infográfico: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido ao gerar o infográfico a partir da URL.");
  }
}