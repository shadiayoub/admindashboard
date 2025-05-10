// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // 1. Preserve existing SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // 2. Wallet-specific webpack configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      // Core package aliases
      '@wagmi/core$': require.resolve('@wagmi/core'),
      'viem$': require.resolve('viem'),
      'viem/actions$': require.resolve('viem/actions'),
      'viem/chains$': require.resolve('viem/chains')
    };

    // 3. Required externals for wallet functionality
    config.externals.push(
      'pino-pretty',
      'lokijs',
      'encoding',
      'node:async_hooks' // Additional for better Node compatibility
    );

    return config;
  },

  // 4. Server external packages configuration
  serverExternalPackages: [
    '@wagmi/core',
    'viem',
    '@walletconnect/universal-provider',
    '@web3modal/standalone' // Added for our current implementation
  ],

  // 5. Environment variables
  env: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  },

  // 6. React configuration
  reactStrictMode: true,

  // 7. Enable ESM support
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;
