import { createClient } from 'salo'
import { createContext } from 'react'

export const ClientContext = createContext(createClient<any, any>())
