import { IItem, IStack } from './types';
declare function createAsyncStack<T>(): IStack<T>;
declare function useStackItems<T>(stack: IStack<T>): IItem<T>[];
export { createAsyncStack, useStackItems };
