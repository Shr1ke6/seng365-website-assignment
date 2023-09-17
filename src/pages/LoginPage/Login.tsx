import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from "axios";
import {useNavigate, Link} from "react-router-dom";
import {Alert, IconButton, InputAdornment} from '@mui/material';
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {SetStateAction} from "react";



export default function Login() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const navigate = useNavigate();
    const errorMessageMap : { [key: string]: string } = {
        "400": "Error: Missing or invalid email / password",
        "401": "Error: Incorrect email / password"
    }
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        axios.post('http://localhost:4941/api/v1/users/login', {
            "email": String(data.get('email')),
            "password": String(data.get('password'))
        })
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userId', response.data.userId);
                handleLogin();
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
                setPassword("");
            })

    };

    const handleLogin = () => {
        navigate(`/films`);
        window.location.reload()
    }

    const updateEmail = (event: { target: { value: SetStateAction<string>; }; }) => {
        setEmail(event.target.value);
    }

    const updatePassword = (event: { target: { value: SetStateAction<string>; }; }) => {
        setPassword(event.target.value);
    }

    if (localStorage.getItem('authToken')) {
        return (
            <div>
                <h1>Login</h1>
                <div style={{ color: "red" }}>
                    You are already logged in.
                </div>
            </div>
        );
    }
    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {errorMessage && errorMessage.length > 0 && (
                    <Alert style={{ margin: '10px 0' }} severity="error">
                        {errorMessageMap[errorMessage.split(" ")[errorMessage.split(" ").length-1]]}
                    </Alert>
                )}
                <Typography component="h1" variant="h3">
                    Log in
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        value={email}
                        onChange={updateEmail}
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                    />
                    <TextField
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        value={password}
                        onChange={updatePassword}
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="password"
                        InputProps={{
                            endAdornment:
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}>
                                        {showPassword ? <Visibility /> : <VisibilityOff /> }
                                    </IconButton>
                                </InputAdornment>
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                    <Grid>
                        <Grid >
                            <Link to={"/user/register"}>
                                Don't have an account? Sign Up
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}
