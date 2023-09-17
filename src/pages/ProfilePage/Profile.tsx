import React, {useState} from "react";
import {useNavigate, useParams, Link} from "react-router-dom";
import axios from "axios";
import {Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography} from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import CSS from "csstype";
import {formatReleaseDate} from "../../helpers/FilmHelperFunctions";
import ButtonAppBar from "../Misc/Navbar";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { redirect } from 'react-router-dom';
import EditProfile from "./EditProfile";


const Profile = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [user, setUser] = React.useState<userRegister>(
        {
            firstName: "",
            lastName: "",
            email: "",
            password: ""
        })
    const [profilePicture, setProfilePicture] = React.useState<File | null>(null)
    const [reviews, setReviews] = React.useState<Array<Review>>([]);
    const [similarFilms, setSimilarFilms] = React.useState<Array<Film>>([]);
    const [reviewed, setReviewed] = useState(false);
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px 40vw",
        width: "fit-content"
    }

    const filmCard: CSS.Properties = {
        padding: "10px",
        margin: "20px",
        display: "block",

    }

    const profileUpdater = () => {
        window.location.reload()
    }

    React.useEffect(() => {
        const fetchProfilePicture = async () => {
            try {
                const response = await fetch(`http://localhost:4941/api/v1/users/${id}/image`);
                const blob = await response.blob();
                const file = new File([blob], 'profilePicture.jpg', { type: 'image/jpeg' });
                setProfilePicture(file);
            } catch (error) {
                // Handle error if image retrieval fails
                console.error('Error fetching profile picture:', error);
            }
        };

        fetchProfilePicture();
        getUser()
    }, [id])
    const getUser = () => {
        axios.get(`http://localhost:4941/api/v1/users/${id}`, {
            headers: {
                'X-Authorization': localStorage.getItem('authToken') // Set X-Authorization header
            }
        })
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                setUser(response.data);
                console.log("here");
            })
            .catch(error => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    }


    if (errorFlag) {
        return (
            <div>
                <h1>My Profile</h1>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
            </div>
        )
    } else if (!localStorage.getItem('authToken')) {
        return (
            <div>
                <h1>My Profile</h1>
                <div style={{ color: "red" }}>
                    You aren't logged in.
                </div>
                <Link to={"/user/login"}>Login</Link>
            </div>
        );
    } else if (id && localStorage.getItem('userId') !== id.toString()) {
        return (
            <div>
                <h1>My Profile</h1>
                <div style={{ color: "red" }}>
                    You can't view another user's profile
                </div>
            </div>
        );
    } else {
        return (
            <Paper elevation={3} style={card}>
                <div>
                    <Grid container spacing={2}>
                        <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Avatar
                                src={profilePicture ? URL.createObjectURL(profilePicture) : ""}
                                style={{
                                    margin: "20px",
                                    width: "80px",
                                    height: "80px"
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                value={user?.firstName}
                                defaultValue={" "}
                                id="firstName"
                                label="First Name"
                                focused
                                InputProps={{
                                    readOnly: true,
                                }}
                                variant="standard"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                focused
                                value={user?.lastName}
                                defaultValue={" "}
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                autoComplete="family-name"
                                InputProps={{
                                    readOnly: true,
                                }}
                                variant="standard"
                            />
                        </Grid>
                        { user && user.email && (
                            <Grid item xs={12}>
                                <TextField
                                    focused
                                    fullWidth
                                    value={user?.email}
                                    defaultValue={" "}
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    variant="standard"
                                />
                            </Grid>
                        )}
                        <EditProfile profileUpdater={profileUpdater} user={user} profilePicture={profilePicture}></EditProfile>
                    </Grid>
                </div>
            </Paper>
        )
    }
}

export default Profile;