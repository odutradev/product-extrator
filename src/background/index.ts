import { scrapeProductFromUrl } from './scraper'

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action !== 'scrapeProduct') return false
  
  scrapeProductFromUrl(message.url)
    .then(sendResponse)
    .catch((error) => sendResponse({ success: false, error: String(error) }))
    
  return true
})