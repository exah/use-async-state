WIP - Not published yet

---

# 🗂 use-async-state

[![](https://flat.badgen.net/npm/v/use-async-state?cache=600)](https://www.npmjs.com/package/use-async-state) [![](https://flat.badgen.net/bundlephobia/minzip/use-async-state?cache=600)](https://bundlephobia.com/result?p=use-async-state) ![](https://flat.badgen.net/travis/exah/use-async-state?cache=600)

#### Easy to use hook for capturing async state

- [x] Only ~200B minified and gziped
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
type useAsyncState<T> = () => [AsyncState<T>, AsyncActions<T>]
```

`AsyncState` can be in 5 different forms – depending on the promise state.

```ts
export type AsyncState<T> =
  | { type: 'idle'; data?: undefined; error?: undefined }
  | { type: 'loading'; data?: T; error?: Error }
  | { type: 'ready'; data: T; error?: undefined }
  | { type: 'updating'; data: T; error?: undefined }
  | { type: 'failed'; data?: T; error: Error }
```

```ts
export type AsyncActions<T> = {
  start(): void
  finish(payload: T | Error): void
}
```

## 🔗 Related

### Packages

- [`ya-fetch`](https://github.com/exah/ya-fetch) - a lightweight wrapper around `fetch`

---

MIT © [John Grishin](http://johngrish.in)
