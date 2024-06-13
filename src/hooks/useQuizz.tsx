import { createContext, ReactNode, useContext, useState } from 'react';

const QuizzContext = createContext({ showQuizz: false, handleQuizz: () => {} })

interface Props {
  children: ReactNode
}

const QuizzProvider = ({ children }: Props) => {
  const [showQuizz, setShowQuizz] = useState(false);

  const handleQuizz = () => {
    setShowQuizz((prev) => !prev);
  }

  return (
    <QuizzContext.Provider value={{ showQuizz, handleQuizz }}>
      {children}
    </QuizzContext.Provider>
  )
}

const useQuizz = () => {
  const { showQuizz, handleQuizz } = useContext(QuizzContext);
  return { showQuizz, handleQuizz }
}

export { useQuizz, QuizzProvider };
