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
import {Alert, IconButton, InputAdornment} from "@mui/material";
import {ChangeEventHandler, SetStateAction} from "react";
import axios from "axios";
import {useNavigate, Link} from "react-router-dom";
import {Visibility, VisibilityOff} from "@mui/icons-material";

export default function Register() {
    const [profilePicture, setProfilePicture] = React.useState<File | null>(null)
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [userId, setUserId] = React.useState()
    const [registerSuccessful, setRegisterSuccessful] = React.useState(false)
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = React.useState(false);
    const [authToken, setAuthToken] = React.useState();
    const errorMessageMap : { [key: string]: string } = {
        "400": "Error: Invalid values entered. Please make sure to fill out your account details in full, using a valid email address, and a password of at least 6 characters",
        "403": "Error: Email already in use"
    }

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        axios.post('http://localhost:4941/api/v1/users/register', {
            "firstName": String(data.get('firstName')),
            "lastName": String(data.get('lastName')),
            "email": String(data.get('email')),
            "password": String(data.get('password'))
        })
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setEmail(String(data.get('email')))
                setPassword(String(data.get('password')))
                setUserId(response.data.userId)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setPassword("")
            })
        };


    React.useEffect(() => {
        if (profilePicture && ["image/gif", "image/png", "image/jpeg", "image/jpg"].includes(profilePicture.type)) {
            axios.put(
                'http://localhost:4941/api/v1/users/' + userId + '/image',
                profilePicture, // Add profilePicture.image to the request body
                {
                    headers: {
                        'Content-Type': profilePicture ? profilePicture.type : null,
                        'X-Authorization': localStorage.getItem('authToken') // Set X-Authorization header
                    }
                }
            )
                .then(() => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    handleLogin();
                })
                .catch(error => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });

        } else if (authToken) {
            handleLogin();
        }
    }, [authToken]);

    React.useEffect(() => {
        if (email.length>0, password.length>0, userId) {
            axios.post('http://localhost:4941/api/v1/users/login', {"email": email, "password": password})
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    localStorage.setItem('authToken', response.data.token);
                    localStorage.setItem('userId', response.data.userId);
                    setAuthToken(response.data.token);
                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                })
        }
    }, [userId, email, password])

    const handleLogin = () => {
        navigate(`/films`);
        window.location.reload()
    }


    const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const allowedTypes = ["image/gif", "image/png", "image/jpeg"];
            if (allowedTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setProfilePicture(file);
                };
                reader.readAsDataURL(file);
            } else {
                // Invalid file type, handle the error or show a message
                setProfilePicture(null);
            }
        } else {
            setProfilePicture(null); // Reset the profile picture if no file is selected
        }
    };


    return (
        <Container component="main" maxWidth="xs">
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
                    Register
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Avatar
                                src={profilePicture ? URL.createObjectURL(profilePicture) : ""}
                                style={{
                                    margin: "20px",
                                    width: "80px",
                                    height: "80px",
                                }}
                            />
                            <input
                                accept="image/gif, image/png, image/jpeg"
                                id="profilePicture"
                                multiple
                                type="file"
                                style={{
                                    width: "fit-content",
                                }}
                                onChange={handleProfilePictureChange}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="given-name"
                                name="firstName"
                                required
                                fullWidth
                                id="firstName"
                                label="First Name"
                                autoFocus
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                autoComplete="family-name"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                value={password}
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="new-password"
                                onChange={(event) => setPassword(event.target.value)}
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
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up
                    </Button>
                    <Grid>
                        <Grid>
                            <Link to={"/user/login"}>
                                Already have an account? Sign In
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}
