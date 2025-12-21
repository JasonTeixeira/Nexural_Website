declare module '@alpacahq/alpaca-trade-api' {
  export default class Alpaca {
    constructor(config: any)
    getAccount(): Promise<any>
    getPositions(): Promise<any[]>
    getPosition(symbol: string): Promise<any>
    createOrder(order: any): Promise<any>
    getOrders(params?: any): Promise<any[]>
    getOrder(orderId: string): Promise<any>
    cancelOrder(orderId: string): Promise<any>
    cancelAllOrders(): Promise<any>
    getBars(symbol: string, params: any): Promise<any>
    getLastTrade(symbol: string): Promise<any>
    getLatestTrade(symbol: string): Promise<any>
    getLatestTrades(symbols: string[]): Promise<any>
    getClock(): Promise<any>
    getCalendar(params?: any): Promise<any>
    getAsset(symbol: string): Promise<any>
    getAssets(params?: any): Promise<any[]>
    getWatchlists(): Promise<any[]>
    createWatchlist(params: any): Promise<any>
    getPortfolioHistory(params?: any): Promise<any>
    [key: string]: any
  }
}
