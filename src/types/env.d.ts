declare global {
  namespace NodeJS {
    interface ProcessEnv {
      USER: string;
      HOST: string;
      DATABASE: string;
      PASSWORD: string;
      PORT: string;
      API_KEY: string;
      ACCESS_TOKEN_SECRET: string;
      GITHUB_CLIENT_SECRET: string;
      GITHUB_CLIENT_ID: string;
    }
  }
}

export {}
