// Stand-in for virtual:pwa-register during the build-time render (never runs in the browser).
export const registerSW = () => () => Promise.resolve();
