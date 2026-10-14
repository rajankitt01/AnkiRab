const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
  const testUrls = [
    'https://animesalt.cx/episode/naruto-1x1/',
    'https://animesalt.cx/episode/solo-leveling-1x1/',
    'https://toonstream.us/episode/naruto-1x1/',
    'https://toonstream.us/episode/solo-leveling-1x1/'
  ];
  for (const u of testUrls) {
    try {
      console.log('Testing:', u);
      const res = await axios.get(u, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36',
          'Referer': 'https://toonstream.us/'
        },
        timeout: 8000,
        maxRedirects: 5
      });
      console.log('STATUS:', res.status, 'LENGTH:', res.data.length);
      const $ = cheerio.load(res.data);
      const options = [];
      $('#aa-options > div.video').each((_, el) => {
        let iframe = $(el).find('iframe').attr('src') || $(el).find('iframe').attr('data-src');
        if (iframe) options.push({ id: $(el).attr('id'), iframe });
      });
      console.log('FOUND SERVERS in #aa-options:', options);
      if (options.length === 0) {
        $('iframe').each((_, el) => {
          options.push({ iframe: $(el).attr('src') || $(el).attr('data-src') });
        });
        console.log('FOUND IFRAMES on page:', options);
      }
    } catch (e) {
      console.log('FAIL:', u, e.message);
    }
  }
}

testScrape();
