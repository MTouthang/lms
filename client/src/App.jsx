import { Routes, Route } from "react-router";
import Homepage from "./pages/Homepage.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import About from "./pages/About.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}

export default App;
