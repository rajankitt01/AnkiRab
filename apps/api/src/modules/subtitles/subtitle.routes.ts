import { Router, Request, Response } from 'express';

const router = Router();

router.get('/english.vtt', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(`WEBVTT - ANKIRAB English Subtitles

00:00:05.000 --> 00:00:09.000
[ANKIRAB] Welcome to the world of anime in your language.

00:00:10.000 --> 00:00:14.500
Sung Jinwoo: "Even if I'm the weakest, I refuse to give up."

00:00:15.000 --> 00:00:19.500
[Warning: High-grade cursed energy detected in the perimeter]

00:00:20.000 --> 00:00:25.000
Gojo Satoru: "Don't worry. I'm the strongest after all."

00:00:26.000 --> 00:00:30.000
Tanjiro: "Nezuko, hold on! I will definitely find a way to turn you back into a human!"

00:00:35.000 --> 00:00:40.000
Frieren: "Himmel... I want to know more about humans now."

00:00:45.000 --> 00:00:50.000
Luffy: "I'm going to become the King of the Pirates!"
`);
});

router.get('/hindi.vtt', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(`WEBVTT - ANKIRAB Hindi Subtitles (हिन्दी उपशीर्षक)

00:00:05.000 --> 00:00:09.000
[अंकिराब] अपनी भाषा में एनीमे की दुनिया में आपका स्वागत है।

00:00:10.000 --> 00:00:14.500
सुंग जिनवू: "भले ही मैं सबसे कमज़ोर शिकारी हूँ, मैं हार नहीं मानूँगा।"

00:00:15.000 --> 00:00:19.500
[चेतावनी: क्षेत्र में उच्च स्तर की शापित ऊर्जा का पता चला है]

00:00:20.000 --> 00:00:25.000
गोजो सातोरू: "चिंता मत करो। आख़िरकार मैं सबसे ताकतवर हूँ।"

00:00:26.000 --> 00:00:30.000
तान्जिरो: "नेज़ुको, हिम्मत मत हारना! मैं तुम्हें दोबारा इंसान बनाकर रहूँगा!"

00:00:35.000 --> 00:00:40.000
फ्रीरेन: "हिम्मेल... अब मैं इंसानों के बारे में और जानना चाहती हूँ।"

00:00:45.000 --> 00:00:50.000
लुफी: "मैं समुद्री लुटेरों का राजा बनकर रहूँगा!"
`);
});

export default router;
