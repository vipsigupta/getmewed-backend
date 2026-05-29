import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

interface WebTheme {
  primary: string;
  accent: string;
  heroBg: string;
  cardBg: string;
  ornament: string;
  symbol: string;
  separator: string;
  photoUrl: string;
}

const WEB_THEMES: Record<string, WebTheme> = {
  HINDU: {
    primary: '#E5C05C',
    accent: '#800000',
    heroBg: '#160b08',
    cardBg: '#1f100a',
    ornament: '✦',
    symbol: '🪔',
    separator: '❤️',
    photoUrl: 'https://images.unsplash.com/photo-1665960213508-48f07086d49c?w=1200&h=800&fit=crop&auto=format',
  },
  SIKH: {
    primary: '#FF9F33',
    accent: '#003366',
    heroBg: '#060912',
    cardBg: '#0c1322',
    ornament: '☬',
    symbol: '🌸',
    separator: '🌸',
    photoUrl: 'https://images.unsplash.com/photo-1633104502699-b2ecf0fee294?w=1200&h=800&fit=crop&auto=format',
  },
  CHRISTIAN: {
    primary: '#B6A7BC',
    accent: '#4a7c59',
    heroBg: '#0a0c10',
    cardBg: '#121721',
    ornament: '✝',
    symbol: '🕊️',
    separator: '🤍',
    photoUrl: 'https://images.unsplash.com/photo-1474867985807-96ca17098cc9?w=1200&h=800&fit=crop&auto=format',
  },
  MUSLIM: {
    primary: '#45DF85',
    accent: '#1a5c38',
    heroBg: '#030805',
    cardBg: '#05180d',
    ornament: '☪',
    symbol: '🌙',
    separator: '🌙',
    photoUrl: 'https://images.unsplash.com/photo-1630198908899-fc1226ddbac4?w=1200&h=800&fit=crop&auto=format',
  },
};

interface WebCeremony {
  name: string;
  blessing: string;
  emojis: string[];
}

