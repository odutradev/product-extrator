const TIMEOUT_MS = 30000;
const POST_LOAD_DELAY_MS = 2500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForTabComplete = (tabId) =>
  new Promise((resolve, reject) => {
    const timerId = setTimeout(
      () => reject(new Error('Timeout: página demorou demais para carregar')),
      TIMEOUT_MS
    );

    const listener = (id, changeInfo) => {
      if (id !== tabId || changeInfo.status !== 'complete') return;
      clearTimeout(timerId);
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    };

    chrome.tabs.onUpdated.addListener(listener);
  });

const extractAffiliateLinkFromPage = async (tabId) => {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const actionLink = document.querySelector(
        'a.poly-component__link--action-link, a.poly-component__link[href*="mercadolivre.com.br/MLB"]'
      );
      if (actionLink?.href) return actionLink.href;

      const productLinks = [...document.querySelectorAll('a[href*="mercadolivre.com.br/MLB"]')];
      return productLinks[0]?.href ?? null;
    }
  });

  return result?.result ?? null;
};

const scrapeProductData = async (tabId) => {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const breadcrumbAnchors = [...document.querySelectorAll('.andes-breadcrumb__link')];
      let breadcrumbsWithLinks = breadcrumbAnchors.map((anchor, index, arr) => ({
        name: anchor.getAttribute('title') ?? anchor.textContent.trim(),
        url: anchor.href,
        mainCategory: index === arr.length - 1
      }));

      if (breadcrumbsWithLinks.length === 0) {
        breadcrumbsWithLinks = [
          {
            name: 'E-commerce',
            url: '#',
            mainCategory: true
          }
        ];
      }

      const titleEl = document.querySelector('h1.ui-pdp-title, h1[class*="title"]');
      const title = titleEl?.textContent.trim() ?? document.title;

      const priceIntEl = document.querySelector('.andes-money-amount__fraction');
      const priceCentsEl = document.querySelector('.andes-money-amount__cents');
      const price = priceIntEl
        ? `R$ ${priceIntEl.textContent.trim()}${priceCentsEl ? `,${priceCentsEl.textContent.trim()}` : ''}`
        : null;

      const specRows = [...document.querySelectorAll('.andes-table__row, .ui-pdp-specs__item')];
      const brandRow = specRows.find((row) => row.textContent.toLowerCase().includes('marca'));
      const brand =
        brandRow?.querySelector('.andes-table__column--value, td:last-child')?.textContent.trim() ??
        null;

      const storeEl = document.querySelector(
        '.ui-pdp-seller__header-title, .seller-info__title, [class*="seller-name"]'
      );
      const store = storeEl?.textContent.trim() ?? 'Mercado Livre';

      const descEl = document.querySelector('.ui-pdp-description__content');
      const description = descEl?.textContent.trim().slice(0, 220) ?? '';

      const payload = {
        title,
        price,
        brand,
        store,
        description,
        breadcrumbsWithLinks
      };

      return payload;
    }
  });

  return result?.result ?? null;
};

const resolveProductUrl = async (tabId) => {
  const tab = await chrome.tabs.get(tabId);
  const currentUrl = tab.url ?? '';

  const isAlreadyProductPage =
    currentUrl.includes('mercadolivre.com.br/MLB') ||
    currentUrl.includes('produto.mercadolivre.com.br');

  if (isAlreadyProductPage) return null;

  return extractAffiliateLinkFromPage(tabId);
};

const scrapeProductFromUrl = async (affiliateUrl) => {
  let tabId = null;

  try {
    const tab = await chrome.tabs.create({ url: affiliateUrl, active: false });
    tabId = tab.id;
    await waitForTabComplete(tabId);

    const productUrl = await resolveProductUrl(tabId);

    if (productUrl) {
      await chrome.tabs.update(tabId, { url: productUrl });
      await waitForTabComplete(tabId);
    }

    await sleep(POST_LOAD_DELAY_MS);

    const data = await scrapeProductData(tabId);
    if (!data) throw new Error('Nenhum dado extraído da página do produto');

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    if (tabId !== null) chrome.tabs.remove(tabId).catch(() => {});
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== 'scrapeProduct') return false;
  scrapeProductFromUrl(message.url).then(sendResponse);
  return true;
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
});