const http = require('http');

function fetchJson(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

async function auditBlogContentLinks() {
  const blogs = await fetchJson('http://localhost:8000/api/blogs?limit=100');
  console.log(`Auditing ${blogs.length} blogs for internal/external links in content...`);

  const blogLinks = [];
  for (const b of blogs) {
    const text = (b.content || '') + ' ' + (b.short_description || '');
    const hrefMatches = [...text.matchAll(/href=["'](.*?)["']/gi)].map(m => m[1]);
    for (const href of hrefMatches) {
      blogLinks.push({ slug: b.slug, href });
    }
  }

  console.log(`Found ${blogLinks.length} links inside blog contents`);
  const broken = [];
  for (const l of blogLinks) {
    if (l.href.startsWith('/') || l.href.includes('astittva.in')) {
      const urlPath = l.href.replace(/https?:\/\/astittva\.in/, '');
      const cleanPath = urlPath.split('?')[0].split('#')[0];
      const res = await new Promise(r => {
        http.get(`http://localhost:8000${cleanPath}`, res => r(res.statusCode)).on('error', () => r('ERR'));
      });
      if (res !== 200) {
        broken.push({ slug: l.slug, href: l.href, status: res });
        console.log(`❌ Blog "${l.slug}" has broken link to: ${l.href} (${res})`);
      }
    }
  }

  console.log(`Total broken links in blog content: ${broken.length}`);
}

auditBlogContentLinks();

