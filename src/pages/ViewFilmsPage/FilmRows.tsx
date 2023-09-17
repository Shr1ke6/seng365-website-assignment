import { Avatar, Dialog, DialogTitle, TableCell, TableRow } from "@mui/material";
import { formatReleaseDate } from "../../helpers/FilmHelperFunctions";
import React from "react";
import UserFilms from "../UserFilms/UserFilms";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FilmPopUp from "../UserFilms/FilmPopUp";
import DeleteDialog from "../UserFilms/DeleteDialog";

interface IFilmProps {
    films: Array<Film>,
    genres: { [key: number]: string }
    userId: number | null
    editSaveHandler: (() => void) | null
    onDeletionHandler: () => void
}

const FilmRows = (props: IFilmProps) => {
    const navigate = useNavigate();
    const ageRatings = [
        'G', 'PG', 'M', 'R13', 'R16', 'R18', 'TBC'
    ];

    const [filmImages, setFilmImages] = React.useState<{ [filmId: number]: File | null }>({});

    React.useEffect(() => {
        const fetchProfilePicture = async (filmId: number) => {
            try {
                const filmImageUrl = `http://localhost:4941/api/v1/films/${filmId}/image`;
                const response = await fetch(filmImageUrl);
                const blob = await response.blob();
                const file = new File([blob], 'profilePicture.jpg', { type: 'image/jpeg' });

                setFilmImages((prevImages) => ({
                    ...prevImages,
                    [filmId]: file,
                }));
            } catch (error) {
                console.error('Error fetching profile picture:', error);
            }
        };

        props.films.forEach((row: Film) => {
            fetchProfilePicture(row.filmId);
        });
    }, [props.films]);

    const handleRowClick = (row: Film) => {
        navigate(`/films/${row.filmId}`);
    }


    return (
        <>
            {props.films.map((row: Film) => {
                // Construct the URL for fetching the film image based on the filmId
                const directorImageUrl = `http://localhost:4941/api/v1/users/${row.directorId}/image`;
                const image = filmImages[row.filmId];

                return (
                    <TableRow hover tabIndex={-1} key={row.filmId} style={{ cursor: 'pointer' }}>
                        <TableCell>
                            <img src={image ? URL.createObjectURL(image) : ""} alt=" " width="60px" height="90px" />
                        </TableCell>
                        <TableCell onClick={() => handleRowClick(row)}>{row.title}</TableCell>
                        <TableCell onClick={() => handleRowClick(row)}>{row.ageRating}</TableCell>
                        <TableCell onClick={() => handleRowClick(row)}>{formatReleaseDate(row.releaseDate)}</TableCell>
                        <TableCell onClick={() => handleRowClick(row)}>{props.genres[row.genreId]}</TableCell>
                        <TableCell onClick={() => handleRowClick(row)}>
                            <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                                <Avatar src={directorImageUrl} style={{ marginRight: '10px' }} /> {row.directorFirstName} {row.directorLastName}
                            </div>
                        </TableCell>
                        <TableCell onClick={() => handleRowClick(row)}>{row.rating}</TableCell>
                        <TableCell align="right">
                        {props.userId == row.directorId && props.editSaveHandler !== null &&  (
                                <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
                                    <FilmPopUp filmId={row.filmId.toString()} userId={localStorage.getItem('userId')}
                                               genres={props.genres} ageRatings={ageRatings}
                                               saveHandler={props.editSaveHandler} buttonIcon={EditIcon} buttonText={'Edit Film'} filmImage={image}></FilmPopUp>
                                    <div style={{width: '10px'}}></div>
                                    <DeleteDialog filmId={row.filmId.toString()} filmName={row.title} onDeletion={props.onDeletionHandler}></DeleteDialog>
                                </div>

                        )}
                        </TableCell>
                    </TableRow>
                );
            })}
        </>
    );
}

export default FilmRows;
