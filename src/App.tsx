import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Films from "./pages/ViewFilmsPage/Films";
import Film from "./pages/ViewFilmPage/Film";
import Register from "./pages/RegisterPage/Register";
import Login from "./pages/LoginPage/Login";
import UserFilms from "./pages/UserFilms/UserFilms"
import NotFound from "./pages/NotFound";
import ButtonAppBar from "./pages/Misc/Navbar";
import Profile from "./pages/ProfilePage/Profile";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {indigo, purple, red} from "@mui/material/colors";

function App() {


    const theme = createTheme({

        palette: {
            primary: {
                light: '#354158',
                main: '#03122f',
                dark: '#020c20',
                contrastText: '#fff',
            },
        }
    });

    return (
      <div className="App">
          <ThemeProvider theme={theme}>
            <Router>
              <div>
              <ButtonAppBar></ButtonAppBar>
                <Routes>
                  See https://v5.reactrouter.com/web/guides/quick-start
                      SENG365 - Structuring Client-side Applications in React 3 / 10
                  <Route path="/films" element={<Films/>}/>
                  <Route path="/films/:id" element={<Film/>}/>
                  <Route path="/user/register" element={<Register/>}/>
                  <Route path="/user/login" element={<Login/>}/>
                  <Route path ="/user/films" element={<UserFilms/>}/>
                  <Route path="/user/:id" element={<Profile/>}/>
                  <Route path="*" element={<NotFound/>}/>
                </Routes>
              </div>
            </Router>
          </ThemeProvider>
      </div>
  );
}

export default App;
