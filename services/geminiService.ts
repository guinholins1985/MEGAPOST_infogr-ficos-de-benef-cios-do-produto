
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

export async function extractProductInfoFromUrl(url: string): Promise<{ productName: string, productDescription: string, benefitsList: string }> {
    const prompt = `
      Você é um assistente de marketing especialista em extrair informações de páginas de produtos.
      Sua tarefa é analisar o conteúdo da URL fornecida usando a ferramenta de busca e extrair informações chave.

      URL para analisar: "${url}"
  
      Informações a serem extraídas:
      1.  **Nome do Produto:** O nome principal e conciso do produto.
      2.  **Descrição do Produto:** Um resumo persuasivo do que o produto faz e para quem ele é.
      3.  **Lista de Benefícios:** Uma lista com os principais benefícios ou características. Formate isso como uma única string, com cada benefício em uma nova linha e começando com '-'.

      **Instruções de Saída (MUITO IMPORTANTE):**
      - Sua resposta DEVE SER ESTRITAMENTE um objeto JSON.
      - O objeto JSON deve ter as seguintes chaves: "productName", "productDescription", "benefitsList".
      - NÃO inclua NENHUM texto, explicação ou formatação de markdown (como \`\`\`json) fora do objeto JSON. A resposta deve ser o JSON puro.
      - Se alguma informação não puder ser encontrada na página, retorne uma string vazia para a chave correspondente.
      - Se a página não puder ser acessada ou for impossível extrair qualquer informação útil, retorne um objeto JSON com todas as chaves contendo strings vazias.

      Exemplo de Saída Válida:
      {
        "productName": "Câmera ProShot X1",
        "productDescription": "Capture momentos incríveis com a Câmera ProShot X1, equipada com um sensor de 50MP e gravação de vídeo em 4K. Perfeita para criadores de conteúdo e entusiastas da fotografia.",
        "benefitsList": "- Sensor de alta resolução de 50MP\\n- Gravação de vídeo em 4K a 60fps\\n- Foco automático rápido e preciso\\n- Design compacto e resistente"
      }
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
          temperature: 0.2,
        },
      });
  
      const text = response.text.trim();
      
      // The AI can sometimes wrap the JSON in ```json ... ``` or add explanatory text.
      // This logic extracts the JSON object more robustly.
      const startIndex = text.indexOf('{');
      const endIndex = text.lastIndexOf('}');
      
      if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        throw new Error(`A resposta da IA não continha um objeto JSON válido. Resposta recebida: "${text}"`);
      }
      
      const jsonText = text.substring(startIndex, endIndex + 1);
      
      let data;
      try {
        data = JSON.parse(jsonText);
      } catch (e) {
        console.error("Falha ao analisar JSON:", jsonText);
        throw new Error("A IA retornou uma resposta, mas o formato JSON era inválido.");
      }

      if (data.productName === undefined || data.productDescription === undefined || data.benefitsList === undefined) {
        throw new Error("O JSON retornado pela IA não contém os campos necessários.");
      }

      return data;
    } catch (error) {
      console.error("Error in extractProductInfoFromUrl:", error);
      if (error instanceof Error && (error.message.includes("JSON") || error.message.includes("IA não continha"))) {
        throw error;
      }
      throw new Error("Falha ao extrair informações do anúncio. A IA não conseguiu processar a URL. Verifique se a página está acessível publicamente e tente novamente.");
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
