import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Collection from "@/pages/Collection";
import AdminUpload from "@/pages/AdminUpload";
import PlayPage from "@/pages/PlayPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Collection />} />
        <Route path="/admin" element={<AdminUpload />} />
        <Route path="/v/:id" element={<PlayPage />} />
      </Routes>
    </Router>
  );
}