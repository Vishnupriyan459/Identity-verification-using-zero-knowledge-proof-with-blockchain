import { useState } from 'react'

import './App.css'
import IdentityVerificationForm from './IdentityVerificationForm'

function App() {
  const [count, setCount] = useState(0)

  return (
    <IdentityVerificationForm />
  )
}

export default App
