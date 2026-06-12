const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const dashboard = document.getElementById('dashboard');
const statusToast = document.getElementById('statusToast');
const tabBtnJoined = document.getElementById('tabBtnJoined');
const tabBtnProducts = document.getElementById('tabBtnProducts');
const tabBtnCategorized = document.getElementById('tabBtnCategorized');
const tabContentJoined = document.getElementById('tabContentJoined');
const tabContentProducts = document.getElementById('tabContentProducts');
const tabContentCategorized = document.getElementById('tabContentCategorized');
const numbersTableBody = document.getElementById('numbersTableBody');
const productsGrid = document.getElementById('productsGrid');
const categorizedGrid = document.getElementById('categorizedGrid');
const statJoined = document.getElementById('statJoined');
const statProducts = document.getElementById('statProducts');
const statCategorized = document.getElementById('statCategorized');
const statTotal = document.getElementById('statTotal');
const copyNumbersBtn = document.getElementById('copyNumbers');
const exportNumbersTxtBtn = document.getElementById('exportNumbersTxt');
const exportNumbersJsonBtn = document.getElementById('exportNumbersJson');
const exportNumbersCsvBtn = document.getElementById('exportNumbersCsv');
const exportProductsBtn = document.getElementById('exportProducts');
const searchNumbers = document.getElementById('searchNumbers');
const searchProducts = document.getElementById('searchProducts');
const searchCategorized = document.getElementById('searchCategorized');
const btnAnalyzeAll = document.getElementById('btnAnalyzeAll');
const spinAnalyzeAll = document.getElementById('spinAnalyzeAll');
const analysisProgressContainer = document.getElementById('analysisProgressContainer');
const analysisProgressText = document.getElementById('analysisProgressText');
const analysisProgressPercent = document.getElementById('analysisProgressPercent');
const analysisProgressBar = document.getElementById('analysisProgressBar');
const categoryFilterContainer = document.getElementById('categoryFilterContainer');
const debugLogs = document.getElementById('debugLogs');
const btnClearLogs = document.getElementById('btnClearLogs');

let parsedNumbers = [];
let parsedProducts = [];
let selectedCategoryFilter = 'Todos';

