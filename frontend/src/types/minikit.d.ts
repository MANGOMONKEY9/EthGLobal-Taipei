declare module '@worldcoin/minikit-js' {
  export enum VerificationLevel {
    Orb = 'orb',
    Device = 'device'
  }

  export interface VerifyCommandInput {
    action: string;
    signal?: string;
    verification_level?: VerificationLevel;
  }

  export interface ISuccessResult {
    status: 'success';
    proof: string;
    merkle_root: string;
    nullifier_hash: string;
    verification_level: VerificationLevel;
    version: number;
  }

  export interface IErrorResult {
    status: 'error';
    message: string;
  }

  export type VerifyResult = {
    finalPayload: ISuccessResult | IErrorResult;
  };

  export class MiniKit {
    static isInstalled(): boolean;
    static commandsAsync: {
      verify(input: VerifyCommandInput): Promise<VerifyResult>;
    };
  }
} 