import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
import Dashboard from './pages/Dashboard'
import { ToastContainer } from 'react-toastify';
import { AppData } from './context/AppContext'
import Loading from './Loading'

const App = () => {
  const {isAuth, loading } = AppData()
  return (
    <>
    {loading ? (
      <Loading/>
    ): (<BrowserRouter>
      <Routes>
        <Route path="/" element={isAuth ? <Home /> : <Login/>} />
        <Route path="/Login" element={isAuth ? <Home /> : <Login/>} />
        <Route path="/Register" element={<Register />} />
        <Route path="/VerifyOtp" element={isAuth ?  <Home /> : <VerifyOtp/>} />
        <Route path="/Dashboard" element={isAuth ? <Dashboard /> : <Login />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )};
    </>
  );
};

export default App
