import React from "react";
import axios from "axios";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton, TableCell,
    TextField,
    Typography
} from "@mui/material";
import {formatReleaseDate} from "../../helpers/FilmHelperFunctions";
import CSS from 'csstype';
import {useNavigate} from "react-router-dom";


interface IFilmProps {
    film: Film
}
const SimilarFilmListObject = (props: IFilmProps) => {
    const [film] = React.useState<Film>(props.film)
    const [allGenres, setAllGenres] = React.useState<{ [key: number]: string }>({});
    const filmImageUrl = `http://localhost:4941/api/v1/films/${film.filmId}/image`;
    const directorImageUrl = `http://localhost:4941/api/v1/users/${film.directorId}/image`;
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const navigate = useNavigate();

    React.useEffect(() => {
        getGenres();
    }, []);



    const getGenres = () => {
        axios.get('http://localhost:4941/api/v1/films/genres')
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                const genresData = response.data;

                const genresDictionary = genresData.reduce((acc: { [key: number]: string }, genre: { genreId: number, name: string }) => {
                    acc[genre.genreId] = genre.name;
                    return acc;
                }, {});
                setAllGenres(genresDictionary);
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const handleOnClick = () => {
        navigate(`/films/${film.filmId}`);
    }

    return (
        <Card sx={{ display: 'flex', margin: '10px 0', cursor: 'pointer' }} onClick={handleOnClick}>
            <CardMedia
                component="img"
                sx={{ width: 100, height: 150, objectFit: 'fill' }}
                image={filmImageUrl}
                alt={film.title + ' poster'}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component="div" variant="h5">
                        {film.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" component="div">
                        {allGenres[film.genreId]} • {film.ageRating}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" component="div">
                        {formatReleaseDate(film.releaseDate)} • {film.rating}/10
                    </Typography>
                </CardContent>

            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column'}}>
                <CardContent sx={{ flex: '0.5 0 auto' }}>
                    <Typography variant="subtitle1" color="text.secondary" component="div">
                        Directed By
                    </Typography>
                    <Typography variant="subtitle1" color="text.primary" component="div" sx={{textAlign: 'center', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                        {film.directorFirstName} {film.directorLastName} <Avatar src={directorImageUrl} style={{margin: '0 10px'}}/>
                    </Typography>
                </CardContent>
            </Box>
        </Card>
    );
}
export default SimilarFilmListObject
