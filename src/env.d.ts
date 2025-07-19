declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NEXT_PUBLIC_CURRENT_COMMIT: string;
            NEXT_PUBLIC_CURRENT_BRANCH: string;
            NEXT_PUBLIC_CURRENT_TAG: string | undefined;
            NEXT_PUBLIC_CURRENT_VERSION: string;
            NEXT_PUBLIC_IS_INSIDE_DOCKER: 'true' | 'false' | string;
            NEXT_PUBLIC_CURRENT_COMMIT_TIMESTAMP: string;
            NEXT_PUBLIC_REMOTE_URL: string | undefined;
            NEXT_PUBLIC_NODEJS_VERSION: string;
            NEXT_PUBLIC_GITHUB_ACTIONS_RUN_ID: string | undefined;
        }
    }
}
