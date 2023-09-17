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
import {Alert, Rating} from '@mui/material';
import axios from "axios";
import {SyntheticEvent} from "react";


interface IFilmProps {
    filmId: string | undefined,
    reviewUpdater: () => void
}

export default function FilmPopUp(props: IFilmProps) {
    const [open, setOpen] = React.useState(false);
    const [review, setReview] = React.useState("");
    const [rating, setRating] = React.useState(0);
    const [placedReview, setPlacedReview] = React.useState<boolean>();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const errorMessageMap : { [key: string]: string } = {
        "400": "Error: Make sure to add a rating to your review",
    }

    const updateReview = (event: { target: { value: React.SetStateAction<string> } }) => {
        setReview(event.target.value);
    };
    const updateRating = (event: React.ChangeEvent<{}>, value: number | null) => {
        if (value !== null) {
            setRating(value);
        }
    };

    React.useEffect(() => {
        setReview("");
        setRating(0);
    }, [open]);

    React.useEffect(() => {
        if (placedReview) {
            props.reviewUpdater();
            handleClose();
        }
    }, [placedReview]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = () => {
        placeReview();
    };

    const placeReview = () => {
        axios.post(`http://localhost:4941/api/v1/films/${props.filmId}/reviews`,{rating: rating, review: review == "" ? " " : review}, {
            headers: {
                'X-Authorization': localStorage.getItem('authToken') // Set X-Authorization header
            }
        })
            .then(() => {
                setErrorFlag(false);
                setErrorMessage("");
                setPlacedReview(true);
            })
            .catch(error => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    return (
        <div>
            <Button variant="outlined" onClick={handleClickOpen} endIcon={<EditNoteIcon/>} style={{whiteSpace: 'nowrap'}}>
                Write Review
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    <strong>Add Review</strong>
                </DialogTitle>
                {errorMessage && errorMessage.length > 0 && (
                    <Alert style={{ margin: '10px 5%' }} severity="error">
                        {errorMessageMap[errorMessage.split(" ")[errorMessage.split(" ").length-1]]}
                    </Alert>
                )}
                <DialogContent>
                    <Rating name="customized-10" defaultValue={2} max={10} value={rating} onChange={updateRating} />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="description"
                        label="Description"
                        multiline={true}
                        value={review}
                        onChange={updateReview}
                        rows={5}
                    />
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
