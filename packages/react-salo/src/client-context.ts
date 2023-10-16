import { createContext } from 'react'
import { createClient } from 'salo'

export const LoaderClientContext = createContext(createClient<any, any>())
