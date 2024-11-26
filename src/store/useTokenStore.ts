import { create } from 'zustand';

interface TokenInfo {
  token: string;
  nickname: string;
  uid: number;
}

interface TokenStore {
  tokens: Record<string, TokenInfo>;
  setToken: (driveName: string, tokenInfo: TokenInfo) => void;
  clearTokens: () => void;
}

export const useTokenStore = create<TokenStore>((set) => ({
  tokens: {},
  setToken: (driveName, tokenInfo) =>
    set((state) => ({
      tokens: {
        ...state.tokens,
        [driveName]: tokenInfo,
      },
    })),
  clearTokens: () => set({ tokens: {} }),
}));