WIP - Not published yet

---

# 🗂 use-async-state

[![](https://flat.badgen.net/npm/v/use-async-state?cache=600)](https://www.npmjs.com/package/use-async-state) [![](https://flat.badgen.net/bundlephobia/minzip/use-async-state?cache=600)](https://bundlephobia.com/result?p=use-async-state) ![](https://flat.badgen.net/travis/exah/use-async-state?cache=600)

#### Easy to use hook for capturing async state

- [x] Only ~375B minified and gziped
- [x] Simple hooks API
- [x] TypeScript

## 📦 Install

```sh
$ npm i -S use-async-state
```

```sh
$ yarn add use-async-state
```

## 📖 Docs

### `useAsyncState`

Requests data and preserves the result to the state.

```ts
type useAsyncState<T> = (initialState?: AsyncState<T>) => AsyncState<T>
```

`AsyncState` can be in 4 different forms – depending on the promise's state.

```ts
export type AsyncState<T> =
  // initial
  | { isReady: false; isLoading: false; error: null; result: undefined }
  // fulfilled
  | { isReady: true; isLoading: false; error: null; result: T }
  // pending
  | { isReady: boolean; isLoading: true; error: Error | null; result?: T }
  // rejected
  | { isReady: false; isLoading: false; error: Error; result?: T }
```


## 🔗 Related

### Packages

- [`ya-fetch`](https://github.com/exah/ya-fetch) - a lightweight wrapper around `fetch`

---

MIT © [John Grishin](http://johngrish.in)
