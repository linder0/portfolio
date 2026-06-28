import { createContext, useContext, useState } from 'react'

const PanelContext = createContext()

export const PanelProvider = ({ children }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  return (
    <PanelContext.Provider value={{ isPanelOpen, setIsPanelOpen }}>
      {children}
    </PanelContext.Provider>
  )
}

export const usePanelState = () => useContext(PanelContext)

