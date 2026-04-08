import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Collection from "@/pages/Collection";
import AdminUpload from "@/pages/AdminUpload";
import PlayPage from "@/pages/PlayPage";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Collection />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminUpload />} />
        </Route>
        <Route path="/v/:id" element={<PlayPage />} />
      </Routes>
    </Router>
  );
}