export interface MutableRef<T> {
  value: T;
}

export const quit: MutableRef<boolean> = { value: false };
export const shouldExit: MutableRef<boolean> = { value: false };
