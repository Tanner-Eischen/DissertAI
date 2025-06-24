import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Editor from './pages/Editor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
