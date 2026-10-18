/** Match elt-ios: green purchases / non-negative net, red sales / negative net. */
export type TradeTypographyColor = 'success' | 'error'

export function netColor(net: number): TradeTypographyColor {
  return net < 0 ? 'error' : 'success'
}

export function transactionColor(code?: string | null): TradeTypographyColor {
  return code === 'S' ? 'error' : 'success'
}

export function paletteMain(kind: TradeTypographyColor): 'success.main' | 'error.main' {
  return kind === 'error' ? 'error.main' : 'success.main'
}
