const btnToggleImport = document.getElementById('btnToggleImport');
const btnToggleConsole = document.getElementById('btnToggleConsole');
const dropZoneContainer = document.getElementById('dropZoneContainer');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const dashboard = document.getElementById('dashboard');
const statusToast = document.getElementById('statusToast');
const tabBtnJoined = document.getElementById('tabBtnJoined');
const tabBtnProducts = document.getElementById('tabBtnProducts');
const tabBtnCoupons = document.getElementById('tabBtnCoupons');
const tabContentJoined = document.getElementById('tabContentJoined');
const tabContentProducts = document.getElementById('tabContentProducts');
const tabContentCoupons = document.getElementById('tabContentCoupons');
const numbersTableBody = document.getElementById('numbersTableBody');
const productsGrid = document.getElementById('productsGrid');
const couponsGrid = document.getElementById('couponsGrid');
const statJoined = document.getElementById('statJoined');
const statProducts = document.getElementById('statProducts');
const statCoupons = document.getElementById('statCoupons');
const statStatus = document.getElementById('statStatus');
const copyNumbersBtn = document.getElementById('copyNumbers');
const exportNumbersTxtBtn = document.getElementById('exportNumbersTxt');
const exportNumbersCsvBtn = document.getElementById('exportNumbersCsv');
const exportProductsBtn = document.getElementById('exportProducts');
const clearNumbersBtn = document.getElementById('clearNumbers');
const clearProductsBtn = document.getElementById('clearProducts');
const clearCouponsBtn = document.getElementById('clearCoupons');
const searchNumbers = document.getElementById('searchNumbers');
const searchProducts = document.getElementById('searchProducts');
const searchCoupons = document.getElementById('searchCoupons');
const btnAnalyzeAll = document.getElementById('btnAnalyzeAll');
const spinAnalyzeAll = document.getElementById('spinAnalyzeAll');
const analysisProgressContainer = document.getElementById('analysisProgressContainer');
const analysisProgressText = document.getElementById('analysisProgressText');
const analysisProgressPercent = document.getElementById('analysisProgressPercent');
const analysisProgressBar = document.getElementById('analysisProgressBar');
const providerFilterContainer = document.getElementById('providerFilterContainer');
const debugLogs = document.getElementById('debugLogs');
const btnClearLogs = document.getElementById('btnClearLogs');
const terminalSection = document.getElementById('terminalSection');

let parsedNumbers = [];
let parsedProducts = [];
let selectedProviderFilter = 'Todos';

const providers = {
  ml: {
    name: 'Mercado Livre',
    badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  },
  amazon: {
    name: 'Amazon',
    badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  },
  shopee: {
    name: 'Shopee',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20'
  },
  default: {
    name: 'Outros',
    badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
};

const getProvider = (url) => {
  const lowercase = url.toLowerCase();
  if (lowercase.includes('mercadolivre.com') || lowercase.includes('meli.la') || lowercase.includes('mercadolibre')) {
    return providers.ml;
  }
  if (lowercase.includes('amazon.com') || lowercase.includes('amzn.to')) {
    return providers.amazon;
  }
  if (lowercase.includes('shopee.com') || lowercase.includes('shope.ee')) {
    return providers.shopee;
  }
  return providers.default;
};

const getStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
};

const setStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadInitialState = () => {
  parsedNumbers = getStorage('wp_parser_numbers');
  parsedProducts = getStorage('wp_parser_products');
  updateStats();
  renderNumbers();
  renderProducts();
  renderCoupons();
  renderProviderFilters();
};

const updateStats = () => {
  statJoined.textContent = parsedNumbers.length;
  statProducts.textContent = parsedProducts.filter((p) => p.type === 'product').length;
  statCoupons.textContent = parsedProducts.filter((p) => p.type === 'coupon').length;
  statStatus.textContent = `Registrado localmente`;
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
  setTimeout(() => statusToast.classList.add('hidden'), 5000);
};

