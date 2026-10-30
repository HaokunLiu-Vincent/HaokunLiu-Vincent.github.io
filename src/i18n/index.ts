import { en } from './en';
import { zh } from './zh';
import type { Locale, Page } from './types';

export const locales: Locale[] = ['en', 'zh'];
export const dictionaries = { en, zh };
export const htmlLang = { en: 'en', zh: 'zh-CN' } as const;
export const ogLocale = { en: 'en_US', zh: 'zh_CN' } as const;
export const pagePaths: Record<Page, string> = {
  home: '', projects: 'projects/', about: 'about/', contact: 'contact/',
  caseStudy: 'projects/agentic-commerce/',
  pipelineStudy: 'projects/recommendation-pipeline/',
};
export function route(locale: Locale, page: Page = 'home') {
  return `/${locale}/${pagePaths[page]}`;
}
export function absolute(site: URL | undefined, path: string) {
  if (!site) throw new Error('Astro site URL must be configured.');
  return new URL(path, site).href;
}