const categoryColors = {
  'eletrônicos': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'tecnologia': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'casa': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'cozinha': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'moda': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'beleza': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'esportes': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'livros': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'brinquedos': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'games': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'supermercado': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'ferramentas': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'calçados': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'roupas': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'default': 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

const getMainCategoryName = (item) => {
  const mainCatObj = item.categorized?.breadcrumbsWithLinks?.find((b) => b.mainCategory);
  return mainCatObj?.name ?? 'E-commerce';
};

const addLog = (message, type = 'info') => {
  const time = new Date().toLocaleTimeString();
  const colors = {
    error: 'text-red-400 font-semibold',
    success: 'text-emerald-400 font-semibold',
    warning: 'text-amber-400 font-semibold',
    api: 'text-violet-400',
    info: 'text-slate-400'
  };
  const colorClass = colors[type] ?? 'text-slate-400';
  const placeholder = debugLogs.querySelector('.text-slate-600');
  if (placeholder) {
    debugLogs.innerHTML = '';
  }

  const logEl = document.createElement('div');
  logEl.className = `${colorClass} py-0.5 border-b border-slate-900/30 last:border-0`;
  logEl.textContent = `[${time}] ${message}`;
  debugLogs.appendChild(logEl);
  debugLogs.scrollTop = debugLogs.scrollHeight;
};

const showToast = (message, isError) => {
  statusToast.className = `p-4 rounded-xl border flex items-center justify-between gap-3 text-sm ${
    isError
      ? 'bg-red-500/10 border-red-500/20 text-red-400'
      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
  }`;
  statusToast.textContent = message;
  statusToast.classList.remove('hidden');
};

const sendScrapeRequest = (targetUrl) =>
  new Promise((resolve, reject) => {
    const startTime = performance.now();
    addLog('Enviando solicitação de raspagem para: ' + targetUrl, 'info');

    chrome.runtime.sendMessage({ action: 'scrapeProduct', url: targetUrl }, (response) => {
      if (chrome.runtime.lastError) {
        const msg = chrome.runtime.lastError.message;
        addLog('Erro de comunicação com background: ' + msg, 'error');
        reject(new Error(msg));
        return;
      }

      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

      if (!response?.success) {
        const errMsg = response?.error ?? 'Erro desconhecido';
        addLog('Retorno indica falha: ' + errMsg, 'error');
        reject(new Error(errMsg));
        return;
      }

      addLog(`Metadados extraídos com sucesso em ${elapsed}s!`, 'success');
      resolve(response.data);
    });
  });

const handleFile = (file) => {
  addLog('Arquivo recebido: ' + file.name + ' (' + file.size + ' bytes)', 'info');
  const reader = new FileReader();
  reader.onload = (e) => {
    addLog('Leitura do arquivo executada com sucesso', 'success');
    processText(e.target.result);
  };
  reader.onerror = () => {
    addLog('Erro fatal ao ler o arquivo txt', 'error');
    showToast('Erro ao ler o arquivo selecionado.', true);
  };
  reader.readAsText(file);
};

const processText = (text) => {
  addLog('Iniciando análise léxica do dump de mensagens...', 'info');
  const lines = text.split(/\r?\n/).filter(Boolean);
  addLog('Total de linhas lidas: ' + lines.length, 'info');

  const joinedLines = lines.filter(
    (line) =>
      line.includes('entrou usando') ||
      line.includes('foi adicionado') ||
      (line.includes('entrou') && !line.includes(':'))
  );

  parsedNumbers = joinedLines
    .map((line) => {
      const parts = line.split(' - ');
      if (parts.length < 2) return null;
      const actionPart = parts[1];
      const match = actionPart.match(/(\+55\s?\d{2,3}\s?\d{4,5}[-\s]?\d{4})/);
      if (!match) return null;
      const original = match[1].replace(/[\u200e\u200f\u202a-\u202e]/g, '').trim();
      const clean = original.replace(/[-\s]/g, '');
      const ddd = original.substring(4, 6).trim();
      return { original, clean, ddd, line: line.trim() };
    })
    .filter(Boolean);

  addLog('Total de números mapeados: ' + parsedNumbers.length, 'success');

  const rawBlocks = text.split(/(?=\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} - )/g);

  parsedProducts = rawBlocks
    .map((block) => {
      const blockLines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (blockLines.length === 0) return null;

      const urlRegex = /(https?:\/\/[^\s]+)/;
      const hasUrl = blockLines.some((line) => urlRegex.test(line));
      if (!hasUrl) return null;

      const headerLine = blockLines[0];
      const headerMatch = headerLine.match(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} - [^:]+:\s*(.*)/);
      const headline = headerMatch ? headerMatch[1].trim() : '';

      const urls = blockLines.reduce((acc, line) => {
        const match = line.match(urlRegex);
        if (match) {
          acc.push(match[1]);
        }
        return acc;
      }, []);

      if (urls.length === 0) return null;

      const bodyLines = blockLines.slice(1).filter((line) => !urlRegex.test(line));
      const priceRegex = /(?:De\s+R\$|R\$|por\s+R\$|cupom)/i;
      const possibleTitles = bodyLines.filter((line) => !priceRegex.test(line));
      const title = possibleTitles[0] ?? headline ?? 'Produto sem título';
      const priceLine = bodyLines.find((line) => priceRegex.test(line)) ?? '';

      return {
        id: crypto.randomUUID(),
        headline,
        title,
        price: priceLine,
        link: urls[0],
        categorized: null,
        isAnalyzing: false,
        error: null
      };
    })
    .filter(Boolean);

  addLog('Ofertas isoladas: ' + parsedProducts.length, 'success');

  statJoined.textContent = parsedNumbers.length;
  statProducts.textContent = parsedProducts.length;
  statCategorized.textContent = 0;
  statTotal.textContent = lines.length;

  renderNumbers();
  renderProducts();
  renderCategorized();
  renderCategoryFilters();

  dashboard.classList.remove('hidden');
  addLog('Dashboard atualizado e ativo!', 'success');
  showToast('Arquivo WhatsApp processado com sucesso!', false);
};

const renderNumbers = () => {
  const query = searchNumbers.value.toLowerCase();
  const filtered = parsedNumbers.filter(
    (item) => item.clean.includes(query) || item.ddd.includes(query)
  );

  numbersTableBody.innerHTML = filtered
    .map(
      (item) => `
      <tr class="hover:bg-slate-900/10 text-slate-300 transition-colors">
        <td class="px-6 py-4 font-mono text-emerald-400 font-semibold">${item.ddd}</td>
        <td class="px-6 py-4 font-mono">${item.original}</td>
        <td class="px-6 py-4 text-xs text-slate-500 max-w-md truncate">${item.line}</td>
      </tr>`
    )
    .join('');
};