const sendScrapeRequest = (targetUrl) =>
  new Promise((resolve, reject) => {
    addLog('Enviando solicitação de raspagem para: ' + targetUrl, 'info');
    chrome.runtime.sendMessage({ action: 'scrapeProduct', url: targetUrl }, (response) => {
      if (chrome.runtime.lastError) {
        const msg = chrome.runtime.lastError.message;
        addLog('Erro de comunicação com background: ' + msg, 'error');
        reject(new Error(msg));
        return;
      }
      if (!response?.success) {
        const errMsg = response?.error ?? 'Erro de rede ou timeout';
        addLog('Falha na raspagem de metadados: ' + errMsg, 'error');
        reject(new Error(errMsg));
        return;
      }
      addLog(`Dados recuperados com sucesso!`, 'success');
      resolve(response.data);
    });
  });

const handleFile = (file) => {
  addLog('Lendo dump de chat: ' + file.name, 'info');
  const reader = new FileReader();
  reader.onload = (e) => {
    addLog('Arquivo carregado com sucesso', 'success');
    processText(e.target.result);
  };
  reader.onerror = () => {
    addLog('Erro ao ler arquivo', 'error');
    showToast('Erro de leitura do arquivo', true);
  };
  reader.readAsText(file);
};

const processText = (text) => {
  addLog('Processando entradas do grupo...', 'info');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const joinedLines = lines.filter(
    (line) =>
      line.includes('entrou usando') ||
      line.includes('foi adicionado') ||
      (line.includes('entrou') && !line.includes(':'))
  );

  const newNumbers = [];
  joinedLines.forEach((line) => {
    const parts = line.split(' - ');
    if (parts.length < 2) return;
    const actionPart = parts[1];
    const match = actionPart.match(/(\+55\s?\d{2,3}\s?\d{4,5}[-\s]?\d{4})/);
    if (!match) return;
    const original = match[1].replace(/[\u200e\u200f\u202a-\u202e]/g, '').trim();
    const clean = original.replace(/[-\s]/g, '');
    const ddd = original.substring(4, 6).trim();

    const isDuplicate =
      parsedNumbers.some((item) => item.clean === clean) ||
      newNumbers.some((item) => item.clean === clean);

    if (!isDuplicate) {
      newNumbers.push({ original, clean, ddd, line: line.trim() });
    }
  });

  const rawBlocks = text.split(/(?=\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} - )/g);
  const newOffers = [];

  rawBlocks.forEach((block) => {
    const blockLines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (blockLines.length === 0) return;

    const urlRegex = /(https?:\/\/[^\s]+)/;
    const hasUrl = blockLines.some((line) => urlRegex.test(line));
    if (!hasUrl) return;

    const headerLine = blockLines[0];
    const headerMatch = headerLine.match(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} - [^:]+:\s*(.*)/);
    const headline = headerMatch ? headerMatch[1].trim() : '';

    const urls = [];
    blockLines.forEach((line) => {
      const match = line.match(urlRegex);
      if (match) {
        urls.push(match[1]);
      }
    });

    if (urls.length === 0) return;

    const bodyLines = blockLines.slice(1).filter((line) => !urlRegex.test(line));
    const priceRegex = /(De\s+R\$|R\$|por\s+R\$|cupom|código|desconto)/i;
    const possibleTitles = bodyLines.filter((line) => !priceRegex.test(line));
    const title = possibleTitles[0] ?? headline ?? 'Sem título';
    const priceLine = bodyLines.find((line) => priceRegex.test(line)) ?? '';

    const blockText = blockLines.join(' ').toLowerCase();
    const isCoupon =
      blockText.includes('cupom') ||
      blockText.includes('coupon') ||
      blockText.includes('código') ||
      blockText.includes('codigo') ||
      blockText.includes('desconto');

    const providerObj = getProvider(urls[0]);

    const isDuplicate =
      parsedProducts.some((item) => item.link === urls[0]) ||
      newOffers.some((item) => item.link === urls[0]);

    if (!isDuplicate) {
      newOffers.push({
        id: crypto.randomUUID(),
        headline,
        title,
        price: priceLine,
        link: urls[0],
        categorized: null,
        isAnalyzing: false,
        error: null,
        type: isCoupon ? 'coupon' : 'product',
        provider: providerObj.name
      });
    }
  });

  const numbersAdded = newNumbers.length;
  const offersAdded = newOffers.length;

  parsedNumbers = [...parsedNumbers, ...newNumbers];
  parsedProducts = [...parsedProducts, ...newOffers];

  setStorage('wp_parser_numbers', parsedNumbers);
  setStorage('wp_parser_products', parsedProducts);

  addLog(`Novos contatos adicionados (rejeitando duplicados): ${numbersAdded}`, 'success');
  addLog(`Novas ofertas/cupons adicionados (rejeitando duplicados): ${offersAdded}`, 'success');

  updateStats();
  renderNumbers();
  renderProducts();
  renderCoupons();
  renderProviderFilters();

  dropZoneContainer.classList.add('hidden');
  showToast(`Importação finalizada! +${numbersAdded} Contatos, +${offersAdded} Ofertas/Cupons`, false);
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
  const onlyProducts = parsedProducts.filter((item) => item.type === 'product');

  const filtered = onlyProducts.filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(query) ||
      item.link.toLowerCase().includes(query) ||
      (item.categorized?.brand && item.categorized.brand.toLowerCase().includes(query));

    if (selectedProviderFilter === 'Todos') return matchesQuery;
    return matchesQuery && item.provider === selectedProviderFilter;
  });

  if (filtered.length === 0) {
    productsGrid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500 space-y-2">
        <p class="text-sm font-medium">Nenhum produto cadastrado ou correspondente ao filtro</p>
      </div>`;
    return;
  }

  productsGrid.innerHTML = filtered
    .map((item) => {
      const providerInfo = Object.values(providers).find((p) => p.name === item.provider) ?? providers.default;
      const parsedCat = item.categorized;
      return `
      <div class="bg-slate-900/40 border border-slate-900 p-5 rounded-xl flex flex-col justify-between gap-4 hover:border-slate-800 transition-all duration-300">
        <div class="space-y-1.5">
          <div class="flex items-center justify-between gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${providerInfo.badge} uppercase tracking-wider">${item.provider}</span>
            ${parsedCat?.store ? `<span class="text-[10px] font-mono text-slate-500">${parsedCat.store}</span>` : ''}
          </div>
          <h3 class="font-semibold text-slate-200 line-clamp-2 leading-relaxed text-sm">${parsedCat?.title || item.title}</h3>
          ${item.price && !parsedCat?.price ? `<p class="text-xs text-slate-400 font-mono">${item.price}</p>` : ''}
          ${
            parsedCat?.breadcrumbsWithLinks?.length > 0
              ? `<div class="flex items-center flex-wrap gap-1 text-[9px] text-slate-400 bg-slate-950/50 px-2 py-1 rounded border border-slate-900/60 mt-1">
                  ${parsedCat.breadcrumbsWithLinks
                    .map((b) => `<span class="${b.mainCategory ? 'text-violet-400 font-semibold' : ''}">${b.name}</span>`)
                    .join(' &gt; ')}
                </div>`
              : ''
          }
          ${parsedCat?.description ? `<p class="text-xs text-slate-500 line-clamp-2">${parsedCat.description}</p>` : ''}
        </div>
        <div class="pt-2 flex items-center justify-between gap-2 border-t border-slate-900/60 mt-2 text-xs">
          <div>
            ${parsedCat?.price ? `<p class="text-emerald-400 font-mono font-bold">${parsedCat.price}</p>` : `<p class="text-slate-500 italic">Sem scraping</p>`}
          </div>
          <div class="flex items-center gap-2">
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 transition-colors">
              Link
            </a>
            <button data-analyze-id="${item.id}" class="text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 px-2 py-1 rounded border border-violet-500/20 transition-all text-[11px]">
              Scrape
            </button>
          </div>
        </div>
      </div>`;
    })
    .join('');
};

const renderCoupons = () => {
  const query = searchCoupons.value.toLowerCase();
  const onlyCoupons = parsedProducts.filter((item) => item.type === 'coupon');

  const filtered = onlyCoupons.filter(
    (item) => item.title.toLowerCase().includes(query) || item.link.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    couponsGrid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500">
        <p class="text-sm">Nenhum cupom ou promoção cadastrada</p>
      </div>`;
    return;
  }

  couponsGrid.innerHTML = filtered
    .map((item) => {
      const providerInfo = Object.values(providers).find((p) => p.name === item.provider) ?? providers.default;
      return `
      <div class="bg-amber-500/5 border border-amber-500/10 p-5 rounded-xl flex flex-col justify-between gap-3 hover:border-amber-500/25 transition-all">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/30 text-amber-400 uppercase bg-amber-500/10">Cupom / Promoção</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${providerInfo.badge} uppercase">${item.provider}</span>
          </div>
          <p class="text-sm font-medium text-slate-200 leading-relaxed">${item.title}</p>
          ${item.price ? `<p class="text-xs text-amber-300 bg-amber-500/10 px-2 py-1 rounded inline-block font-mono font-semibold">${item.price}</p>` : ''}
        </div>
        <div class="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-mono truncate max-w-[200px]">${item.link}</span>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="text-amber-400 font-bold hover:text-amber-300 transition-colors">
            Aproveitar &rarr;
          </a>
        </div>
      </div>`;
    })
    .join('');
};

