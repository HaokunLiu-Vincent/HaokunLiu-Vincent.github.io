import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { load } from 'cheerio';

const dist = new URL('../dist/', import.meta.url);
const config = JSON.parse(readFileSync(new URL('../src/config/site.json', import.meta.url), 'utf8'));
const origin = new URL(process.env.SITE_URL || config.url).origin;
const pages = ['', 'projects/', 'about/', 'contact/', 'projects/agentic-commerce/', 'projects/recommendation-pipeline/'];
const projectIds = ['agentic-commerce', 'recommendation-pipeline'];
const locales = { en: 'en', zh: 'zh-CN' };
const read = path => readFileSync(new URL(path, dist), 'utf8');

for (const [locale, lang] of Object.entries(locales)) {
  for (const page of pages) {
    const route = `/${locale}/${page}`;
    test(`${route} has accessible structure, translated metadata, and equivalent language routes`, () => {
      const $ = load(read(`${locale}/${page}index.html`));
      assert.equal($('html').attr('lang'), lang);
      assert.equal($('main').length, 1);
      assert.equal($('h1').length, 1);
      const headingLevels = $('main h1, main h2, main h3, main h4').toArray().map(el => Number(el.tagName.slice(1)));
      for (let i = 1; i < headingLevels.length; i++) assert.ok(headingLevels[i] <= headingLevels[i - 1] + 1, 'Heading levels must not skip a level');
      assert.equal($('.skip-link').attr('href'), '#main');
      assert.ok($('main#main').length);
      assert.ok($('title').text().endsWith(' — ' + config.name[locale]));
      assert.equal($('meta[name="author"]').attr('content'), config.name[locale]);
      assert.equal($('.wordmark-name').text(), config.name[locale]);
      assert.equal($('.footer-name').text(), config.name[locale] + '.');
      assert.doesNotMatch($('body').text(), /Your Name|你的姓名|MSc Artificial Intelligence/);
      assert.ok($('meta[name="description"]').attr('content').length > 20);
      assert.equal($('link[rel="canonical"]').attr('href'), `${origin}${route}`);
      for (const [target, targetLang] of Object.entries(locales)) {
        assert.equal($(`link[hreflang="${targetLang}"]`).attr('href'), `${origin}/${target}/${page}`);
        assert.equal($(`.language-switcher a[hreflang="${targetLang}"]`).attr('href'), `/${target}/${page}`);
      }
      assert.equal($('.language-switcher a[aria-current="true"]').length, 1);
      assert.equal($('link[hreflang="x-default"]').attr('href'), `${origin}/en/${page}`);
      assert.equal($('meta[property="og:url"]').attr('content'), `${origin}${route}`);
      assert.equal($('meta[property="og:description"]').attr('content'), $('meta[name="description"]').attr('content'));
      assert.equal($('meta[property="og:image"]').attr('content'), `${origin}/og.png`);
      assert.equal($('meta[property="og:locale"]').attr('content'), locale === 'en' ? 'en_US' : 'zh_CN');
      assert.equal($('script[src]').length, 0, 'Static navigation must not depend on a client bundle');
      if (locale === 'zh') {
        assert.match($('h1').text(), /[\u3400-\u9fff]/);
        assert.match($('meta[name="description"]').attr('content'), /[\u3400-\u9fff]/);
        assert.equal($('.main-nav').text().replace(/\s/g, ''), '首页项目关于联系');
      }
    });
  }
}

test('all internal links, stylesheets, images, and fragments resolve in the static output', () => {
  const htmlFiles = [];
  function walk(directory, relative = '') {
    for (const file of readdirSync(directory)) {
      const full = join(directory, file);
      const path = `${relative}${file}`;
      if (statSync(full).isDirectory()) walk(full, `${path}/`);
      else if (file.endsWith('.html')) htmlFiles.push(path);
    }
  }
  walk(dist.pathname);
  for (const file of htmlFiles) {
    const $ = load(read(file));
    for (const element of $('a[href], link[href], img[src], script[src]').toArray()) {
      const value = $(element).attr('href') || $(element).attr('src');
      if (/^(https?:|mailto:|data:)/.test(value)) continue;
      const url = new URL(value, `${origin}/${file}`);
      let target = url.pathname.slice(1);
      if (!target || target.endsWith('/')) target += 'index.html';
      assert.ok(existsSync(new URL(target, dist)), `${file}: missing ${value}`);
      if (url.hash) {
        const targetDOM = load(read(target));
        assert.ok(targetDOM(`[id="${decodeURIComponent(url.hash.slice(1))}"]`).length, `${file}: missing fragment ${value}`);
      }
    }
  }
});

test('the unprefixed entry always selects English without browser language detection', () => {
  const $ = load(read('index.html'));
  assert.equal($('meta[http-equiv="refresh"]').attr('content'), '0;url=/en/');
  assert.equal($('link[rel="canonical"]').attr('href'), `${origin}/en/`);
  assert.equal($('script').length, 0);
});

test('sitemap, robots, social image, favicon, and GitHub Pages files are present', () => {
  const $ = load(read('sitemap.xml'), { xmlMode: true });
  assert.equal($('url').length, 12);
  assert.equal($('url > xhtml\\:link').length, 36);
  for (const locale of Object.keys(locales)) {
    for (const page of pages) assert.ok($('loc').toArray().some(el => $(el).text() === `${origin}/${locale}/${page}`));
  }
  assert.match(read('robots.txt'), new RegExp(`${origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/sitemap.xml`));
  assert.ok(existsSync(new URL('.nojekyll', dist)));
  assert.ok(existsSync(new URL('favicon.svg', dist)));
  const png = readFileSync(new URL('og.png', dist));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  assert.ok(png.length < 100_000, 'Social preview should stay lightweight');
});

