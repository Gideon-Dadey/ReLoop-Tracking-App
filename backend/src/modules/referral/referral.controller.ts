import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReferralService } from './referral.service';

@ApiExcludeController()
@Controller()
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('join/:userName')
  async joinLanding(@Param('userName') userName: string, @Res() res: Response) {
    const displayName = await this.referralService.resolveDisplayName(userName);
    const base = this.referralService.getPublicWebUrl();
    const slug = encodeURIComponent(displayName);
    const pageUrl = `${base}/join/${slug}`;
    const ogImageUrl = `${base}/og/join/${slug}.png`;
    const brandIconUrl = `${base}/og/brand.png`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(
      this.referralService.buildLandingHtml({
        displayName,
        pageUrl,
        ogImageUrl,
        brandIconUrl,
      }),
    );
  }

  @Get('og/join/:slug')
  async joinOgImage(@Param('slug') slug: string, @Res() res: Response) {
    const decoded = decodeURIComponent(slug.replace(/\.png$/i, ''));
    const buffer = await this.referralService.generateOgImage(decoded);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  }

  @Get('og/brand.png')
  async brandOg(@Res() res: Response) {
    const buffer = await this.referralService.generateOgImage('ReLoop');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  }
}
