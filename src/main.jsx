
// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import './index.css';  // Ensure you have a valid CSS file
// import App from './App.jsx';  // Import the main App component

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </StrictMode>
// );

  import { StrictMode } from "react";
  import { createRoot } from "react-dom/client";
  import { BrowserRouter } from "react-router-dom";
  import "./index.css";  // Ensure you have a valid CSS file
  import App from "./App.jsx";  // Import the main App component

  // Ensure that you correctly create the root and render your app
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );