type AnalyticsEvent = Record<string, string> & {event: string};
type Gtag = (command: 'event', eventName: string, parameters: Record<string, string>) => void;

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;
  const analyticsWindow = window as Window & {gtag?: Gtag};
  const {event: eventName, ...parameters} = event;
  analyticsWindow.gtag?.('event', eventName, parameters);
}
