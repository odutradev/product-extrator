import type { PhoneNumber, Product } from '../store/types'

const getProviderName = (url: string): string => {
  const lowercaseUrl = url.toLowerCase()
  
  if (lowercaseUrl.includes('mercadolivre.com') || lowercaseUrl.includes('meli.la') || lowercaseUrl.includes('mercadolibre')) {
    return 'Mercado Livre'
  }
  
  if (lowercaseUrl.includes('amazon.com') || lowercaseUrl.includes('amzn.to')) {
    return 'Amazon'
  }
  
  if (lowercaseUrl.includes('shopee.com') || lowercaseUrl.includes('shope.ee')) {
    return 'Shopee'
  }
  
  return 'Outros'
}

export const parseWhatsAppDump = (text: string): { numbers: PhoneNumber[], products: Product[] } => {
  const timestampRegex = /^(?:\u200E|\u200F)*\[?\d{1,2}[./-]\d{1,2}[./-]\d{2,4}[,.]?\s+\d{1,2}[:.]\d{2}(?::\d{2})?(?:\s?[aApP][mM])?\]?(?:\s*-\s*|\s*:\s*|\s+)?/
  const urlRegex = /(https?:\/\/[^\s]+)/
  const priceRegex = /(De\s+R\$|R\$|por\s+R\$|cupom|código|desconto)/i

  const lines = text.split(/\r?\n/).filter(Boolean)

  const cleanLines = lines.map((line) => ({
    originalLine: line,
    textWithoutTimestamp: line.replace(timestampRegex, '').trim()
  }))

  const joinedLines = cleanLines.filter(({ textWithoutTimestamp }) => {
    if (textWithoutTimestamp.includes(':')) {
      return false
    }
    return ['entrou', 'adicionado', 'adicionou'].some((keyword) => textWithoutTimestamp.includes(keyword))
  })

  const rawNumbers = joinedLines.reduce<PhoneNumber[]>((acc, { originalLine, textWithoutTimestamp }) => {
    const match = textWithoutTimestamp.match(/(\+55\s?\d{2,3}\s?\d{4,5}[-\s]?\d{4})/)
    
    if (!match) {
      return acc
    }

    const original = match[1].replace(/[\u200e\u200f\u202a-\u202e]/g, '').trim()
    const clean = original.replace(/[-\s]/g, '')
    const ddd = clean.startsWith('+55') ? clean.substring(3, 5) : clean.substring(0, 2)
    
    return [...acc, { original, clean, ddd, line: originalLine.trim() }]
  }, [])

  const uniqueNumbers = Array.from(new Map(rawNumbers.map((item) => [item.clean, item])).values())

  const rawBlocks = text.split(/(?=(?:\u200E|\u200F)*\[?\d{1,2}[./-]\d{1,2}[./-]\d{2,4}[,.]?\s+\d{1,2}[:.]\d{2})/)
  const blocks = rawBlocks.map((b) => b.trim()).filter(Boolean)

  const rawProducts = blocks.reduce<Product[]>((acc, block) => {
    const blockLines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    
    if (blockLines.length === 0) {
      return acc
    }

    const hasUrl = blockLines.some((line) => urlRegex.test(line))
    
    if (!hasUrl) {
      return acc
    }

    const headerLine = blockLines[0]
    const textWithoutTimestamp = headerLine.replace(timestampRegex, '').trim()
    const colonIndex = textWithoutTimestamp.indexOf(':')
    
    const headline = colonIndex !== -1 
      ? textWithoutTimestamp.substring(colonIndex + 1).trim() 
      : textWithoutTimestamp

    const urls = blockLines.reduce<string[]>((urlAcc, line) => {
      const matches = line.match(/(https?:\/\/[^\s]+)/g)
      if (!matches) {
        return urlAcc
      }
      const cleanUrls = matches.map((url) => url.replace(/[)"';,.\x00-\x1F\x7F<>\[\]]$/, ''))
      return [...urlAcc, ...cleanUrls]
    }, [])

    if (urls.length === 0) {
      return acc
    }

    const bodyLines = blockLines.map((line, index) => {
      const cleanL = line.replace(timestampRegex, '').trim()
      if (index !== 0) {
        return cleanL
      }
      const cIndex = cleanL.indexOf(':')
      return cIndex !== -1 ? cleanL.substring(cIndex + 1).trim() : cleanL
    })

    const possibleTitles = bodyLines.filter((line) => {
      if (!line) return false
      if (urlRegex.test(line)) return false
      if (priceRegex.test(line)) return false
      return line.trim().length > 2
    })

    const title = possibleTitles[0] ?? headline ?? 'Sem título'
    const priceLine = bodyLines.find((line) => priceRegex.test(line)) ?? ''
    const blockText = blockLines.join(' ').toLowerCase()
    
    const isCoupon = blockText.includes('cupom') || 
      blockText.includes('coupon') || 
      blockText.includes('código') || 
      blockText.includes('codigo') || 
      blockText.includes('desconto')

    const providerName = getProviderName(urls[0])

    const newProduct: Product = {
      id: crypto.randomUUID(),
      headline,
      title,
      price: priceLine,
      link: urls[0] ?? '',
      categorized: null,
      isAnalyzing: false,
      error: null,
      type: isCoupon ? 'coupon' : 'product',
      provider: providerName
    }

    return [...acc, newProduct]
  }, [])

  const uniqueProducts = Array.from(new Map(rawProducts.map((item) => [item.link, item])).values())

  return {
    numbers: uniqueNumbers,
    products: uniqueProducts
  }
}