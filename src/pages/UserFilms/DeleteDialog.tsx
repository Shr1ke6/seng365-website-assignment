import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

interface IFilmProps {
    filmId: string,
    filmName: string,
    onDeletion: () => void
}

export default function DeleteDialog(props: IFilmProps) {
    const [open, setOpen] = React.useState(false);
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [deleted, setDeleted] = React.useState<Boolean>();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = () => {
        setOpen(false);
        axios.delete(
            `http://localhost:4941/api/v1/films/${props.filmId}`,
            {
                headers: {
                    'X-Authorization': localStorage.getItem('authToken') // Set X-Authorization header
                }
            }
        )

            .then(() => {
                setErrorFlag(false);
                setErrorMessage("");
                setDeleted(true);
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    React.useEffect(() => {
        props.onDeletion();
    }, [deleted]);

    return (
        <div>
            <Button variant="outlined" endIcon={<DeleteIcon />} onClick={handleClickOpen}>
                Delete Film
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" sx={{ display: 'flex'}}>
                    {"Are you sure you want to delete "+ props.filmName + "?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Once deleted, all data on the film will be lost
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant='text' onClick={handleClose}>Cancel</Button>
                    <Button variant='text' onClick={handleDelete} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
