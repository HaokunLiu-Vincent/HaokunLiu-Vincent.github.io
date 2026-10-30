import type { APIRoute } from 'astro';
import { absolute, htmlLang, locales, pagePaths, route } from '@/i18n';
import type { Page } from '@/i18n/types';

export const GET: APIRoute = ({ site }) => {
  const urls = (Object.keys(pagePaths) as Page[]).flatMap(page => locales.map(locale => {
    const alternatives = locales.map(language => `<xhtml:link rel="alternate" hreflang="${htmlLang[language]}" href="${absolute(site, route(language, page))}"/>`).join('');
    return `<url><loc>${absolute(site, route(locale, page))}</loc>${alternatives}<xhtml:link rel="alternate" hreflang="x-default" href="${absolute(site, route('en', page))}"/></url>`;
  })).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
