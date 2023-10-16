import { useCaughtError } from '@exah/salo'

export function ErrorStatus() {
  const [error, recover] = useCaughtError()

  if (error instanceof Error) {
    return (
      <>
        Error: {error.message}{' '}
        <button type="button" onClick={recover}>
          Recover
        </button>
      </>
    )
  }

  return <>Something went wrong</>
}