const renderProviderFilters = () => {
  const onlyProducts = parsedProducts.filter((p) => p.type === 'product');
  const foundProviders = new Set(onlyProducts.map((p) => p.provider));
  const filterList = ['Todos', ...Array.from(foundProviders)];

  providerFilterContainer.innerHTML = filterList
    .map((prov) => {
      const isActive = selectedProviderFilter === prov;
      const cls = isActive
        ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
        : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 text-slate-400';
      return `<button data-filter-prov="${prov}" class="px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${cls}">${prov}</button>`;
    })
    .join('');
};

const setProviderFilter = (prov) => {
  selectedProviderFilter = prov;
  renderProviderFilters();
  renderProducts();
};

const analyzeSingleProduct = async (id) => {
  const product = parsedProducts.find((p) => p.id === id);
  if (!product) return;

  product.isAnalyzing = true;
  addLog('Iniciando raspagem individual para: "' + product.title + '"', 'info');
  showToast('Iniciando raspagem...', false);

  try {
    const analysis = await sendScrapeRequest(product.link);
    product.categorized = analysis;
    product.error = null;
    addLog('Sucesso na extração dos dados web de: ' + product.title, 'success');
  } catch (e) {
    product.error = e.message;
    addLog('Falha na extração de: "' + product.title + '" | ' + e.message, 'error');
    showToast('Erro ao raspar dados da URL', true);
  } finally {
    product.isAnalyzing = false;
    setStorage('wp_parser_products', parsedProducts);
    renderProducts();
  }
};

