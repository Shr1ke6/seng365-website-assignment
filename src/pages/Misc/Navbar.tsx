import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {Link, Route} from "react-router-dom";
import axios from "axios";
import Profile from "../ProfilePage/Profile";

export default function ButtonAppBar() {
    const authToken = localStorage.getItem('authToken');
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const handleLogout = () => {
        localStorage.clear()
        axios.post('http://localhost:4941/api/v1/users/logout')
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            })
        window.location.reload()
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Link to={"/films"} style={{ textDecoration: 'none', color: 'white' }}>
                        <Button color="inherit" style={{fontWeight: '600'}}>Films</Button>
                    </Link>
                    {authToken && (
                        <Link to={"/user/films"} style={{ textDecoration: 'none', color: 'white' }}>
                            <Button color="inherit" style={{fontWeight: '600'}}>My Films</Button>
                        </Link>
                    )}
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} />
                    {authToken ? (
                        <><Link to={`/user/${localStorage.getItem('userId')}`}
                                style={{textDecoration: 'none', color: 'white'}}>
                            <Button color="inherit" style={{fontWeight: '600'}}>My Profile</Button>
                        </Link><Button onClick={handleLogout} color="inherit" style={{fontWeight: '600'}}>Logout</Button></>
                    ) : (
                        <Link to={"/user/login"} style={{textDecoration: 'none', color: 'white'}}>
                            <Button color="inherit" style={{fontWeight: '600'}}>Login</Button>
                        </Link>
                    )}
                </Toolbar>
            </AppBar>
        </Box>
    );
}
