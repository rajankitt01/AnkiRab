async function test() {
  for (const slug of ['bleach-1x1', 'one-piece-1x1', 'bleach-thousand-year-blood-war-1x1']) {
    const res = await fetch(`https://animesalt.cx/episode/${slug}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36',
        'Referer': 'https://animesalt.cx/'
      }
    });
    console.log('animesalt:', slug, res.status);
    if (res.status === 200) {
      const html = await res.text();
      const match = html.match(/<iframe[^>]+(?:src|data-src)=["']([^"']+)["']/i);
      console.log('animesalt iframe:', match ? match[1] : 'none');
    }
  }
}
test();
