export type NonFunctionPropertyNames<T> = {
  // biome-ignore lint/complexity/noBannedTypes: Using mapped types to filter out function properties
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;