const WEB_CEREMONIES: Record<string, Record<string, WebCeremony>> = {
  HINDU: {
    WEDDING:       { name: 'Vivah Utsav',       blessing: 'Shubh Vivah · शुभ विवाह',                 emojis: ['❤️', '💐', '✨', '🎊'] },
    BIRTHDAY:      { name: 'Janamdin Utsav',    blessing: 'Janamdin Ki Shubhkamnaayein · जन्मदिन',    emojis: ['🎂', '🎉', '✨', '🎈'] },
    ANNIVERSARY:   { name: 'Vivah Varshgath',   blessing: 'Shubh Varshgath · शुभ वर्षगाँठ',           emojis: ['💍', '❤️', '✨', '🌹'] },
    POOJA:         { name: 'Puja Mahotsav',     blessing: 'Om Shanti · ॐ शान्ति',                     emojis: ['🪔', '🙏', '✨', '🌺'] },
    GET_TOGETHER:  { name: 'Milan Samaroh',     blessing: 'Saath Mein Khushi · मिलन',                 emojis: ['🎊', '🤝', '✨', '🎉'] },
    OTHER:         { name: 'Utsav',             blessing: 'Shubh Aarambh · शुभ',                      emojis: ['✨', '🎊', '❤️', '🪔'] },
  },
  SIKH: {
    WEDDING:       { name: 'Anand Karaj',       blessing: 'Waheguru Ji Ka Khalsa · ਵਾਹਿਗੁਰੂ',         emojis: ['🌸', '🙏', '✨', '🎋'] },
    BIRTHDAY:      { name: 'Janam Dihada',      blessing: 'Waheguru Ji · ਜਨਮ ਦਿਹਾੜਾ',                 emojis: ['🎂', '🌸', '✨', '🎈'] },
    ANNIVERSARY:   { name: 'Salgirha Mubarak',  blessing: 'Waheguru Di Kirpa · ਸਾਲਗਿਰਹ',              emojis: ['💍', '🌸', '✨', '🌹'] },
    POOJA:         { name: 'Ardaas Samagam',    blessing: 'Waheguru Ji · ਅਰਦਾਸ',                      emojis: ['🙏', '☬', '✨', '🌸'] },
    GET_TOGETHER:  { name: 'Sangat Milan',      blessing: 'Sangat Di Khushi · ਸੰਗਤ',                  emojis: ['🎊', '🌸', '✨', '🎉'] },
    OTHER:         { name: 'Samagam',           blessing: 'Waheguru Ji · ਵਾਹਿਗੁਰੂ',                   emojis: ['✨', '🌸', '🙏', '🎊'] },
  },
  CHRISTIAN: {
    WEDDING:       { name: 'Holy Matrimony',        blessing: "Blessed Union · God's Grace",           emojis: ['🕊️', '🌿', '💒', '🤍'] },
    BIRTHDAY:      { name: 'Birthday Blessing',     blessing: "God's Blessings · Happy Birthday",     emojis: ['🎂', '🕊️', '✨', '🎈'] },
    ANNIVERSARY:   { name: 'Anniversary Grace',     blessing: "God's Everlasting Love",               emojis: ['💍', '🕊️', '✨', '🌹'] },
    POOJA:         { name: 'Prayer Service',         blessing: "In God's Name · Amen",                 emojis: ['⛪', '🙏', '✨', '🕊️'] },
    GET_TOGETHER:  { name: 'Fellowship Gathering',   blessing: 'Together in Joy',                      emojis: ['🎊', '🕊️', '✨', '🎉'] },
    OTHER:         { name: 'Celebration',            blessing: 'Bless This Day',                       emojis: ['✨', '🕊️', '🤍', '🎊'] },
  },
  MUSLIM: {
    WEDDING:       { name: 'Nikah Ceremony',     blessing: "Masha'Allah · ما شاء الله",                emojis: ['🌙', '✨', '💚', '🌿'] },
    BIRTHDAY:      { name: 'Jashan-e-Wiladat',  blessing: 'Mubarak Ho · مبارک ہو',                    emojis: ['🎂', '🌙', '✨', '🎈'] },
    ANNIVERSARY:   { name: 'Salgirha Mubarak',  blessing: 'Allah Ki Rehmat · سالگرہ',                 emojis: ['💍', '🌙', '✨', '🌹'] },
    POOJA:         { name: 'Dua Mehfil',         blessing: 'Bismillah · بسم الله',                     emojis: ['🕌', '🤲', '✨', '🌙'] },
    GET_TOGETHER:  { name: 'Mehfil',             blessing: 'Khushi Ka Mauqa · خوشی',                  emojis: ['🎊', '🌙', '✨', '🎉'] },
    OTHER:         { name: 'Jashn',              blessing: "Insha'Allah · ان شاء الله",                emojis: ['✨', '🌙', '💚', '🎊'] },
  },
};

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  // ── Dynamic Web Preview Generator ──────────────────────────────────────────
  async getInviteHtml(code: string): Promise<string> {
    const uppercaseCode = code.toUpperCase();
    const space = await this.prisma.space.findUnique({
      where: { inviteCode: uppercaseCode },
    });

    if (!space) {
      return this.get404Html(uppercaseCode);
    }

    // ── Parse Space and Religion settings ──
    let keyPeople: any = {};
    let welcomeMessage = '';
    let rawVenue = '';
    let locationLink = '';

    try {
      if (space.theme) {
        const parsedTheme = typeof space.theme === 'string' ? JSON.parse(space.theme) : space.theme;
        keyPeople = parsedTheme?.keyPeople || {};
        welcomeMessage = parsedTheme?.welcomeMessage || '';
        rawVenue = parsedTheme?.venue || '';
        locationLink = parsedTheme?.locationLink || '';
      }
    } catch (_) {}

    const religion = (keyPeople?.religion || 'HINDU').toUpperCase();
    const theme = WEB_THEMES[religion] || WEB_THEMES.HINDU;
    const eventType = (space.eventType || 'WEDDING').toUpperCase();
    const ceremony = (WEB_CEREMONIES[religion] || WEB_CEREMONIES.HINDU)[eventType] || (WEB_CEREMONIES[religion] || WEB_CEREMONIES.HINDU).WEDDING;

    const person1Name = keyPeople?.person1?.name || 'Aman';
    const person2Name = keyPeople?.person2?.name || 'Riya';
    const focusType = keyPeople?.focusType || '2_PERSON';
    const is2Person = focusType === '2_PERSON' && person1Name && person2Name;

    // Cover image setup
    let coverUrl = theme.photoUrl;
    if (keyPeople?.starPhoto && keyPeople.starPhoto.trim() !== '') {
      coverUrl = keyPeople.starPhoto;
    } else if (space.coverUrl && space.coverUrl.trim() !== '') {
      if (space.coverUrl.startsWith('http')) {
        coverUrl = space.coverUrl;
      } else {
        // Map local/offline keys to beautiful web-accessible Unsplash fallbacks
        const key = space.coverUrl.toLowerCase();
        if (key.includes('wedding')) {
          coverUrl = theme.photoUrl; // religion-specific default
        } else if (key.includes('birthday')) {
          coverUrl = 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=800&fit=crop&auto=format';
        } else if (key.includes('anniversary')) {
          coverUrl = 'https://images.unsplash.com/photo-1494867985807-96ca17098cc9?w=1200&h=800&fit=crop&auto=format';
        } else {
          coverUrl = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200';
        }
      }
    }

    // High-performance image optimization specifically for WhatsApp/Telegram scraper crawler (under 80KB)
    let ogImageUrl = coverUrl;
    if (ogImageUrl.includes('unsplash.com')) {
      ogImageUrl = ogImageUrl.replace('w=1200', 'w=600&h=400').replace('w=800', 'w=600&h=400');
      if (!ogImageUrl.includes('w=')) {
        ogImageUrl += '&w=600&h=400&fit=crop&q=80';
      }
    }

    // Format dates & locations
    const eventDate = new Date(space.date);
    const dateFormatted = eventDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeFormatted = '11:00 AM onwards';

    const venueParts = rawVenue.split(' (');
    const venueName = venueParts[0]?.trim() || 'The Grand Palace, Udaipur, Rajasthan';
    const venueLink = venueParts[1]?.replace(')', '').trim() || locationLink || '';

    // Emojis for float
    const floatEmojis = ceremony.emojis || ['✨', '❤️', '💐', '🎊'];

    // Construct OpenGraph variables
    const coupleNamesDisplay = is2Person ? `${person1Name} & ${person2Name}` : (person1Name || space.name);
    const ogTitle = `${coupleNamesDisplay} - ${ceremony.name} Invitation`;
    const ogDesc = `You are cordially invited to celebrate ${coupleNamesDisplay}'s ${ceremony.name}! Join their celebration space using Invite Code: ${uppercaseCode}.`;
    
    // Hex to rgb helper for glassmorphism
    const hexToRgb = (hex: string): string => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    };
    const primaryRgb = hexToRgb(theme.primary);

    // Return Breathtaking Premium Digital HTML Card!
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Dynamic OpenGraph Previews -->
  <title>${ogTitle}</title>
  <meta name="description" content="${ogDesc}">
  <meta property="og:title" content="${ogTitle}" />
  <meta property="og:description" content="${ogDesc}" />
  <meta property="og:image" content="${ogImageUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://getmewed-backend.vercel.app/invite/${uppercaseCode}" />
  <meta property="og:site_name" content="GetMeWed" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${ogTitle}" />
  <meta name="twitter:description" content="${ogDesc}" />
  <meta name="twitter:image" content="${ogImageUrl}" />

  <!-- Premium Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">

  <style>
    :root {
      --primary: ${theme.primary};
      --primary-rgb: ${primaryRgb};
      --bg: ${theme.heroBg};
      --card-bg: ${theme.cardBg};
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg);
      color: #FFFFFF;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow-x: hidden;
      position: relative;
    }

    /* Ambient Background Image (Soft Opacity & Smooth Blending) */
    .bg-image {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: url("${coverUrl}") no-repeat center center;
      background-size: cover;
      opacity: 0.22;
      z-index: 1;
      filter: saturate(0.8) blur(3px);
    }

    .bg-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(to bottom, rgba(${hexToRgb(theme.heroBg)}, 0.4), var(--bg) 85%);
      z-index: 2;
    }

    /* Floating sparkle particles */
    .sparkle {
      position: absolute;
      font-size: 24px;
      opacity: 0;
      z-index: 3;
      user-select: none;
      animation: floatUp 8s ease-in-out infinite;
    }

    @keyframes floatUp {
      0% {
        transform: translateY(100vh) translateX(0) scale(0.5);
        opacity: 0;
      }
      10% {
        opacity: 0.6;
      }
      90% {
        opacity: 0.4;
      }
      100% {
        transform: translateY(-10vh) translateX(50px) scale(1.2);
        opacity: 0;
      }
    }

    /* Elegant Luxury Invitation Card */
    .card-container {
      width: 100%;
      max-width: 520px;
      padding: 24px 16px;
      z-index: 10;
      position: relative;
    }

    .invite-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
      border: 1px solid rgba(var(--primary-rgb), 0.18);
      border-radius: 32px;
      padding: 40px 32px;
      text-align: center;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6), 
                  inset 0 1px 0 rgba(255, 255, 255, 0.05);
      position: relative;
      overflow: hidden;
    }

    /* Ornamental lines */
    .decor-row {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      width: 70%;
      gap: 12px;
    }

    .decor-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, transparent, rgba(var(--primary-rgb), 0.4), transparent);
    }

    .decor-ornament {
      font-size: 16px;
      color: var(--primary);
      text-shadow: 0 0 8px rgba(var(--primary-rgb), 0.5);
    }

    .blessing-line {
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 4px;
      color: var(--primary);
      opacity: 0.85;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .invited-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 5px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    /* Celebrant Photo */
    .celebrant-photo {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 2px solid var(--primary);
      margin: 0 auto 16px;
      object-fit: cover;
      box-shadow: 0 8px 20px rgba(0,0,0,0.4);
    }

    /* Georgia Serif Typography matching native app */
    .names {
      font-family: 'Playfair Display', 'Georgia', serif;
      font-size: 32px;
      font-weight: 700;
      line-height: 1.25;
      color: #FFFFFF;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }

    .ampersand {
      font-family: 'Playfair Display', 'Georgia', serif;
      font-style: italic;
      font-weight: 300;
      color: var(--primary);
      margin: 0 4px;
      font-size: 26px;
    }

    .ceremony-name {
      font-family: 'Playfair Display', 'Georgia', serif;
      font-style: italic;
      font-size: 17px;
      color: var(--primary);
      opacity: 0.95;
      letter-spacing: 1px;
      margin-bottom: 24px;
    }

    .symbol-text {
      font-size: 24px;
      margin: 20px 0;
    }

    /* Dynamic Countdown Timer */
    .countdown-box {
      background: rgba(var(--primary-rgb), 0.05);
      border: 1px solid rgba(var(--primary-rgb), 0.12);
      border-radius: 20px;
      padding: 16px 12px;
      margin-bottom: 28px;
    }

    .countdown-title {
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 3px;
      color: rgba(var(--primary-rgb), 0.7);
      margin-bottom: 12px;
      text-transform: uppercase;
    }

    .countdown-row {
      display: flex;
      justify-content: space-around;
    }

    .time-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 55px;
    }

    .time-num {
      font-family: 'Playfair Display', 'Georgia', serif;
      font-size: 24px;
      font-weight: 700;
      color: var(--primary);
      line-height: 1;
    }

    .time-lbl {
      font-size: 8.5px;
      font-weight: 500;
      letter-spacing: 1px;
      color: rgba(var(--primary-rgb), 0.6);
      margin-top: 4px;
      text-transform: uppercase;
    }

    /* Detail Rows */
    .details {
      display: flex;
      flex-direction: column;
      gap: 16px;
      text-align: left;
      margin-bottom: 36px;
      padding: 0 4px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
    }

    .icon-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1.2px solid rgba(var(--primary-rgb), 0.15);
      background: rgba(255,255,255,0.01);
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .icon-circle svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: var(--primary);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .detail-text {
      font-size: 13.5px;
      line-height: 1.4;
      font-weight: 500;
      color: #E2D8C5;
    }

    /* Luxury Satin Gold/Champagne Join Button */
    .join-btn {
      display: block;
      width: 100%;
      background: linear-gradient(to right, rgba(var(--primary-rgb), 0.18), rgba(var(--primary-rgb), 0.04));
      border: 1.2px solid rgba(var(--primary-rgb), 0.4);
      border-radius: 16px;
      padding: 18px 24px;
      color: var(--primary);
      font-weight: 700;
      font-size: 14.5px;
      letter-spacing: 1px;
      text-decoration: none;
      text-transform: uppercase;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .join-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        120deg,
        transparent,
        rgba(255, 255, 255, 0.15),
        transparent
      );
      transition: all 0.6s;
    }

    .join-btn:hover {
      background: linear-gradient(to right, rgba(var(--primary-rgb), 0.28), rgba(var(--primary-rgb), 0.08));
      border-color: rgba(var(--primary-rgb), 0.6);
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(var(--primary-rgb), 0.15), 0 8px 20px rgba(0,0,0,0.5);
    }

    .join-btn:hover::before {
      left: 100%;
    }

    .join-btn:active {
      transform: translateY(0);
    }

    .logo-footer {
      margin-top: 24px;
      font-size: 11px;
      letter-spacing: 2px;
      color: rgba(255, 255, 255, 0.25);
      text-transform: uppercase;
    }

    /* Modal dialog */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.85);
      z-index: 100;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.35s ease;
      padding: 16px;
    }

    .dialog-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }

    .dialog-box {
      background: var(--bg);
      border: 1px solid rgba(var(--primary-rgb), 0.25);
      border-radius: 28px;
      padding: 36px 28px;
      width: 100%;
      max-width: 420px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8);
      transform: scale(0.9);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .dialog-overlay.active .dialog-box {
      transform: scale(1);
    }

    .dialog-title {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      color: var(--primary);
      margin-bottom: 12px;
    }

    .dialog-body {
      font-size: 13.5px;
      color: #E2D8C5;
      line-height: 1.6;
      margin-bottom: 28px;
    }

    .dialog-btn {
      display: inline-block;
      width: 100%;
      background: var(--primary);
      color: var(--bg);
      border: none;
      border-radius: 12px;
      padding: 14px 20px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      text-decoration: none;
      cursor: pointer;
      margin-bottom: 12px;
      box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3);
      transition: opacity 0.2s;
    }

    .dialog-btn:hover {
      opacity: 0.9;
    }

    .dialog-close {
      font-size: 12px;
      color: rgba(255,255,255,0.4);
      text-decoration: underline;
      cursor: pointer;
    }
  </style>
