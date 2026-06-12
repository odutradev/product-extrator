import type { CategorizedData } from '../store/types'

const TIMEOUT_MS = 30000
const POST_LOAD_DELAY_MS = 2500

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForTabComplete = (tabId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timerId = setTimeout(() => {
      reject(new Error('Timeout'))
    }, TIMEOUT_MS)

    const listener = (id: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (id !== tabId || changeInfo.status !== 'complete') return
      clearTimeout(timerId)
      chrome.tabs.onUpdated.removeListener(listener)
      resolve()
    }

    chrome.tabs.onUpdated.addListener(listener)
  })
}

const extractAffiliateLinkFromPage = async (tabId: number): Promise<string | null> => {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const actionLink = document.querySelector<HTMLAnchorElement>(
        'a.poly-component__link--action-link, a.poly-component__link[href*="mercadolivre.com.br/MLB"]'
      )
      
      if (actionLink?.href) return actionLink.href

      const productLinks = [...document.querySelectorAll<HTMLAnchorElement>('a[href*="mercadolivre.com.br/MLB"]')]
      
      return productLinks[0]?.href ?? null
    }
  })

  return result?.result ?? null
}

const scrapeProductData = async (tabId: number): Promise<CategorizedData | null> => {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const breadcrumbAnchors = [...document.querySelectorAll<HTMLAnchorElement>('.andes-breadcrumb__link')]
      
      let breadcrumbsWithLinks = breadcrumbAnchors.map((anchor, index, arr) => ({
        name: anchor.getAttribute('title') ?? anchor.textContent?.trim() ?? '',
        url: anchor.href,
        mainCategory: index === arr.length - 1
      }))

      if (breadcrumbsWithLinks.length === 0) {
        breadcrumbsWithLinks = [
          {
            name: 'E-commerce',
            url: '#',
            mainCategory: true
          }
        ]
      }

      const titleEl = document.querySelector('h1.ui-pdp-title, h1[class*="title"]')
      const title = titleEl?.textContent?.trim() ?? document.title

      const priceIntEl = document.querySelector('.ui-pdp-price__second-line .andes-money-amount__fraction, .andes-money-amount__fraction')
      const priceCentsEl = document.querySelector('.ui-pdp-price__second-line .andes-money-amount__cents, .andes-money-amount__cents')
      const price = priceIntEl ? `R$ ${priceIntEl.textContent?.trim()}${priceCentsEl ? `,${priceCentsEl.textContent?.trim()}` : ''}` : null

      const specRows = [...document.querySelectorAll('.andes-table__row, .ui-pdp-specs__item')]
      const brandRow = specRows.find((row) => row.textContent?.toLowerCase().includes('marca'))
      const brand = brandRow?.querySelector('.andes-table__column--value, td:last-child')?.textContent?.trim() ?? null

      const storeEl = document.querySelector('.ui-pdp-seller__header-title, .seller-info__title, [class*="seller-name"]')
      const store = storeEl?.textContent?.trim() ?? 'Mercado Livre'

      const descEl = document.querySelector('.ui-pdp-description__content')
      const description = descEl?.textContent?.trim().slice(0, 220) ?? ''

      return {
        title,
        price,
        brand,
        store,
        description,
        breadcrumbsWithLinks
      }
    }
  })

  return result?.result as CategorizedData | null
}

const resolveProductUrl = async (tabId: number): Promise<string | null> => {
  const tab = await chrome.tabs.get(tabId)
  const currentUrl = tab.url ?? ''

  const isAlreadyProductPage = currentUrl.includes('mercadolivre.com.br/MLB') || currentUrl.includes('/p/MLB') || currentUrl.includes('produto.mercadolivre.com.br')
  
  if (isAlreadyProductPage) return null

  return extractAffiliateLinkFromPage(tabId)
}

export const scrapeProductFromUrl = async (affiliateUrl: string) => {
  let tabId: number | null = null

  try {
    const tab = await chrome.tabs.create({ url: affiliateUrl, active: false })
    if (!tab.id) throw new Error('Não foi possível criar a aba')
    
    tabId = tab.id
    await waitForTabComplete(tabId)

    const productUrl = await resolveProductUrl(tabId)

    if (productUrl) {
      await chrome.tabs.update(tabId, { url: productUrl })
      await waitForTabComplete(tabId)
    }

    await sleep(POST_LOAD_DELAY_MS)

    const data = await scrapeProductData(tabId)
    if (!data) throw new Error('Nenhum dado extraído da página do produto')

    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  } finally {
    if (tabId !== null) {
      chrome.tabs.remove(tabId).catch(() => {})
    }
  }
}