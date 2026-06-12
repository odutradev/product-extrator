export interface Breadcrumb {
  name: string
  url: string
  mainCategory: boolean
}

export interface CategorizedData {
  title: string
  price: string | null
  brand: string | null
  store: string
  description: string
  breadcrumbsWithLinks: Breadcrumb[]
}

export interface Product {
  id: string
  headline: string
  title: string
  price: string
  link: string
  categorized: CategorizedData | null
  isAnalyzing: boolean
  error: string | null
  type: 'coupon' | 'product'
  provider: string
}

export interface PhoneNumber {
  original: string
  clean: string
  ddd: string
  line: string
}

export interface AppState {
  parsedNumbers: PhoneNumber[]
  parsedProducts: Product[]
  isImportOpen: boolean
  isConsoleOpen: boolean
  logs: string[]
  toggleImport: () => void
  toggleConsole: () => void
  addLog: (message: string) => void
  clearLogs: () => void
  setParsedData: (numbers: PhoneNumber[], products: Product[]) => void
  removeProduct: (id: string) => void
}