const renderProducts = () => {
  const query = searchProducts.value.toLowerCase();
  const filtered = parsedProducts.filter(
    (item) =>
      item.title.toLowerCase().includes(query) || item.link.toLowerCase().includes(query)
  );

  productsGrid.innerHTML = filtered
    .map(
      (item) => `
      <div class="bg-slate-900/20 border border-slate-900 p-5 rounded-xl flex flex-col justify-between gap-4 hover:border-slate-800 transition-all duration-300">
        <div class="space-y-1.5">
          <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Oferta Compartilhada</span>
          <h3 class="font-semibold text-slate-200 line-clamp-2 leading-relaxed">${item.title}</h3>
          ${item.price ? `<p class="text-sm text-emerald-400 font-medium font-mono">${item.price}</p>` : ''}
        </div>
        <div class="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-900/60 mt-2">
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors truncate max-w-full">
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            ${item.link}
          </a>
          <button data-analyze-id="${item.id}" class="text-xs text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 px-2.5 py-1.5 rounded-lg border border-violet-500/20 transition-all flex-shrink-0 flex items-center gap-1">
            Analisar Código
          </button>
        </div>
      </div>`
    )
    .join('');
};

const renderCategorized = () => {
  const query = searchCategorized.value.toLowerCase();
  const filtered = parsedProducts.filter((item) => {
    if (!item.categorized) return false;
    const mainCatName = getMainCategoryName(item);
    const { title, brand } = item.categorized;
    const matchesQuery =
      title.toLowerCase().includes(query) ||
      mainCatName.toLowerCase().includes(query) ||
      (brand && brand.toLowerCase().includes(query));
    if (selectedCategoryFilter === 'Todos') return matchesQuery;
    return matchesQuery && mainCatName === selectedCategoryFilter;
  });

  if (filtered.length === 0) {
    categorizedGrid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500 space-y-2">
        <svg class="w-10 h-10 mx-auto text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p class="text-sm font-medium">Nenhum produto analisado nesta seção</p>
        <p class="text-xs text-slate-600">Dispare a extração do código para buscar categorias, marcas e detalhes da web.</p>
      </div>`;
    return;
  }

  categorizedGrid.innerHTML = filtered
    .map((item) => {
      const mainCatName = getMainCategoryName(item);
      const catKey = mainCatName.toLowerCase();
      const badgeColor = categoryColors[catKey] ?? categoryColors['default'];
      return `
        <div class="bg-slate-900/40 border border-slate-900 hover:border-slate-800 p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300 relative group overflow-hidden">
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor} uppercase tracking-wider">${mainCatName}</span>
              <span class="text-[10px] font-semibold text-slate-500 font-mono">${item.categorized.store || 'E-commerce'}</span>
            </div>
            <div class="space-y-1">
              <h3 class="font-bold text-slate-100 text-sm leading-snug group-hover:text-violet-400 transition-colors">${item.categorized.title}</h3>
              ${
                item.categorized.breadcrumbsWithLinks?.length > 0
                  ? `<div class="flex items-center flex-wrap gap-1 text-[10px] text-slate-400 bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-900/60 mt-1.5 font-medium">
                      ${item.categorized.breadcrumbsWithLinks
                        .map(
                          (b, idx) => `
                          <a href="${b.url}" target="_blank" rel="noopener noreferrer" class="${b.mainCategory ? 'text-violet-400 font-semibold hover:text-violet-300' : 'hover:text-slate-300'} transition-colors">${b.name}</a>
                          ${idx < item.categorized.breadcrumbsWithLinks.length - 1 ? `<svg class="w-2.5 h-2.5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>` : ''}`
                        )
                        .join('')}
                    </div>`
                  : ''
              }
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">${item.categorized.description || 'Nenhuma descrição recuperada.'}</p>
            <div class="flex items-center gap-4 text-xs pt-1">
              ${item.categorized.brand ? `<div><span class="text-slate-500">Marca:</span> <span class="text-slate-300 font-medium">${item.categorized.brand}</span></div>` : ''}
              ${item.categorized.price ? `<div><span class="text-slate-500">Valor:</span> <span class="text-emerald-400 font-mono font-semibold">${item.categorized.price}</span></div>` : ''}
            </div>
          </div>
          <div class="pt-3 border-t border-slate-900/80 flex items-center justify-between gap-2">
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors truncate max-w-[180px]">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver Produto
            </a>
            <button data-rescrape-id="${item.id}" class="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
              Re-Scrapear
            </button>
          </div>
        </div>`;
    })
    .join('');
};

const renderCategoryFilters = () => {
  const categories = new Set(
    parsedProducts
      .filter((p) => p.categorized?.breadcrumbsWithLinks)
      .map((p) => getMainCategoryName(p))
  );
  const uniqueCategories = ['Todos', ...Array.from(categories)];

  categoryFilterContainer.innerHTML = uniqueCategories
    .map((cat) => {
      const isActive = selectedCategoryFilter === cat;
      const cls = isActive
        ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
        : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 text-slate-400';
      return `<button data-filter-cat="${cat}" class="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${cls}">${cat}</button>`;
    })
    .join('');
};

const setCategoryFilter = (cat) => {
  selectedCategoryFilter = cat;
  renderCategoryFilters();
  renderCategorized();
};

const analyzeSingleProduct = async (id) => {
  const product = parsedProducts.find((p) => p.id === id);
  if (!product) return;

  product.isAnalyzing = true;
  addLog('Iniciando raspagem individual para: "' + product.title + '"', 'info');
  showToast('Scrapeando: "' + product.title + '"...', false);

  try {
    const analysis = await sendScrapeRequest(product.link);
    product.categorized = analysis;
    product.error = null;
    addLog('Sucesso na raspagem de: ' + product.title, 'success');
  } catch (e) {
    product.error = e.message;
    addLog('Falha na raspagem de: "' + product.title + '" | ' + e.message, 'error');
    showToast('Erro na raspagem de: ' + product.title, true);
  } finally {
    product.isAnalyzing = false;
    statCategorized.textContent = parsedProducts.filter((p) => p.categorized).length;
    renderCategorized();
    renderCategoryFilters();
  }
};

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('border-slate-600', 'bg-slate-900/30');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('border-slate-600', 'bg-slate-900/30');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('border-slate-600', 'bg-slate-900/30');
  if (e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

btnClearLogs.addEventListener('click', () => {
  debugLogs.innerHTML = '<div class="text-slate-600">Terminal limpo.</div>';
});

productsGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-analyze-id]');
  if (btn) {
    analyzeSingleProduct(btn.dataset.analyzeId);
  }
});

categorizedGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-rescrape-id]');
  if (btn) {
    analyzeSingleProduct(btn.dataset.rescrapeId);
  }
});

categoryFilterContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-filter-cat]');
  if (btn) {
    setCategoryFilter(btn.dataset.filterCat);
  }
});

searchNumbers.addEventListener('input', renderNumbers);
searchProducts.addEventListener('input', renderProducts);
searchCategorized.addEventListener('input', renderCategorized);

tabBtnJoined.addEventListener('click', () => {
  tabBtnJoined.className = 'border-b-2 border-emerald-500 text-emerald-400 pb-3 font-semibold text-sm transition-all';
  tabBtnProducts.className = 'border-b-2 border-transparent text-slate-400 hover:text-slate-300 pb-3 font-semibold text-sm transition-all';
  tabBtnCategorized.className = 'border-b-2 border-transparent text-slate-400 hover:text-slate-300 pb-3 font-semibold text-sm transition-all';
  tabContentJoined.classList.remove('hidden');
  tabContentProducts.classList.add('hidden');
  tabContentCategorized.classList.add('hidden');
});

tabBtnProducts.addEventListener('click', () => {
  tabBtnProducts.className = 'border-b-2 border-blue-500 text-blue-400 pb-3 font-semibold text-sm transition-all';
  tabBtnJoined.className = 'border-b-2 border-transparent text-slate-400 hover:text-slate-300 pb-3 font-semibold text-sm transition-all';
  tabBtnCategorized.className = 'border-b-2 border-transparent text-slate-400 hover:text-slate-300 pb-3 font-semibold text-sm transition-all';
  tabContentProducts.classList.remove('hidden');
  tabContentJoined.classList.add('hidden');
  tabContentCategorized.classList.add('hidden');
});

tabBtnCategorized.addEventListener('click', () => {
  tabBtnCategorized.className = 'border-b-2 border-violet-500 text-violet-400 pb-3 font-semibold text-sm transition-all';
  tabBtnJoined.className = 'border-b-2 border-transparent text-slate-400 hover:text-slate-300 pb-3 font-semibold text-sm transition-all';
  tabBtnProducts.className = 'border-b-2 border-transparent text-slate-400 hover:text-slate-300 pb-3 font-semibold text-sm transition-all';
  tabContentCategorized.classList.remove('hidden');
  tabContentJoined.classList.add('hidden');
  tabContentProducts.classList.add('hidden');
});

copyNumbersBtn.addEventListener('click', () => {
  const text = parsedNumbers.map((item) => item.clean).join('\n');
  navigator.clipboard.writeText(text).then(() => {
    addLog('Cópia de ' + parsedNumbers.length + ' números efetuada!', 'success');
    showToast('Números limpos copiados para a área de transferência!', false);
  });
});

const downloadBlob = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const buildCsv = (rows) =>
  '\ufeff' +
  rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');

exportNumbersTxtBtn.addEventListener('click', () => {
  const content = parsedNumbers.map((item) => item.clean).join('\n');
  downloadBlob(content, 'numeros_whatsapp.txt', 'text/plain;charset=utf-8');
  addLog('Exportação de ' + parsedNumbers.length + ' números para TXT realizada!', 'success');
  showToast('Números exportados em TXT!', false);
});

exportNumbersJsonBtn.addEventListener('click', () => {
  downloadBlob(JSON.stringify(parsedNumbers, null, 2), 'numeros_whatsapp.json', 'application/json;charset=utf-8');
  addLog('Exportação para JSON realizada!', 'success');
  showToast('Números exportados em JSON!', false);
});

exportNumbersCsvBtn.addEventListener('click', () => {
  const rows = [
    ['DDD', 'Numero Original', 'Numero Limpo', 'Acao Original'],
    ...parsedNumbers.map((item) => [item.ddd, item.original, item.clean, item.line])
  ];
  downloadBlob(buildCsv(rows), 'numeros_whatsapp.csv', 'text/csv;charset=utf-8');
  addLog('Exportação para CSV realizada!', 'success');
  showToast('Números exportados em CSV!', false);
});

exportProductsBtn.addEventListener('click', () => {
  const rows = [
    ['Título', 'Link', 'Preço'],
    ...parsedProducts.map((p) => [p.title, p.link, p.price || ''])
  ];
  downloadBlob(buildCsv(rows), 'produtos_whatsapp.csv', 'text/csv;charset=utf-8');
  addLog('Exportação de produtos para CSV finalizada.', 'success');
});

btnAnalyzeAll.addEventListener('click', async () => {
  const queue = parsedProducts.filter((p) => !p.categorized);
  if (queue.length === 0) {
    addLog('Todos os produtos já contam com metadados raspados.', 'warning');
    showToast('Todos os produtos já foram mapeados!', false);
    return;
  }

  addLog('Disparando lote de processamento. Total: ' + queue.length, 'warning');
  btnAnalyzeAll.disabled = true;
  spinAnalyzeAll.classList.remove('hidden');
  analysisProgressContainer.classList.remove('hidden');

  let current = 0;
  for (const product of queue) {
    current++;
    const percent = Math.round((current / queue.length) * 100);
    analysisProgressPercent.textContent = `${percent}%`;
    analysisProgressBar.style.width = `${percent}%`;
    analysisProgressText.textContent = `Scrapeando (${current}/${queue.length}): ${product.title}`;
    addLog('Processando item ' + current + '/' + queue.length + ': ' + product.title, 'info');

    try {
      const analysis = await sendScrapeRequest(product.link);
      product.categorized = analysis;
      product.error = null;
      addLog('Sucesso no item [' + current + '/' + queue.length + ']: ' + analysis.title, 'success');
    } catch (e) {
      product.error = e.message;
      addLog('Falha no item [' + current + '/' + queue.length + '] (' + product.title + '): ' + e.message, 'error');
    }

    statCategorized.textContent = parsedProducts.filter((p) => p.categorized).length;
    renderCategorized();
    renderCategoryFilters();
  }

  btnAnalyzeAll.disabled = false;
  spinAnalyzeAll.classList.add('hidden');
  analysisProgressContainer.classList.add('hidden');
  addLog('Fila de processamento em lote concluída!', 'success');
  showToast('Mapeamento finalizado!', false);
});

addLog('WhatsApp Chat Parser + ML Scraper iniciado e pronto!', 'success');