btnToggleImport.addEventListener('click', () => {
  dropZoneContainer.classList.toggle('hidden');
});

btnToggleConsole.addEventListener('click', () => {
  terminalSection.classList.toggle('hidden');
});

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('border-emerald-500', 'bg-emerald-500/10');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('border-emerald-500', 'bg-emerald-500/10');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('border-emerald-500', 'bg-emerald-500/10');
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

providerFilterContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-filter-prov]');
  if (btn) {
    setProviderFilter(btn.dataset.filterProv);
  }
});

searchNumbers.addEventListener('input', renderNumbers);
searchProducts.addEventListener('input', renderProducts);
searchCoupons.addEventListener('input', renderCoupons);

tabBtnJoined.addEventListener('click', () => {
  tabBtnJoined.className = 'border-b-2 border-emerald-500 text-emerald-400 pb-3 font-semibold text-sm transition-all';
  tabBtnProducts.className = 'border-b-2 border-transparent text-slate-400 hover:text-slate-300 pb-3 font-semibold text-sm transition-all';
  tabBtnCoupons.className = 'border-b-2 border-transparent text-slate-400 hover:text-slate-300 pb-3 font-semibold text-sm transition-all';
  tabContentJoined.classList.remove('hidden');
  tabContentProducts.classList.add('hidden');
  tabContentCoupons.classList.add('hidden');
});

