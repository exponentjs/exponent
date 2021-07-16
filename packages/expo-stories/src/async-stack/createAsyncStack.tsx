import * as React from 'react';
import { IItem, IPushOptions, IReplaceOptions, IStack, IStackEvent } from './types';

const generateRouteKey = () => `${new Date().getTime()}`;

function createAsyncStack<T>(): IStack<T> {
  let keys: string[] = [];
  let lookup: Record<string, IItem<T>> = {};

  const pushResolvers: Record<string, Function> = {};
  const popResolvers: Record<string, Function> = {};

  let listeners: any[] = [];

  function push(pushOptions: IPushOptions<T>) {
    const key = pushOptions.key || generateRouteKey();

    if (keys.includes(key)) {
      return Promise.resolve(key);
    }

    keys.push(key);

    lookup[key] = {
      ...pushOptions,
      key,
      status: 'pushing',
    };

    const promise = new Promise<string>(resolve => {
      pushResolvers[key] = resolve;
    });

    emit('pushstart', key);

    return promise;
  }

  function onPushEnd(key: string) {
    const item = lookup[key];

    if (item) {
      item.status = 'settled';

      emit('pushend', key);

      const resolver = pushResolvers[key];

      if (resolver) {
        resolver(key);
      }
    }
  }

  function pop(amount = 1, startIndex = 0) {
    const promises: any[] = [];

    if (amount === -1) {
      // pop them all
      amount = keys.length;
    }

    for (let i = 1; i <= amount; i++) {
      const key = keys[keys.length - startIndex - i];
      const item = lookup[key];

      if (item) {
        item.status = 'popping';

        const promise = new Promise(resolve => {
          popResolvers[key] = resolve;
        });

        promises.push(promise);
        emit('popstart', key);
      }
    }

    return Promise.all(promises) as Promise<string[]>;
  }

  function onPopEnd(key: string) {
    keys = keys.filter(k => k !== key);

    const resolver = popResolvers[key];

    if (resolver) {
      resolver(key);
    }

    delete popResolvers[key];
    delete pushResolvers[key];

    emit('popend', key);
  }

  async function replace(replaceOptions: IReplaceOptions<T>) {
    const itemsToPop = replaceOptions.replaceAmount != null ? replaceOptions.replaceAmount : 1;

    const promise2 = await push(replaceOptions);
    const promise1 = await pop(itemsToPop, 1);

    return Promise.all([promise2, promise1]);
  }

  function subscribe(listener: any) {
    listeners.push(listener);

    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }

  function emit(action: IStackEvent, key: string) {
    listeners.forEach(listener => {
      const state = getState();
      listener({ ...state, key, action });
    });
  }

  function getItemByKey(key: string) {
    return lookup[key];
  }

  function getState() {
    const items = keys.map(key => lookup[key]);

    return {
      items,
      getItemByKey,
    };
  }

  function update(index: number, updates: T) {
    const key = keys[index];

    console.log({ updates });

    lookup[key] = {
      ...lookup[key],
      ...updates,
    };

    emit('itemupdate', key);
  }

  return {
    push,
    onPushEnd,
    pop,
    onPopEnd,
    replace,
    subscribe,
    getState,
    update,
  };
}

function useStackItems<T>(stack: IStack<T>) {
  const [items, setItems] = React.useState(() => stack.getState().items);

  React.useEffect(() => {
    const unsubscribe = stack.subscribe(({ items }) => {
      setItems(items);
    });

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [stack]);

  return items;
}

export { createAsyncStack, useStackItems };
