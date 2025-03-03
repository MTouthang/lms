import { Routes, Route } from "react-router";
import Homepage from "./pages/Homepage.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import PageNotFound from "./pages/Notfound.jsx";
import Denied from "./pages/Denied.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {/* TODO: access denied configure the logic  */}
        <Route path="/denied" element={<Denied />} />
        <Route path="/*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
