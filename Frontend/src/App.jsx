import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
import Verify from './pages/Verify'
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
        <Route path="/" element={isAuth ? <Home /> : <Navigate to="/Login" replace />} />
        <Route path="/Login" element={isAuth ? <Navigate to="/Dashboard" replace /> : <Login />} />
        <Route path="/Register" element={isAuth ? <Navigate to="/Dashboard" replace /> : <Register/>} />
        <Route path="/VerifyOtp" element={isAuth ? <Navigate to="/Dashboard" replace /> : <VerifyOtp />} />
        <Route path="/token/:token" element={isAuth ? <Navigate to="/Dashboard" replace /> : <Verify />} />
        <Route path="/Dashboard" element={isAuth ? <Dashboard /> : <Navigate to="/Login" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )};
    </>
  );
};

export default App
