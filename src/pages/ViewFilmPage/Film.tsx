import React, {useState} from "react";
import {useNavigate, useParams, Link} from "react-router-dom";
import axios from "axios";
import {Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography} from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import CSS from "csstype";
import SimilarFilmListObject from "./SimilarFilmListObject";
import {formatReleaseDate} from "../../helpers/FilmHelperFunctions";
import ButtonAppBar from "../Misc/Navbar";
import FilmPopUp from "./ReviewFilm";
import Button from "@mui/material/Button";


const Film = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [film, setFilm] = React.useState<filmFull>({
        ageRating: "",
        directorFirstName: "",
        directorId: 0,
        directorLastName: "",
        genreId: 0,
        rating: 0,
        releaseDate: "",
        title: "",
        filmId:0,
        description: "",
        numReviews:0,
        runtime:0
    })
    const [reviews, setReviews] = React.useState<Array<Review>>([]);
    const [similarFilms, setSimilarFilms] = React.useState<Array<Film>>([]);
    const [reviewed, setReviewed] = useState(false);
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px 30vw",
        width: "fit-content"
    }

    const filmCard: CSS.Properties = {
        padding: "10px",
        margin: "20px",
        display: "block",

    }

    const updateReviews = () => {
        getReviews();
        getFilm();
    }

    React.useEffect(() => {
        getFilm()
        getReviews()
    }, [id])

    React.useEffect(() => {
        if (reviews.length > 0 && localStorage.getItem('userId')) {
            for (let i = 0; i < reviews.length; i++) {
                const review = reviews[i];
                if (review.reviewerId.toString() == localStorage.getItem('userId')) {
                    setReviewed(true);
                }
            }
        }


    }, [reviews])

    const getFilm = () => {
        axios.get('http://localhost:4941/api/v1/films/'+id)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setFilm(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getReviews = () => {
        axios.get('http://localhost:4941/api/v1/films/'+id+'/reviews')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setReviews(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    React.useEffect(() => {
        const getSimilarFilms = () => {
            axios.get('http://localhost:4941/api/v1/films/', { params: {genreId: film.genreId, directorId: film.directorId} })
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    const filteredFilms = response.data.films.filter((f: { filmId: number; }) => f.filmId !== film.filmId);
                    setSimilarFilms(filteredFilms)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }

        getSimilarFilms()

    }, [film])

    const similar_film_rows = () => similarFilms.map((film: Film) => <SimilarFilmListObject key={ film.filmId + film.title } film={film}
    />)

    const review_items = () => {
        return reviews.map((item: Review) => {
            const reviewerImageUrl = `http://localhost:4941/api/v1/users/${item.reviewerId}/image`;
            return (
                <ListItem alignItems="flex-start"
                          key={item.reviewerId}
                          disableGutters>
                    <ListItemAvatar>
                        <Avatar src={reviewerImageUrl}/>
                    </ListItemAvatar>
                    <ListItemText
                        primary={item.reviewerFirstName + ' ' + item.reviewerLastName + ' - ' + item.rating + '/10'}
                        secondary={
                            <React.Fragment>
                                <Typography
                                    sx={{ display: 'inline' }}
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                >
                                </Typography>
                                {item.review}
                            </React.Fragment>
                        }
                    />
                </ListItem>
            );
        });
    };

    if (errorFlag) {
        return (
            <div>
                <h1>Film</h1>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
            </div>
        )
    } else {
        return (
            <Paper elevation={3} style={card}>
                <div style={{ display: 'flex'}}>
                    <div>
                        <img src={`http://localhost:4941/api/v1/films/${film.filmId}/image`} alt={film.title} style={{ width: '230px', height: '345px'}} />
                    </div>
                    <div style={{ margin: '0 30px', width: '100%'}}>
                        <h1>{film.title}</h1>
                        <p style={{textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{marginRight: '10px'}}>{formatReleaseDate(film.releaseDate)}</span>
                            Directed by {film.directorFirstName} {film.directorLastName}
                            <Avatar src={`http://localhost:4941/api/v1/users/${film.directorId}/image`} style={{marginLeft: '10px'}}/>
                        </p>
                        <p>
                            {film.description}
                        </p>
                        <p style={{ borderBottom: '1px black solid', display: 'flex', justifyContent: 'space-between', marginBottom: '0', alignItems: 'center' }}>
                            <span style={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}><strong>Reviews</strong>
                                {!reviewed && Date.parse(film.releaseDate) < Date.now() && film.directorId.toString() !== localStorage.getItem('userId') && (
                                    <div style={{ marginLeft: '10px' }}>
                                        {!localStorage.getItem('authToken') ? (
                                            <Link to="/user/login" style={{ textDecoration: 'none', color: 'white' }}>
                                                <Button style={{whiteSpace: 'nowrap'}} variant="outlined">Login to Review</Button>
                                            </Link>
                                        ) : (
                                            <FilmPopUp filmId={id} reviewUpdater={updateReviews} />
                                        )}
                                    </div>
                                )}
                            </span>
                            <span style={{ textAlign: 'right' }}>
                                <strong> Rating: {film.rating}/10 • Total Reviews: {film.numReviews}</strong>
                            </span>
                        </p>
                        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                            {review_items()}
                        </List>
                        <p style={{ borderBottom: '1px black solid', display: 'flex', justifyContent: 'space-between', marginBottom: '0' }}>
                            <span style={{ textAlign: 'left' }}><strong>Similar Films</strong></span>
                        </p>
                        <div style={{ display: "inline-block", width: "100%"}}>
                            {similar_film_rows()}
                        </div>
                    </div>
                </div>
            </Paper>
        )
    }
}

export default Film;