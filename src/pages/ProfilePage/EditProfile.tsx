import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from "@mui/material/Typography";
import DropDown from "../ViewFilmsPage/DropDown";
import Avatar from "@mui/material/Avatar";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import EditNoteIcon from '@mui/icons-material/EditNote';
import {Alert, IconButton, InputAdornment, Rating} from '@mui/material';
import axios from "axios";
import {SetStateAction, SyntheticEvent, useEffect} from "react";
import Grid from "@mui/material/Grid";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from '@mui/icons-material/Visibility';
import {Visibility, VisibilityOff} from "@mui/icons-material";

interface IUserProps {
    profileUpdater: () => void,
    user: userRegister,
    profilePicture: File | null
}

export default function EditProfile(props: IUserProps) {
    const userId = localStorage.getItem('userId');
    const [showPassword, setShowPassword] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [edited, setEdited] = React.useState(false);
    const [firstName, setFirstName] = React.useState(props.user.firstName);
    const [lastName, setLastName] = React.useState(props.user.lastName);
    const [email, setEmail] = React.useState(props.user.email);
    const [currentPassword, setCurrentPassword] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [profilePicture, setProfilePicture] = React.useState<File | null>(props.profilePicture)
    const allowedTypes = ["image/gif", "image/png", "image/jpeg"];
    const errorMessageMap : { [key: string]: string } = {
        "400": "Error: Invalid values entered. Please make sure to fill out your account details in full, using a valid email address, and a password of at least 6 characters",
        "401": "Error: Incorrect Current Password",
        "403": "Error: Email is already in use, or identical current and new passwords",
        "400image": "Error: Invalid image supplied"
    }

    React.useEffect(() => {
        if (!errorFlag && errorMessage.length>0) {
            handleClose();
        }
    }, [errorMessage]);


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleClose = () => {
        setOpen(false);
        setErrorFlag(false);
        setErrorMessage("");
    };

    const handleSave = () => {
        updateUser();
        if (profilePicture && allowedTypes.includes(profilePicture.type)) {
            updateProfilePicture();
        } else if (profilePicture === null && props.profilePicture !== null) {
            deleteProfilePicture();
        } else {
            setErrorFlag(false);
            setErrorMessage("");
        }
    };

    React.useEffect(() => {
        if (edited) {
            props.profileUpdater();
        }
    }, [edited]);

    const updateProfilePicture = () => {
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
            })
            .catch(error => {
                setErrorFlag(true);
                setErrorMessage(error.toString() + "image");
            });
    }

    const deleteProfilePicture = () => {
        axios.delete(
            'http://localhost:4941/api/v1/users/' + userId + '/image',
            {
                headers: {
                    'X-Authorization': localStorage.getItem('authToken')
                }
            }
        )
            .then(() => {
                setErrorFlag(false);
                setErrorMessage("");
            })
            .catch(error => {
                setErrorFlag(true);
                setErrorMessage(error.toString() + "image");
            });
    }


    React.useEffect(() => {
        if (open) {
            setFirstName(props.user.firstName);
            setLastName(props.user.lastName);
            setEmail(props.user.email)
            setPassword("");
            setCurrentPassword("");
            setProfilePicture(props.profilePicture);
        }
        console.log(props.profilePicture);
    }, [open]);

    const handleRemoveProfilePicture = () => {
        setProfilePicture(null);
        const inputElement = document.getElementById('profilePicture') as HTMLInputElement;
        if (inputElement) {
            inputElement.value = '';
        }
    };


    const updateUser = () => {
        const params = {
            ...(firstName !== props.user.firstName && { firstName }),
            ...(lastName !== props.user.lastName && { lastName }),
            ...(email !== props.user.email && { email }),
            ...(password.length !== 0 && { password }),
            ...(currentPassword.length !== 0 && { currentPassword }),
        };
        axios.patch(`http://localhost:4941/api/v1/users/${userId}`,params, {
            headers: {
                'X-Authorization': localStorage.getItem('authToken') // Set X-Authorization header
            }
        })
            .then(() => {
                setEdited(true);
            })
            .catch(error => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

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
        <div style={{width: '100%', margin: '20px 0 10px'}}>
            <Button variant="outlined" onClick={handleClickOpen} endIcon={<EditIcon/>} style={{whiteSpace: 'nowrap'}}>
                Edit Profile
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    <strong>Update Profile</strong>
                </DialogTitle>
                <DialogContent>
                    {errorMessage && errorMessage.length > 0 && (
                        <Alert style={{ margin: '10px 0' }} severity="error">
                            {errorMessageMap[errorMessage.split(" ")[errorMessage.split(" ").length-1]]}
                        </Alert>
                    )}
                    <Grid container spacing={2}>
                        <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <Avatar
                                    src={profilePicture ? URL.createObjectURL(profilePicture) : ""}
                                    style={{
                                        margin: "20px",
                                        width: "80px",
                                        height: "80px",
                                    }}
                                />
                                {profilePicture !== null && profilePicture.size !== 0 && (
                                    <button onClick={handleRemoveProfilePicture} style={{ marginBottom: '10px' }}>
                                        Remove Avatar
                                    </button>
                                )}
                            </div>
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
                                defaultValue={props.user.firstName}
                                onChange={(event) => setFirstName(event.target.value)}/>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                autoComplete="family-name"
                                defaultValue={props.user.lastName}
                                onChange={(event) => setLastName(event.target.value)}
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
                                defaultValue={props.user.email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                label="Old Password"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                onChange={(event) => setCurrentPassword(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                label="New Password"
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
                                        {showPassword ?  <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={handleClose} style={{margin: '5px'}}>
                        Cancel
                    </Button>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}/>
                    <Button variant="contained" onClick={handleSave} style={{margin: '5px'}}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );

}
