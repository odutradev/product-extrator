import type { PhoneNumber, Product } from '../store/types'

export const parseWhatsAppDump = (text: string): { numbers: PhoneNumber[], products: Product[] } => {
  const lines = text.split(/\r?\n/).filter(Boolean)
  const timestampRegex = /^(?:\u200E|\u200F)*\[?\d{1,2}[./-]\d{1,2}[./-]\d{2,4}[,.]?\s+\d{1,2}[:.]\d{2}(?::\d{2})?(?:\s?[aApP][mM])?\]?(?:\s*-\s*|\s*:\s*|\s+)?/

  const cleanLines = lines.map((line) => ({
    originalLine: line,
    textWithoutTimestamp: line.replace(timestampRegex, '').trim()
  }))

  const joinedLines = cleanLines.filter(({ textWithoutTimestamp }) => {
    if (textWithoutTimestamp.includes(':')) return false
    return ['entrou', 'adicionado', 'adicionou'].some((keyword) => textWithoutTimestamp.includes(keyword))
  })

  const rawNumbers = joinedLines.reduce<PhoneNumber[]>((acc, { originalLine, textWithoutTimestamp }) => {
    const match = textWithoutTimestamp.match(/(\+55\s?\d{2,3}\s?\d{4,5}[-\s]?\d{4})/)
    if (!match) return acc

    const original = match[1].replace(/[\u200e\u200f\u202a-\u202e]/g, '').trim()
    const clean = original.replace(/[-\s]/g, '')
    const ddd = clean.startsWith('+55') ? clean.substring(3, 5) : clean.substring(0, 2)
    
    return [...acc, { original, clean, ddd, line: originalLine.trim() }]
  }, [])

  const uniqueNumbers = Array.from(new Map(rawNumbers.map((item) => [item.clean, item])).values())

  return {
    numbers: uniqueNumbers,
    products: []
  }
}