declare module 'google-trends-api' {
    export function dailyTrends(options: { geo: string, date?: Date }): Promise<string>;
    export function interestOverTime(options: { keyword: string, startTime?: Date, endTime?: Date }): Promise<string>;
    export function realTimeTrends(options: { geo: string, category?: string }): Promise<string>;
    export function relatedQueries(options: { keyword: string, geo?: string, startTime?: Date, endTime?: Date }): Promise<string>;
}
