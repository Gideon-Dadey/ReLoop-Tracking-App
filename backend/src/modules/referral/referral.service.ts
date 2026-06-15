import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import sharp from 'sharp';
import { User } from '../users/schemas/user.schema';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);
  private logoBuffer: Buffer | null = null;

  constructor(
    private readonly config: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  getPublicWebUrl(): string {
    const configured = this.config.get<string>('PUBLIC_WEB_URL');
    if (configured) return configured.replace(/\/$/, '');
    const port = this.config.get<string>('PORT') || '3000';
    return `http://localhost:${port}`;
  }

  sanitizeUserName(raw: string): string {
    return raw.replace(/[^\w\s.-]/g, '').trim().slice(0, 100);
  }

  async resolveDisplayName(userName: string): Promise<string> {
    const sanitized = this.sanitizeUserName(userName);
    if (!sanitized) return 'ReLoop Member';
    const escaped = sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await this.userModel
      .findOne({ userName: { $regex: new RegExp(`^${escaped}$`, 'i') } })
      .select('userName')
      .lean();
    return user?.userName || sanitized;
  }

  private loadLogo(): Buffer | null {
    if (this.logoBuffer) return this.logoBuffer;
    const candidates = [
      join(process.cwd(), 'public', 'reloop-logo.png'),
      join(process.cwd(), 'dist', 'public', 'reloop-logo.png'),
      join(__dirname, '..', '..', '..', 'public', 'reloop-logo.png'),
    ];
    for (const path of candidates) {
      if (existsSync(path)) {
        this.logoBuffer = readFileSync(path);
        return this.logoBuffer;
      }
    }
    this.logger.warn('ReLoop logo not found for OG image generation');
    return null;
  }

  async generateOgImage(userName: string): Promise<Buffer> {
    const displayName = await this.resolveDisplayName(userName);
    const safeName = this.escapeXml(displayName);
    const logo = this.loadLogo();

    const titleSvg = `
      <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0F766E"/>
            <stop offset="55%" style="stop-color:#0A1614"/>
            <stop offset="100%" style="stop-color:#071512"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="600" y="420" text-anchor="middle" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700">
          Join ${safeName} on ReLoop
        </text>
        <text x="600" y="490" text-anchor="middle" fill="#A7F3D0" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="500">
          Reuse containers · Cut plastic waste · Earn rewards
        </text>
        <text x="600" y="560" text-anchor="middle" fill="#5EEAD4" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="600" letter-spacing="4">
          SDG 12 · RESPONSIBLE CONSUMPTION
        </text>
      </svg>`;

    let pipeline = sharp(Buffer.from(titleSvg)).png();

    if (logo) {
      const logoSize = 200;
      const roundedLogo = await sharp(logo)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

      pipeline = sharp(await pipeline.toBuffer()).composite([
        {
          input: roundedLogo,
          top: Math.round(OG_HEIGHT * 0.14),
          left: Math.round((OG_WIDTH - logoSize) / 2),
        },
      ]);
    }

    return pipeline
      .resize(OG_WIDTH, OG_HEIGHT)
      .png({ quality: 90 })
      .toBuffer();
  }

  buildLandingHtml(opts: {
    displayName: string;
    pageUrl: string;
    ogImageUrl: string;
    brandIconUrl: string;
  }): string {
    const { displayName, pageUrl, ogImageUrl, brandIconUrl } = opts;
    const title = `${displayName} invited you to ReLoop`;
    const description =
      'Join the circular economy — borrow reusable containers, return them clean, and track your environmental impact. Supporting UN SDG 12.';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${this.escapeHtml(title)}</title>
  <meta name="description" content="${this.escapeHtml(description)}"/>
  <link rel="icon" type="image/png" href="${this.escapeHtml(brandIconUrl)}"/>

  <!-- Open Graph (WhatsApp, Telegram, Facebook, iMessage) -->
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="ReLoop"/>
  <meta property="og:url" content="${this.escapeHtml(pageUrl)}"/>
  <meta property="og:title" content="${this.escapeHtml(title)}"/>
  <meta property="og:description" content="${this.escapeHtml(description)}"/>
  <meta property="og:image" content="${this.escapeHtml(ogImageUrl)}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:alt" content="ReLoop — circular economy app"/>

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${this.escapeHtml(title)}"/>
  <meta name="twitter:description" content="${this.escapeHtml(description)}"/>
  <meta name="twitter:image" content="${this.escapeHtml(ogImageUrl)}"/>

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(160deg, #0F766E 0%, #0A1614 50%, #071512 100%);
      color: #ECFDF5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      max-width: 420px;
      width: 100%;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(94,234,212,0.25);
      border-radius: 20px;
      padding: 32px 28px;
      text-align: center;
      backdrop-filter: blur(12px);
    }
    .brand { font-size: 14px; letter-spacing: 2px; color: #5EEAD4; font-weight: 700; margin-bottom: 16px; }
    h1 { font-size: 26px; line-height: 1.25; margin-bottom: 12px; font-weight: 800; }
    p { color: #A7F3D0; line-height: 1.55; font-size: 16px; margin-bottom: 24px; }
    .cta {
      display: inline-block;
      background: #14B8A6;
      color: #fff;
      text-decoration: none;
      font-weight: 700;
      padding: 14px 28px;
      border-radius: 14px;
      font-size: 16px;
    }
    .foot { margin-top: 20px; font-size: 12px; color: rgba(167,243,208,0.7); }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">RELOOP</div>
    <h1>${this.escapeHtml(displayName)} invited you</h1>
    <p>${this.escapeHtml(description)}</p>
    <a class="cta" href="ReLoop://">Open in ReLoop</a>
    <p class="foot">Scan · Return · Repeat — together for a cleaner planet.</p>
  </div>
</body>
</html>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private escapeXml(value: string): string {
    return this.escapeHtml(value);
  }
}
