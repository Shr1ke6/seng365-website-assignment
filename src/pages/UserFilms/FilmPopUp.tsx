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
import AddIcon from '@mui/icons-material/Add';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {ElementType, SetStateAction, useState} from "react";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import dayjs, { Dayjs } from 'dayjs';
import DeleteIcon from "@mui/icons-material/Delete";
import {Alert} from "@mui/material";


interface IFilmProps {
    filmId: string | null
    userId: string | null,
    genres: {[key: number]: string},
    ageRatings: Array<string>
    saveHandler: () => void;
    buttonText: string
    buttonIcon: ElementType;
    filmImage: File | null
}

export default function FilmPopUp(props: IFilmProps) {
    const [open, setOpen] = React.useState(false);
    const [image, setImage] = React.useState<File | null>(props.filmImage)
    const [film, setFilm] = React.useState<filmFull>();
    const [genre, setGenre] = React.useState("");
    const [ageRating, setAgeRating] = React.useState("");
    const [runtime, setRuntime] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [releaseDate, setReleaseDate] = useState<Date | null>(null);
    const [reviewed, setReviewed] = useState(false);
    const [preOpen, setPreOpen] = useState(false);
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const allowedTypes = ["image/gif", "image/png", "image/jpeg"];
    const errorMessageMap : { [key: string]: string } = {
        "400": "Error: Film is missing or contains incorrect values",
        "403": "Error: Film title is not unique",
        "404": "Error: Film does not exist",
        "400image": "Error: Invalid image supplied",
        "manual": "Error: Film must have an associated image"
    }

    React.useEffect(() => {
        if (props.filmId) {
            getFilm();
        }
    }, []);

    React.useEffect(() => {
        if (props.filmId && film) {
            getFilm();
        } else {
            setRuntime('');
            setTitle('');
            setDescription('');
            setReleaseDate(null);
            setGenre('');
            setAgeRating('');
            setImage(null)
        }
    }, [open]);

    React.useEffect(() => {
        if (props.filmId && film) {
            setRuntime(film.runtime);
            setTitle(film.title);
            setDescription(film.description);
            setReleaseDate(film.releaseDate);
            setGenre(props.genres[film.genreId]);
            setAgeRating(film.ageRating);
            setReviewed(film.numReviews>0);
            setImage(props.filmImage)
        }
    }, [film]);

    const getFilm = () => {
        axios.get('http://localhost:4941/api/v1/films/'+props.filmId)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setFilm(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const handleReleaseDateChange = (date: Dayjs | null) => {
        setReleaseDate(date ? date.toDate() : null);
    };

    const updateRuntime = (event: { target: { value: React.SetStateAction<string> } }) => {
        setRuntime(event.target.value);
    };

    const updateTitle = (event: { target: { value: SetStateAction<string>; }; }) => {
        setTitle(event.target.value);
    };

    const updateDescription = (event: { target: { value: SetStateAction<string>; }; }) => {
        setDescription(event.target.value);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setErrorFlag(false);
        setErrorMessage("");
    };

    const handleSave = () => {
        updateSaveHandler();
    };

    const handleFinishWithFilm = () => {
        console.log(errorFlag, errorMessage)
        if (!errorFlag && errorMessage.length === 0) {
            handleClose();
            props.saveHandler();
        }
    };

    React.useEffect(() => {
        handleFinishWithFilm();
    }, [errorMessage]);

    const setPicture = (filmId: number) => {
        axios.put('http://localhost:4941/api/v1/films/' + filmId + '/image',
            image, // Add profilePicture.image to the request body
            {
                headers: {
                    'Content-Type': image ? image.type : null,
                    'X-Authorization': localStorage.getItem('authToken') // Set X-Authorization header
                }
            })
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                handleFinishWithFilm();
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const updateSaveHandler = () => {
        let genreId;
        for (const key in props.genres) {
            if (props.genres.hasOwnProperty(key) && props.genres[key] === genre) {
                genreId = Number(key)
            }
        }
        const formattedReleaseDate = releaseDate ? dayjs(releaseDate).format('YYYY-MM-DD hh:mm:ss') : null;
        const parsedRuntime = parseInt(runtime);
        const params: { [key: string]: any } = {};
        if (props.filmId) {
            if (title != film.title) {
                params.title = title;
            }
            if (description != film.description) {
                params.description = description;
            }
            if (genreId != film.genreId) {
                params.genreId = genreId;
            }
            if (formattedReleaseDate && formattedReleaseDate.replace(' ', 'T') + '.000Z' != film.releaseDate) {
                params.releaseDate = formattedReleaseDate;
            }
            if (ageRating != film.ageRating) {
                params.ageRating = ageRating;
            }
            if (parsedRuntime != film.runtime && runtime != "") {
                params.runtime = parsedRuntime;
            }
        } else {
            params.title = title;
            params.description = description;
            params.genreId = genreId;
            if (formattedReleaseDate) {
                params.releaseDate = formattedReleaseDate;
            }
            if (ageRating && ageRating.length > 0) {
                params.ageRating = ageRating;
            }
            if (runtime && runtime.length > 0) {
                params.runtime = parsedRuntime;
            }
        }
        if (props.filmId) {
            updateFilm(params, parseInt(props.filmId));
        } else {
            addFilm(params);
        }
    }

    const addFilm = (params: {[key: string]: any }) => {
        if (image && allowedTypes.includes(image.type)) {
            axios.post(
                'http://localhost:4941/api/v1/films',
                params,
                {
                    headers: {
                        'X-Authorization': localStorage.getItem('authToken') // Set X-Authorization header
                    }
                }
            )
                .then((response) => {
                    setPicture(response.data.filmId);
                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
        } else {
            setErrorFlag(true);
            setErrorMessage("manual");
        }
    }

    const updateFilm = (params: { [key: string]: any }, selectedFilmId: number) => {
        if (image && allowedTypes.includes(image.type)) {
            axios.patch(`http://localhost:4941/api/v1/films/${selectedFilmId}`, params, {
                    headers: {
                        'X-Authorization': localStorage.getItem('authToken'), // Set X-Authorization header
                    },
                })
                .then(() => {
                    if (image.type === "nochange") {
                        setErrorFlag(false);
                        setErrorMessage("");
                        handleFinishWithFilm();
                    } else {
                        setPicture(selectedFilmId);
                    }
                })
                .catch((error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
        } else {
            setErrorFlag(true);
            setErrorMessage("manual");
        }
    };

    const handleGenre = (genre: string | string[]) => {
        let tempGenre = "";
        if (typeof genre === "object") {
            tempGenre = genre[0];
        } else {
            tempGenre = genre;
        }
        setGenre(tempGenre);
    };

    const handleAgeRating = (ageRating: string | string[]) => {
        let tempAgeRating = "";
        if (typeof ageRating === "object") {
            tempAgeRating = ageRating[0];
        } else {
            tempAgeRating = ageRating;
        }
        setAgeRating(tempAgeRating);
    };

    const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const allowedTypes = ["image/gif", "image/png", "image/jpeg"];
            if (allowedTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImage(file);
                };
                reader.readAsDataURL(file);
            } else {
                // Invalid file type, handle the error or show a message
                setImage(null);
            }
        } else {
            setImage(null); // Reset the profile picture if no file is selected
        }
    };

    if (!reviewed) {
        return (
            <div>
                <Button variant="outlined" onClick={handleClickOpen} endIcon={<props.buttonIcon/>}>
                    {props.buttonText}
                </Button>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>
                        <strong>{props.buttonText.split(" ")[0] + ' Film'} </strong>
                    </DialogTitle>
                    {errorMessage && errorMessage.length > 0 && (
                        <Alert style={{ margin: '10px 5%' }} severity="error">
                            {errorMessageMap[errorMessage.split(" ")[errorMessage.split(" ").length-1]]}
                        </Alert>
                    )}
                    <DialogContent>
                        <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            Image *
                            <Avatar
                                src={image ? URL.createObjectURL(image) : ""}
                                style={{
                                    margin: "20px",
                                    width: "100px",
                                    height: "150px",
                                    borderRadius: "1px"
                                }}
                            />
                            <input
                                accept="image/gif, image/png, image/jpeg"
                                id="profilePicture"
                                multiple
                                type="file"
                                style={{
                                    width: "fit-content", marginLeft: "10%",
                                }}
                                onChange={handleProfilePictureChange}
                            />
                        </div>

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="title"
                            label="Title"
                            value={title}
                            onChange={updateTitle}
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="description"
                            label="Description"
                            multiline={true}
                            value={description}
                            onChange={updateDescription}
                            rows={5}
                        />
                        <div style={{display: 'flex', marginTop: '16px'}}>
                            <DropDown
                                values={Object.values(props.genres)}
                                title={'Genre *'}
                                multiple={false}
                                filterHandler={handleGenre}
                                defaultValue={film ? [props.genres[film.genreId]] : undefined}
                            />
                            <div style={{width: '5%'}}></div>
                            <DropDown
                                values={props.ageRatings}
                                title={'Age Rating'}
                                multiple={false}
                                filterHandler={handleAgeRating}
                                defaultValue={film ? [String(film.ageRating)] : undefined}
                            />
                        </div>
                        <div style={{display: 'flex', marginTop: '10px'}}>
                            <div style={{marginTop: '16px', width: '100%'}}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                        label="Release Date" disablePast={true}
                                        defaultValue={dayjs(releaseDate)}
                                        sx={{width: '100%'}}
                                        onChange={handleReleaseDateChange}
                                        readOnly={dayjs(releaseDate) < dayjs()}
                                    />
                                </LocalizationProvider>
                            </div>
                            <div style={{width: '10%'}}></div>
                            <TextField
                                margin="normal"
                                type="number"
                                fullWidth
                                id="runtime"
                                label="Runtime (minutes)"
                                value={runtime}
                                onChange={updateRuntime}
                                autoFocus
                            />
                        </div>
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
    } else {
        return <div></div>
    }

}
