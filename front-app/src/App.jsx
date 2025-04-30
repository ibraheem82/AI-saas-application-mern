import {BrowserRouter, Routes, Route } from "react-router-dom";
import Registeration from "./components/Users/Register"
import './App.css'
import Login from './components/Users/Login';
import Dashboard from './components/Users/Dashboard';
import PrivateNavbar from './components/Navbar/PrivateNavbar';
import PublicNavbar from './components/Navbar/PublicNavbar';
import Home from "./components/Home/Home";


function App() {

  return (
    <>
      <BrowserRouter>
      {/* Navbar */}
      {/* <PublicNavbar /> */}
      <PrivateNavbar />
        <Routes>
          <Route path='/register' element={<Registeration />} />
          <Route path='/login' element={<Login />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/' element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
