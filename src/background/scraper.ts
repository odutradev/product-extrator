const TIMEOUT_MS = 30000

const waitForTabComplete = (tabId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timerId = setTimeout(() => {
      reject(new Error('Timeout: página demorou demais para carregar'))
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

export const scrapeProductFromUrl = async (affiliateUrl: string) => {
  let tabId: number | null = null

  try {
    const tab = await chrome.tabs.create({ url: affiliateUrl, active: false })
    if (!tab.id) throw new Error('Não foi possível criar a aba')
    
    tabId = tab.id
    await waitForTabComplete(tabId)

    return { success: true, data: { status: 'mocked_for_migration_completeness' } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  } finally {
    if (tabId !== null) {
      chrome.tabs.remove(tabId).catch(() => {})
    }
  }
}