// React Native internals reference this global in test environments.
const globalAny = globalThis as any;
if (typeof globalAny.__DEV__ === 'undefined') {
  globalAny.__DEV__ = true;
}

afterEach(() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
});