tabBtnProducts.addEventListener('click', () => {
  tabBtnProducts.className = 'border-b-2 border-blue-500 text-blue-400 pb-3 font-semibold text-sm transition-all';
  tabBtnJoined.className = 'border-b-2 border-transparent text-slate-400 hover:text-slate-300 pb-3 font-semibold text-sm transition-all';
  tabBtnCoupons.className = 'border-b-2 border-transparent text-slate-400 hover:text-slate-300 pb-3 font-semibold text-sm transition-all';
  tabContentProducts.classList.remove('hidden');
  tabContentJoined.classList.add('hidden');
  tabContentCoupons.classList.add('hidden');
});

tabBtnCoupons.addEventListener('click', () => {
  tabBtnCoupons.className = 'border-b-2 border-amber-500 text-amber-400 pb-3 font-semibold text-sm transition-all';
  tabBtnJoined.className = 'border-b-2 border-transparent text-slate-400 hover:text-slate-300 pb-3 font-semibold text-sm transition-all';
  tabBtnProducts.className = 'border-b-2 border-transparent text-slate-400 hover:text-slate-300 pb-3 font-semibold text-sm transition-all';
  tabContentCoupons.classList.remove('hidden');
  tabContentJoined.classList.add('hidden');
  tabContentProducts.classList.add('hidden');
});

copyNumbersBtn.addEventListener('click', () => {
  const text = parsedNumbers.map((item) => item.clean).join('\n');
  navigator.clipboard.writeText(text).then(() => {
    addLog('Cópia de ' + parsedNumbers.length + ' contatos realizada!', 'success');
    showToast('Números limpos copiados para o Clipboard!', false);
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
});

exportNumbersCsvBtn.addEventListener('click', () => {
  const rows = [
    ['DDD', 'Numero Original', 'Numero Limpo', 'Mensagem Original'],
    ...parsedNumbers.map((item) => [item.ddd, item.original, item.clean, item.line])
  ];
  downloadBlob(buildCsv(rows), 'numeros_whatsapp.csv', 'text/csv;charset=utf-8');
});

exportProductsBtn.addEventListener('click', () => {
  const rows = [
    ['Provedor', 'Título', 'Link', 'Preço Whatsapp', 'Preço Scrapeado'],
    ...parsedProducts
      .filter((p) => p.type === 'product')
      .map((p) => [p.provider, p.title, p.link, p.price || '', p.categorized?.price || ''])
  ];
  downloadBlob(buildCsv(rows), 'produtos_whatsapp.csv', 'text/csv;charset=utf-8');
});

clearNumbersBtn.addEventListener('click', () => {
  parsedNumbers = [];
  setStorage('wp_parser_numbers', []);
  updateStats();
  renderNumbers();
  showToast('Banco de contatos limpo!', false);
});

clearProductsBtn.addEventListener('click', () => {
  parsedProducts = parsedProducts.filter((p) => p.type !== 'product');
  setStorage('wp_parser_products', parsedProducts);
  updateStats();
  renderProducts();
  renderProviderFilters();
  showToast('Banco de produtos limpo!', false);
});

clearCouponsBtn.addEventListener('click', () => {
  parsedProducts = parsedProducts.filter((p) => p.type !== 'coupon');
  setStorage('wp_parser_products', parsedProducts);
  updateStats();
  renderCoupons();
  showToast('Banco de cupons limpo!', false);
});

btnAnalyzeAll.addEventListener('click', async () => {
  const onlyProducts = parsedProducts.filter((p) => p.type === 'product');
  const queue = onlyProducts.filter((p) => !p.categorized && p.provider === 'Mercado Livre');
  if (queue.length === 0) {
    addLog('Sem novos produtos do Mercado Livre para análise.', 'warning');
    showToast('Sem produtos novos compatíveis com Scrape automático!', false);
    return;
  }

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

    try {
      const analysis = await sendScrapeRequest(product.link);
      product.categorized = analysis;
      product.error = null;
    } catch (e) {
      product.error = e.message;
    }

    setStorage('wp_parser_products', parsedProducts);
    renderProducts();
  }

  btnAnalyzeAll.disabled = false;
  spinAnalyzeAll.classList.add('hidden');
  analysisProgressContainer.classList.add('hidden');
  showToast('Mapeamento finalizado!', false);
});

loadInitialState();