</head>
<body>

  <div class="bg-image"></div>
  <div class="bg-overlay"></div>

  <!-- Ambient Particles -->
  <div id="particle-container"></div>

  <div class="card-container">
    <div class="invite-card">
      
      <!-- Ornamental Header -->
      <div class="decor-row">
        <div class="decor-line"></div>
        <div class="decor-ornament">${theme.ornament}</div>
        <div class="decor-line"></div>
      </div>

      <!-- Blessing and Invitation Lines -->
      <div class="blessing-line">${ceremony.blessing}</div>
      <div class="invited-label">You Are Cordially Invited To</div>

      <!-- Celebrant Photo -->
      <img src="${coverUrl}" class="celebrant-photo" alt="Celebrant Photo" />

      <!-- Naming Section -->
      <div class="names">
        ${is2Person ? `
          <span>${person1Name}</span>
          <span class="ampersand">${theme.separator}</span>
          <span>${person2Name}</span>
        ` : `
          <span>${person1Name || space.name}</span>
        `}
      </div>

      <div class="ceremony-name">${ceremony.name}</div>

      <!-- Ornamental Symbol -->
      <div class="symbol-text">${theme.symbol}</div>

      <!-- Live Countdown -->
      <div class="countdown-box">
        <div class="countdown-title">Begins In</div>
        <div class="countdown-row">
          <div class="time-block">
            <span class="time-num" id="days">00</span>
            <span class="time-lbl">Days</span>
          </div>
          <div class="time-block">
            <span class="time-num" id="hours">00</span>
            <span class="time-lbl">Hours</span>
          </div>
          <div class="time-block">
            <span class="time-num" id="mins">00</span>
            <span class="time-lbl">Mins</span>
          </div>
          <div class="time-block">
            <span class="time-num" id="secs">00</span>
            <span class="time-lbl">Secs</span>
          </div>
        </div>
      </div>

      <!-- Details List -->
      <div class="details">
        
        <!-- Date -->
        <div class="detail-row">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div class="detail-text">${dateFormatted}<br><span style="font-size: 11px; opacity: 0.6;">${timeFormatted}</span></div>
        </div>

        <!-- Venue -->
        <a class="detail-row" ${venueLink ? `href="${venueLink}" target="_blank"` : ''} style="${venueLink ? 'cursor: pointer;' : 'cursor: default;'}">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
          <div class="detail-text">${venueName}${venueLink ? `<br><span style="font-size: 11.5px; color: var(--primary); text-decoration: underline;">Open in Google Maps ↗</span>` : ''}</div>
        </a>

      </div>

      <!-- Call to Action -->
      <button class="join-btn" onclick="openJoinModal()">
        Join Celebration ${theme.symbol}
      </button>

      <div class="logo-footer" style="text-transform: lowercase;">getmewed-backend.vercel.app</div>

    </div>
  </div>

  <!-- Deep Link & Download App Dialog -->
  <div class="dialog-overlay" id="join-dialog">
    <div class="dialog-box">
      <div class="dialog-title">${ceremony.name}</div>
      <div class="dialog-body">
        Enter the celebration space to view exclusive photos, timeline, and share greetings with ${coupleNamesDisplay} in real-time!<br><br>
        <strong>Invite Code: ${uppercaseCode}</strong>
      </div>
      <a class="dialog-btn" href="getmewed://invite/${uppercaseCode}" onclick="closeJoinModal()">Open GetMeWed App</a>
      <button class="dialog-btn" style="background: transparent; border: 1.2px solid var(--primary); color: var(--primary); box-shadow: none;" onclick="window.location.href='https://getmewed.page.link/install'">Download Application</button>
      <div class="dialog-close" onclick="closeJoinModal()">Cancel</div>
    </div>
  </div>

  <script>
    // ── Real-time Countdown Timer ──
    const targetDate = new Date("${eventDate.toISOString()}").getTime();

    function updateCountdown() {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        document.getElementById('days').innerText = '00';
        document.getElementById('hours').innerText = '00';
        document.getElementById('mins').innerText = '00';
        document.getElementById('secs').innerText = '00';
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      document.getElementById('days').innerText = String(d).padStart(2, '0');
      document.getElementById('hours').innerText = String(h).padStart(2, '0');
      document.getElementById('mins').innerText = String(m).padStart(2, '0');
      document.getElementById('secs').innerText = String(s).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ── Modal Controller ──
    function openJoinModal() {
      // Direct deep link check
      const deepLink = "getmewed://invite/${uppercaseCode}";
      
      // Attempt to deep link instantly
      const start = Date.now();
      window.location.href = deepLink;
      
      // If the app is installed, they leave the browser. If not, show dialog sheet
      setTimeout(() => {
        if (Date.now() - start < 1500) {
          document.getElementById('join-dialog').classList.add('active');
        }
      }, 500);
    }

    function closeJoinModal() {
      document.getElementById('join-dialog').classList.remove('active');
    }

    // Close on overlay click
    document.getElementById('join-dialog').addEventListener('click', (e) => {
      if (e.target.id === 'join-dialog') {
        closeJoinModal();
      }
    });

    // ── Ambient Emojis Generator ──
    const emojis = ${JSON.stringify(floatEmojis)};
    const container = document.getElementById('particle-container');

    function createSparkle() {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      
      // Random coordinates
      sparkle.style.left = Math.random() * 100 + 'vw';
      sparkle.style.animationDuration = (6 + Math.random() * 4) + 's';
      sparkle.style.fontSize = (16 + Math.random() * 16) + 'px';
      
      container.appendChild(sparkle);
      
      // Remove after animation completes
      setTimeout(() => {
        sparkle.remove();
      }, 10000);
    }

    // Generate initial sparkles
    for (let i = 0; i < 5; i++) {
      setTimeout(createSparkle, Math.random() * 4000);
    }

    // Keep generating sparkles
    setInterval(createSparkle, 2000);
  </script>
</body>
</html>
`;
  }

  // ── Luxury 404 Invitation Card Page ─────────────────────────────────────────
  private get404Html(code: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation Not Found</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #0d0c10;
      color: #FFFFFF;
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0;
      text-align: center;
    }
    .card {
      border: 1px solid rgba(229, 192, 92, 0.15);
      background: rgba(255, 255, 255, 0.02);
      border-radius: 24px;
      padding: 48px 32px;
      max-width: 440px;
      backdrop-filter: blur(12px);
    }
    h1 {
      font-family: 'Cinzel', serif;
      color: #E5C05C;
      margin-bottom: 16px;
      font-size: 24px;
    }
    p {
      color: rgba(255,255,255,0.7);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .code {
      display: inline-block;
      font-weight: 700;
      color: #E5C05C;
      letter-spacing: 2px;
      background: rgba(229, 192, 92, 0.08);
      padding: 6px 12px;
      border-radius: 8px;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Invitation Expired</h1>
    <div class="code">${code}</div>
    <p>We couldn't find an active celebration space corresponding to this invite code. Please verify the link or contact the host for a valid invite code.</p>
    <div style="font-size: 11px; color: rgba(255,255,255,0.3); text-transform: lowercase; letter-spacing: 2px;">feellive.in</div>
  </div>
</body>
</html>
`;
  }
}
