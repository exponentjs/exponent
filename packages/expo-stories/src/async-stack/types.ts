export type IStackEvent =
  | "pushstart"
  | "pushend"
  | "popstart"
  | "popend"
  | "replace"
  | "itemupdate";

export type IStatus = "pushing" | "popping" | "settled";

export type ListenerFn<T> = ({
  items,
}: {
  action: IStackEvent;
  key: string;
  items: IItem<T>[];
  getItemByKey: (key: string) => T | undefined;
}) => void;

export type IItem<T> = T & { key: string; status: IStatus };
export type IReplaceOptions<T> = T & { replaceAmount?: number; key?: string };
export type IPushOptions<T> = T & { key?: string };
export interface IStack<T> {
  push: (pushOptions: IPushOptions<T>) => Promise<string>;
  pop: (amount?: number) => Promise<string[]>;
  replace: (replaceOptions: IReplaceOptions<T>) => Promise<any>;
  onPushEnd: (key: string) => void;
  onPopEnd: (key: string) => void;
  subscribe: (listener: ListenerFn<T>) => () => void;
  getState: () => {
    items: IItem<T>[];
    getItemByKey: (key: string) => T | undefined;
  };
  update: (index: number, updates: T) => void;
}
