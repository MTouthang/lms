import { Routes, Route } from "react-router";
import Homepage from "./pages/Homepage.jsx";
import Signup from "./pages/Signup.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
