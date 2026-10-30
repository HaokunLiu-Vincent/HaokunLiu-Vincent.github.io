import type { APIRoute } from 'astro';
import sharp from 'sharp';

// A language-neutral social image: no web-font downloads or client-side rendering.
export const GET: APIRoute = async () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#fff"/>
    <circle cx="88" cy="90" r="5" fill="#3B82F6"/>
    <text x="80" y="298" font-family="Helvetica,Arial,sans-serif" font-size="156" font-weight="600" letter-spacing="-9" fill="#1D1D1F">ML / AI</text>
    <path d="M80 358h1040" stroke="#e8e8ed"/>
    <g fill="#fff" stroke="#dedee5"><rect x="80" y="414" width="290" height="116" rx="8"/><rect x="455" y="414" width="290" height="116" rx="8" fill="#f0f6ff" stroke="#bfd6fc"/><rect x="830" y="414" width="290" height="116" rx="8"/></g>
    <g font-family="Helvetica,Arial,sans-serif" font-size="25" fill="#626268" text-anchor="middle"><text x="225" y="482">01</text><text x="600" y="482" fill="#1d5bbb">02</text><text x="975" y="482">03</text></g>
    <path d="M389 472h47m-8-7 8 7-8 7m336-7h47m-8-7 8 7-8 7" fill="none" stroke="#a0a0aa" stroke-width="2"/>
  </svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
