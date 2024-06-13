import React  from 'react';
import './App.scss';
import Body from './components/Body';
import Header from './components/Header';
import QuizzModal from './components/QuizzModal';

function App() {

  return (
    <>
      <QuizzModal />
      <Header />
      <Body />
    </>
  );
}

export default App;