test('missing contact and repository details are visibly represented without fake links', () => {
  for (const locale of Object.keys(locales)) {
    const $ = load(read(`${locale}/contact/index.html`));
    const missing = ['email', 'github', 'linkedin'].filter(key => !config.links[key]);
    assert.equal($('.contact-placeholder').length, missing.length);
    for (const el of $('.contact-links a').toArray()) {
      const href = $(el).attr('href');
      assert.ok(href && href !== '#' && !href.includes('username'), 'Contact destinations must be real configured links');
    }
    for (const id of projectIds) {
      const caseDOM = load(read(`${locale}/projects/${id}/index.html`));
      const repository = config.projectRepositories[id];
      if (!repository) assert.equal(caseDOM('.case-actions a').length, 0);
      else assert.equal(caseDOM('.case-actions a').attr('href'), repository);
    }
  }
});

test('both case studies distinguish development plans from measured results', () => {
  for (const locale of Object.keys(locales)) {
    for (const id of projectIds) {
      const $ = load(read(`${locale}/projects/${id}/index.html`));
      assert.ok($('.evidence-note').text().length > 50);
      assert.match($('.evidence-note').text(), locale === 'en' ? /Under development/ : /开发中/);
      assert.equal($('.case-actions .project-status').text(), locale === 'en' ? 'Under development' : '开发中');
      assert.equal($('table tbody tr').length, 4);
      for (const el of $('.result-pending').toArray()) assert.equal($(el).text(), locale === 'en' ? 'Not yet reported' : '尚未公布');
      assert.equal($('.architecture ol li').length, 3);
      assert.equal($('.main-nav a[aria-current="page"]').attr('href'), `/${locale}/projects/`);
    }
  }
});

for (const locale of Object.keys(locales)) {
  test(`${locale}: exactly two ordered projects have distinct cases and technical scope`, () => {
    const $ = load(read(`${locale}/index.html`));
    assert.deepEqual($('.project-feature').toArray().map(el => $(el).attr('data-project')), projectIds);
    for (const [index, id] of projectIds.entries()) {
      const card = $('.project-feature').eq(index);
      const link = card.find('.project-copy > .text-link');
      assert.equal(link.text().trim(), locale === 'en' ? 'View Project' : '查看项目');
      assert.equal(link.attr('href'), `/${locale}/projects/${id}/`);
      assert.ok(link.attr('aria-label').includes(card.find('.project-title').text()));
    }
    const agent = load(read(`${locale}/projects/agentic-commerce/index.html`));
    const pipeline = load(read(`${locale}/projects/recommendation-pipeline/index.html`));
    const agentText = agent('main').text();
    const pipelineText = pipeline('main').text();
    for (const keyword of locale === 'en' ? ['conversation', 'favourites', 'cart', 'delivery', 'checkout'] : ['对话', '收藏', '购物车', '配送', '结账']) assert.ok(agentText.includes(keyword), keyword);
    assert.doesNotMatch(agentText, /LambdaMART|DeepFM/);
    for (const keyword of ['LambdaMART', 'LightGBM', 'DeepFM']) assert.ok(pipelineText.includes(keyword), keyword);
    assert.match(pipelineText, locale === 'en' ? /Seven candidate retrieval channels/ : /七个候选召回通道/);
  });

  test(`${locale}: verified identity, education order, and contact destinations are consistent`, () => {
    const home = load(read(`${locale}/index.html`));
    assert.equal(home('.hero-positioning').text(), config.positioning[locale]);
    const about = load(read(`${locale}/about/index.html`));
    const entries = about('.education-entry');
    assert.equal(entries.length, 2);
    assert.match(entries.eq(0).text(), locale === 'en' ? /Master of Artificial Intelligence/ : /人工智能硕士/);
    assert.match(entries.eq(0).text(), locale === 'en' ? /Natural Language Processing/ : /自然语言处理方向/);
    assert.match(entries.eq(0).text(), locale === 'en' ? /University of Technology Sydney/ : /悉尼科技大学/);
    assert.equal(entries.eq(0).find('.education-status').text(), locale === 'en' ? 'In progress' : '在读');
    assert.match(entries.eq(1).text(), locale === 'en' ? /Information and Computing Science/ : /信息与计算科学/);
    assert.match(entries.eq(1).text(), locale === 'en' ? /Beihang University/ : /北京航空航天大学/);
    assert.equal(entries.find('time').length, 0, 'No dates were supplied');
    const contact = load(read(`${locale}/contact/index.html`));
    assert.equal(contact('.contact-placeholder').length, 0);
    for (const href of ['mailto:vincent241119@gmail.com', 'https://github.com/HaokunLiu-Vincent', 'https://www.linkedin.com/in/haokun-liu-75396b272/']) assert.equal(contact(`a[href="${href}"]`).length, 1);
  });
}

test('404 is bilingual and excluded from indexing', () => {
  const $ = load(read('404.html'));
  assert.equal($('meta[name="robots"]').attr('content'), 'noindex, follow');
  assert.equal($('link[rel="canonical"]').length, 0);
  assert.ok($('.not-found a[href="/en/"]').length);
  assert.ok($('.not-found a[href="/zh/"][lang="zh-CN"]').length);
});
