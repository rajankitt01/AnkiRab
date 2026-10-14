const http = require('http');

function request(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🚀 Starting ANKIRAB Playback & Server Priority Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await request('http://localhost:4000/api/health');
    assert(healthRes.statusCode === 200, 'API Health Check returns 200');

    // 2. Fetch all anime
    const animeRes = await request('http://localhost:4000/api/anime?limit=50');
    assert(animeRes.statusCode === 200, 'Anime list returns 200');
    const animeData = JSON.parse(animeRes.data);
    const animeList = Array.isArray(animeData.data) ? animeData.data : (animeData.data?.items || []);
    assert(animeList.length >= 13, `Catalog contains all anime series (found: ${animeList.length})`);

    // Verify Naruto & Naruto Shippuden are present
    const narutoClassic = animeList.find(a => a.slug === 'naruto');
    const narutoShippuden = animeList.find(a => a.slug === 'naruto-shippuden');
    assert(!!narutoClassic, 'Naruto (Classic) exists in catalog');
    assert(!!narutoShippuden, 'Naruto: Shippuden exists in catalog');

    // Check Naruto Classic seasons
    const narutoClassicDetail = await request(`http://localhost:4000/api/anime/${narutoClassic.id}`);
    const narutoClassicData = JSON.parse(narutoClassicDetail.data).data;
    const classicSeasons = narutoClassicData.seasons || [];
    assert(classicSeasons.length >= 5, `Naruto Classic has 5 complete seasons (found: ${classicSeasons.length})`);

    // Check Naruto Shippuden seasons
    const narutoShippudenDetail = await request(`http://localhost:4000/api/anime/${narutoShippuden.id}`);
    const narutoShippudenData = JSON.parse(narutoShippudenDetail.data).data;
    const shippudenSeasons = narutoShippudenData.seasons || [];
    assert(shippudenSeasons.length >= 9, `Naruto Shippuden has 9 saga seasons (found: ${shippudenSeasons.length})`);

    // 3. Test Playback Session on a Hindi-dubbed anime (e.g. Naruto Shippuden)
    const testEpisode = shippudenSeasons[0]?.episodes?.[0];
    assert(!!testEpisode, 'Naruto Shippuden Season 1 Episode 1 exists');

    const playbackRes = await request(`http://localhost:4000/api/episodes/${testEpisode.id}/playback`);
    assert(playbackRes.statusCode === 200, 'Playback session returns 200');
    const playbackData = JSON.parse(playbackRes.data).data;

    // Verify Server Priority: Server 1 must be real Hindi Dubbed VIP stream and marked isDefault
    const servers = playbackData.servers || [];
    assert(servers.length >= 5, `Playback session returns multiple streaming servers (found: ${servers.length})`);
    
    const server1 = servers[0];
    assert(server1.id === 'ankirab-hindi-stream', `Server 1 ID is 'ankirab-hindi-stream' (actual: '${server1.id}')`);
    assert(server1.isDefault === true, 'Server 1 isDefault is true (prioritizes Hindi Dub VIP stream extracted from Hindi Anime API)');
    assert(server1.url.includes('/api/hindi/player'), `Server 1 URL maps to Hindi player endpoint: "${server1.url}"`);

    // Verify Server 2 is VidLink Anime Multi-Dub HD
    const server2 = servers[1];
    assert(server2.id === 'vidlink-anime', `Server 2 ID is 'vidlink-anime' (actual: '${server2.id}')`);
    assert(server2.url.includes('vidlink.pro/anime/1735/1/dub'), `Server 2 URL maps real MAL ID and episode: "${server2.url}"`);

    // Verify Server 3 is VidSrc Cinema HD
    const server3 = servers[2];
    assert(server3.id === 'vidsrc', `Server 3 ID is 'vidsrc' (actual: '${server3.id}')`);
    assert(server3.url.includes('vidsrc.sh'), `Server 3 URL uses vidsrc.sh`);

    // Verify Server 4 is 2Embed Ultra Mirror
    const server4 = servers[3];
    assert(server4.id === '2embed', `Server 4 ID is '2embed' (actual: '${server4.id}')`);
    assert(server4.url.includes('2embed.cc'), `Server 4 URL uses 2embed.cc`);

    // Verify Server 5 is EmbedSu Stream Cloud
    const server5 = servers[4];
    assert(server5.id === 'embedsu', `Server 5 ID is 'embedsu' (actual: '${server5.id}')`);
    assert(server5.url.includes('embed.su'), `Server 5 URL uses embed.su`);

    // Verify Hindi Streaming API endpoints
    const hindiStreamRes = await request('http://localhost:4000/api/hindi/stream?id=naruto&season=1&ep=1');
    assert(hindiStreamRes.statusCode === 200, 'Extracted Hindi stream API returns 200');
    const hindiStreamData = JSON.parse(hindiStreamRes.data);
    assert(hindiStreamData.success === true, 'Hindi stream API success is true');
    assert(hindiStreamData.results.length > 0, `Hindi stream API found valid streaming servers (${hindiStreamData.results.length} found)`);

    const hindiPlayerRes = await request('http://localhost:4000/api/hindi/player?slug=naruto&season=1&ep=1');
    assert(hindiPlayerRes.statusCode === 302, 'Hindi player route redirects (302) to direct stream embed');
    assert(!!hindiPlayerRes.headers.location, `Hindi player redirects to: ${hindiPlayerRes.headers.location}`);

    // Verify Audio Tracks priority
    const audioTracks = playbackData.audioTracks || [];
    assert(audioTracks.length >= 3, `Has 3 audio tracks (Hindi, English, Japanese)`);
    assert(audioTracks[0].language === 'hi' && audioTracks[0].isDefault === true, 'Default audio track is Hindi (hi)');

    // 4. Test Video Streaming Endpoints
    // Test Hindi HLS master playlist endpoint
    const hlsHindiRes = await request(`http://localhost:4000/api/video/hls/${testEpisode.id}/master.m3u8?lang=hi`);
    assert(hlsHindiRes.statusCode === 200 || hlsHindiRes.statusCode === 302, `HLS Hindi route returns active video (status: ${hlsHindiRes.statusCode})`);
    if (hlsHindiRes.statusCode === 302) {
      assert(!!hlsHindiRes.headers.location, `HLS Hindi 302 redirects to: ${hlsHindiRes.headers.location}`);
    }

    // Test English HLS master playlist endpoint
    const hlsEngRes = await request(`http://localhost:4000/api/video/hls/${testEpisode.id}/master.m3u8?lang=en`);
    assert(hlsEngRes.statusCode === 200 || hlsEngRes.statusCode === 302, `HLS English route returns active video (status: ${hlsEngRes.statusCode})`);

    // Test Japanese HLS master playlist endpoint
    const hlsJapRes = await request(`http://localhost:4000/api/video/hls/${testEpisode.id}/master.m3u8?lang=ja`);
    assert(hlsJapRes.statusCode === 200 || hlsJapRes.statusCode === 302, `HLS Japanese route returns active video (status: ${hlsJapRes.statusCode})`);

    // Test Direct MP4 stream routes
    const streamHindiRes = await request(`http://localhost:4000/api/video/stream/${testEpisode.id}?lang=hi`);
    assert(streamHindiRes.statusCode === 302, `Direct MP4 Hindi route returns 302 redirect`);
    assert(!!streamHindiRes.headers.location, `Direct MP4 Hindi redirects to valid media URL: ${streamHindiRes.headers.location}`);

    // 5. Test another anime (e.g. Demon Slayer, Attack on Titan, Solo Leveling)
    for (const testSlug of ['demon-slayer', 'attack-on-titan', 'solo-leveling']) {
      const a = animeList.find(x => x.slug === testSlug);
      assert(!!a, `Anime "${testSlug}" found in catalog`);
      const det = await request(`http://localhost:4000/api/anime/${a.id}`);
      const d = JSON.parse(det.data).data;
      assert(d.seasons && d.seasons.length > 0, `"${testSlug}" has seasons loaded`);
      const ep1 = d.seasons[0]?.episodes?.[0];
      assert(!!ep1, `"${testSlug}" Season 1 Episode 1 exists`);
      
      const pb = await request(`http://localhost:4000/api/episodes/${ep1.id}/playback`);
      assert(pb.statusCode === 200, `"${testSlug}" Episode 1 playback session returns 200`);
      const pbd = JSON.parse(pb.data).data;
      assert(pbd.servers[0].id === 'ankirab-hindi-stream', `"${testSlug}" prioritizes Server 1: AnkiRab Hindi Dub VIP`);
      assert(pbd.servers[1].id === 'vidlink-anime', `"${testSlug}" provides Server 2: VidLink Multi-Dub HD`);
    }

    // 6. Test Subtitle Endpoints
    const subRes = await request('http://localhost:4000/api/subtitles/english.vtt');
    assert(subRes.statusCode === 200, 'English subtitle endpoint returns 200');
    assert(subRes.data.includes('WEBVTT'), 'English subtitle endpoint returns valid WEBVTT format');

    const hiSubRes = await request('http://localhost:4000/api/subtitles/hindi.vtt');
    assert(hiSubRes.statusCode === 200, 'Hindi subtitle endpoint returns 200');
    assert(hiSubRes.data.includes('WEBVTT'), 'Hindi subtitle endpoint returns valid WEBVTT format');

    console.log(`\n=========================================`);
    console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
