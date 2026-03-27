import { Injectable, Module } from '@nestjs/common';
import * as crypto from 'crypto';

export interface IVerificationProvider {
  signTransaction(data: any): string;
  verifyTransaction(signature: string, data: any): boolean;
}

@Injectable()
export class LocalSignatureProvider implements IVerificationProvider {
  private readonly secret = 'reloop_node_verification_secret';

  signTransaction(data: any): string {
    return crypto
      .createHmac('sha256', this.secret)
      .update(JSON.stringify(data))
      .digest('hex');
  }

  verifyTransaction(signature: string, data: any): boolean {
    const expected = this.signTransaction(data);
    return signature === expected;
  }
}

@Module({
  providers: [
    {
      provide: 'VERIFICATION_PROVIDER',
      useClass: LocalSignatureProvider,
    },
  ],
  exports: ['VERIFICATION_PROVIDER'],
})
export class BlockchainModule {}
