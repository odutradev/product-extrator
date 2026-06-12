import { useState, useMemo, useCallback } from 'react'

import { parseWhatsAppDump } from '../services/whatsappParser'
import { useAppStore } from '../store/appStore'

import type { CategorizedData } from '../store/types'

export const useWhatsAppActions = () => {
  const { parsedNumbers, parsedProducts, addLog, setParsedData, toggleImport, removeProduct: removeProductFromStore } = useAppStore()

  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 })

  const handleImportText = useCallback((content: string) => {
    const { numbers: newNumbers, products: newProducts } = parseWhatsAppDump(content)

    const mergedNumbers = Array.from(new Map([...parsedNumbers, ...newNumbers].map((item) => [item.clean, item])).values())
    const mergedProducts = Array.from(new Map([...parsedProducts, ...newProducts].map((item) => [item.link, item])).values())

    setParsedData(mergedNumbers, mergedProducts)
    addLog(`Importação concluída: ${newNumbers.length} contatos, ${newProducts.length} itens processados.`)
    toggleImport()
  }, [parsedNumbers, parsedProducts, setParsedData, addLog, toggleImport])

  const downloadBlob = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  const buildCsv = useCallback((rows: (string | number)[][]) => {
    return '\ufeff' + rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n')
  }, [])

  const copyNumbersToClipboard = useCallback(async () => {
    const text = parsedNumbers.map((item) => item.clean).join('\n')
    await navigator.clipboard.writeText(text)
    addLog(`Cópia de ${parsedNumbers.length} contatos realizada com sucesso`)
  }, [parsedNumbers, addLog])

  const exportNumbersTxt = useCallback(() => {
    const content = parsedNumbers.map((item) => item.clean).join('\n')
    downloadBlob(content, 'numeros_whatsapp.txt', 'text/plain;charset=utf-8')
    addLog('Arquivo TXT de contatos exportado')
  }, [parsedNumbers, downloadBlob, addLog])

  const exportNumbersCsv = useCallback(() => {
    const rows = [
      ['DDD', 'Numero Original', 'Numero Limpo', 'Mensagem Original'],
      ...parsedNumbers.map((item) => [item.ddd, item.original, item.clean, item.line])
    ]
    downloadBlob(buildCsv(rows), 'numeros_whatsapp.csv', 'text/csv;charset=utf-8')
    addLog('Arquivo CSV de contatos exportado')
  }, [parsedNumbers, downloadBlob, buildCsv, addLog])

  const exportProductsCsv = useCallback(() => {
    const rows = [
      ['Provedor', 'Título', 'Link', 'Preço Whatsapp', 'Preço Scrapeado'],
      ...parsedProducts
        .filter((p) => p.type === 'product')
        .map((p) => [p.provider, p.title, p.link, p.price || '', p.categorized?.price || ''])
    ]
    downloadBlob(buildCsv(rows), 'produtos_whatsapp.csv', 'text/csv;charset=utf-8')
    addLog('Arquivo CSV de produtos exportado')
  }, [parsedProducts, downloadBlob, buildCsv, addLog])

  const copyProductToClipboard = useCallback(async (id: string) => {
    const product = parsedProducts.find((p) => p.id === id)
    if (!product) return
    await navigator.clipboard.writeText(JSON.stringify(product, null, 2))
    addLog(`Objeto copiado: "${product.title}"`)
  }, [parsedProducts, addLog])

  const clearNumbers = useCallback(() => {
    setParsedData([], parsedProducts)
    addLog('Banco de contatos limpo')
  }, [parsedProducts, setParsedData, addLog])

  const clearProducts = useCallback(() => {
    const nonProducts = parsedProducts.filter((p) => p.type !== 'product')
    setParsedData(parsedNumbers, nonProducts)
    addLog('Banco de produtos limpo')
  }, [parsedNumbers, parsedProducts, setParsedData, addLog])

  const clearCoupons = useCallback(() => {
    const nonCoupons = parsedProducts.filter((p) => p.type !== 'coupon')
    setParsedData(parsedNumbers, nonCoupons)
    addLog('Banco de cupons limpo')
  }, [parsedNumbers, parsedProducts, setParsedData, addLog])

  const removeProduct = useCallback((id: string) => {
    const product = parsedProducts.find((p) => p.id === id)
    removeProductFromStore(id)
    if (product) addLog(`Produto removido: "${product.title}"`)
  }, [parsedProducts, removeProductFromStore, addLog])

  const sendScrapeRequest = useCallback((targetUrl: string): Promise<CategorizedData> => {
    return new Promise((resolve, reject) => {
      addLog(`Enviando solicitação de raspagem para: ${targetUrl}`)

      chrome.runtime.sendMessage({ action: 'scrapeProduct', url: targetUrl }, (response) => {
        if (chrome.runtime.lastError) {
          const msg = chrome.runtime.lastError.message
          addLog(`Erro de comunicação com background: ${msg}`)
          return reject(new Error(msg))
        }

        if (!response?.success) {
          const errMsg = response?.error ?? 'Erro de rede ou timeout'
          addLog(`Falha na raspagem: ${errMsg}`)
          return reject(new Error(errMsg))
        }

        addLog('Dados recuperados com sucesso!')
        resolve(response.data)
      })
    })
  }, [addLog])

  const analyzeSingleProduct = useCallback(async (id: string) => {
    const currentProducts = useAppStore.getState().parsedProducts
    const product = currentProducts.find((p) => p.id === id)

    if (!product) return

    const updatedProducts = currentProducts.map((p) =>
      p.id === id ? { ...p, isScraping: true } : p
    )
    setParsedData(useAppStore.getState().parsedNumbers, updatedProducts)
    addLog(`Iniciando raspagem individual para: "${product.title}"`)

    try {
      const analysis = await sendScrapeRequest(product.link)
      const freshProducts = useAppStore.getState().parsedProducts
      const finalProducts = freshProducts.map((p) =>
        p.id === id ? { ...p, categorized: analysis, error: null, isScraping: false, isAnalyzing: true } : p
      )
      setParsedData(useAppStore.getState().parsedNumbers, finalProducts)
      addLog(`Sucesso na extração de: ${product.title}`)
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      const freshProducts = useAppStore.getState().parsedProducts
      const finalProducts = freshProducts.map((p) =>
        p.id === id ? { ...p, error: errorMsg, isScraping: false, isAnalyzing: false } : p
      )
      setParsedData(useAppStore.getState().parsedNumbers, finalProducts)
      addLog(`Falha na extração de: "${product.title}" | ${errorMsg}`)
    }
  }, [setParsedData, addLog, sendScrapeRequest])

  const analyzeAllProducts = useCallback(async () => {
    const currentProducts = useAppStore.getState().parsedProducts
    const queue = currentProducts.filter((p) => p.type === 'product' && !p.categorized && p.provider === 'Mercado Livre')

    if (queue.length === 0) {
      addLog('Sem novos produtos compatíveis para análise')
      return
    }

    setIsAnalyzingAll(true)
    setAnalysisProgress({ current: 0, total: queue.length })

    for (let i = 0; i < queue.length; i++) {
      const product = queue[i]
      setAnalysisProgress({ current: i + 1, total: queue.length })

      const freshProductsBefore = useAppStore.getState().parsedProducts
      const productsWithLoading = freshProductsBefore.map((p) =>
        p.id === product.id ? { ...p, isScraping: true } : p
      )
      setParsedData(useAppStore.getState().parsedNumbers, productsWithLoading)

      try {
        const analysis = await sendScrapeRequest(product.link)
        const freshProductsAfter = useAppStore.getState().parsedProducts
        const productsWithSuccess = freshProductsAfter.map((p) =>
          p.id === product.id ? { ...p, categorized: analysis, error: null, isScraping: false, isAnalyzing: true } : p
        )
        setParsedData(useAppStore.getState().parsedNumbers, productsWithSuccess)
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e)
        const freshProductsAfter = useAppStore.getState().parsedProducts
        const productsWithError = freshProductsAfter.map((p) =>
          p.id === product.id ? { ...p, error: errorMsg, isScraping: false, isAnalyzing: false } : p
        )
        setParsedData(useAppStore.getState().parsedNumbers, productsWithError)
      }
    }

    setIsAnalyzingAll(false)
    addLog('Mapeamento em lote finalizado!')
  }, [setParsedData, addLog, sendScrapeRequest])

  const parsePrice = useCallback((priceStr: string | null | undefined): number => {
    if (!priceStr) return 0
    const saleMatch = priceStr.match(/por\s+R\$\s*([\d.]+,\d{2})/i)
    if (saleMatch) {
      const normalized = saleMatch[1].replace(/\./g, '').replace(',', '.')
      const val = parseFloat(normalized)
      return isNaN(val) ? 0 : val
    }
    const firstMatch = priceStr.match(/R\$\s*([\d.]+,\d{2})/)
    if (!firstMatch) return 0
    const normalized = firstMatch[1].replace(/\./g, '').replace(',', '.')
    const val = parseFloat(normalized)
    return isNaN(val) ? 0 : val
  }, [])

  const dashboardStats = useMemo(() => {
    const products = parsedProducts.filter((p) => p.type === 'product')
    const totalCount = products.length

    let totalScrapeCount = 0
    let totalPriceSum = 0
    let pricedCount = 0

    const storeCounts: Record<string, number> = {}
    const storePrices: Record<string, { total: number; count: number }> = {}
    const generalCategories: Record<string, number> = {}
    const mainCategories: Record<string, number> = {}

    const priceRanges = {
      'Até R$50': 0,
      'R$50 - R$150': 0,
      'R$150 - R$500': 0,
      'R$500 - R$1.500': 0,
      'Mais de R$1.500': 0
    }

    products.forEach((p) => {
      const store = p.provider || 'Outros'
      storeCounts[store] = (storeCounts[store] || 0) + 1

      const actualPriceStr = p.categorized?.price ?? p.price
      const priceVal = parsePrice(actualPriceStr)

      if (priceVal > 0) {
        totalPriceSum += priceVal
        pricedCount++

        if (!storePrices[store]) {
          storePrices[store] = { total: 0, count: 0 }
        }

        storePrices[store].total += priceVal
        storePrices[store].count++

        if (priceVal <= 50) {
          priceRanges['Até R$50']++
        } else if (priceVal <= 150) {
          priceRanges['R$50 - R$150']++
        } else if (priceVal <= 500) {
          priceRanges['R$150 - R$500']++
        } else if (priceVal <= 1500) {
          priceRanges['R$500 - R$1.500']++
        } else {
          priceRanges['Mais de R$1.500']++
        }
      }

      if (p.categorized) {
        totalScrapeCount++
        const breadcrumbs = p.categorized.breadcrumbsWithLinks ?? []

        if (breadcrumbs.length > 0) {
          const genCat = breadcrumbs[0]?.name
          const mainCat = breadcrumbs[breadcrumbs.length - 1]?.name

          if (genCat) generalCategories[genCat] = (generalCategories[genCat] || 0) + 1
          if (mainCat) mainCategories[mainCat] = (mainCategories[mainCat] || 0) + 1
        }
      }
    })

    const avgGeneral = pricedCount > 0 ? totalPriceSum / pricedCount : 0

    let dominantStore = '-'
    let dominantCount = 0

    Object.entries(storeCounts).forEach(([store, count]) => {
      if (count > dominantCount) {
        dominantCount = count
        dominantStore = store
      }
    })

    return {
      totalCount,
      totalScrapeCount,
      avgGeneral,
      pricedCount,
      dominantStore,
      dominantCount,
      storeCounts,
      storePrices,
      priceRanges,
      generalCategories,
      mainCategories
    }
  }, [parsedProducts, parsePrice])

  return {
    isAnalyzingAll,
    analysisProgress,
    dashboardStats,
    handleImportText,
    copyNumbersToClipboard,
    exportNumbersTxt,
    exportNumbersCsv,
    exportProductsCsv,
    copyProductToClipboard,
    clearNumbers,
    clearProducts,
    clearCoupons,
    removeProduct,
    analyzeSingleProduct,
    analyzeAllProducts
  }
}