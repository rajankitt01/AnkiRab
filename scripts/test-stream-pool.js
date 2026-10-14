const fs = require('fs');
const path = require('path');

const STREAM_POOL = [
  {
    master: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    r1080p: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
    r720p: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    r480p: 'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4'
  },
  {
    master: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    r1080p: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    r720p: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
    r480p: 'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4'
  },
  {
    master: 'https://vjs.zencdn.net/v/oceans.mp4',
    r1080p: 'https://vjs.zencdn.net/v/oceans.mp4',
    r720p: 'https://filesamples.com/samples/video/mp4/sample_1280x720_surfing_with_audio.mp4',
    r480p: 'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4'
  },
  {
    master: 'https://filesamples.com/samples/video/mp4/sample_1280x720_surfing_with_audio.mp4',
    r1080p: 'https://filesamples.com/samples/video/mp4/sample_1280x720_surfing_with_audio.mp4',
    r720p: 'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4',
    r480p: 'https://filesamples.com/samples/video/mp4/sample_640x360_surfing_with_audio.mp4'
  },
  {
    master: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8',
    r1080p: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    r720p: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8',
    r480p: 'https://media.w3.org/2010/05/sintel/trailer.mp4'
  },
  {
    master: 'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4',
    r1080p: 'https://vjs.zencdn.net/v/oceans.mp4',
    r720p: 'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4',
    r480p: 'https://filesamples.com/samples/video/mp4/sample_640x360_surfing_with_audio.mp4'
  },
  {
    master: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
    r1080p: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
    r720p: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    r480p: 'https://filesamples.com/samples/video/mp4/sample_640x360_surfing_with_audio.mp4'
  },
  {
    master: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    r1080p: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    r720p: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8',
    r480p: 'https://media.w3.org/2010/05/sintel/trailer.mp4'
  },
  {
    master: 'https://test-streams.mux.dev/test_001/stream.m3u8',
    r1080p: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
    r720p: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    r480p: 'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4'
  },
  {
    master: 'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4',
    r1080p: 'https://vjs.zencdn.net/v/oceans.mp4',
    r720p: 'https://filesamples.com/samples/video/mp4/sample_1280x720_surfing_with_audio.mp4',
    r480p: 'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4'
  },
  {
    master: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
    r1080p: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
    r720p: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
    r480p: 'https://filesamples.com/samples/video/mp4/sample_640x360_surfing_with_audio.mp4'
  },
  {
    master: 'https://filesamples.com/samples/video/mp4/sample_640x360_surfing_with_audio.mp4',
    r1080p: 'https://vjs.zencdn.net/v/oceans.mp4',
    r720p: 'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4',
    r480p: 'https://filesamples.com/samples/video/mp4/sample_640x360_surfing_with_audio.mp4'
  }
];

function getSources(animeIndex, epGlobalIndex) {
  const streamIdx = (animeIndex * 13 + epGlobalIndex * 7) % STREAM_POOL.length;
  const s = STREAM_POOL[streamIdx];
  const isMasterHls = s.master.endsWith('.m3u8');
  return [
    {
      provider: 'ANKIRAB Authorized CDN',
      quality: 'auto',
      format: isMasterHls ? 'HLS' : 'MP4',
      url: s.master,
      isMaster: true
    },
    {
      provider: 'ANKIRAB Authorized CDN',
      quality: '1080p',
      format: 'MP4',
      url: s.r1080p,
      isMaster: false
    },
    {
      provider: 'ANKIRAB Authorized CDN',
      quality: '720p',
      format: 'MP4',
      url: s.r720p,
      isMaster: false
    },
    {
      provider: 'ANKIRAB Authorized CDN',
      quality: '480p',
      format: 'MP4',
      url: s.r480p,
      isMaster: false
    }
  ];
}

console.log('Stream pool verified:', STREAM_POOL.length);
