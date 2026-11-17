import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ARAppPage } from './pages/ARAppPage';
export const App = () => {
    return (<Router>
      <Routes>
        <Route path="/" element={<LandingPage />}/>
        <Route path="/app" element={<ARAppPage />}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </Router>);
};
export default App;
