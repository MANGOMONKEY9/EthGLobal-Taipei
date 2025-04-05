declare module 'use-sync-external-store/shim' {
  const useSyncExternalStore: <T>(
    subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => T,
    getServerSnapshot?: () => T
  ) => T;
  export default useSyncExternalStore;
}

declare module 'use-sync-external-store/shim/with-selector' {
  const useSyncExternalStoreWithSelector: <Snapshot, Selection>(
    subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => Snapshot,
    getServerSnapshot: undefined | null | (() => Snapshot),
    selector: (snapshot: Snapshot) => Selection,
    isEqual?: ((a: Selection, b: Selection) => boolean) | undefined
  ) => Selection;
  export default useSyncExternalStoreWithSelector;
}

declare module 'use-sync-external-store/shim/with-selector.js' {
  export * from 'use-sync-external-store/shim/with-selector';
  export { default } from 'use-sync-external-store/shim/with-selector';
}

declare module 'use-sync-external-store/shim/index.js' {
  export * from 'use-sync-external-store/shim';
  export { default } from 'use-sync-external-store/shim';
} 