import axios from 'axios';
import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {
    Avatar,
    Box,
    FormControlLabel,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Toolbar,
} from "@mui/material";
import CSS from 'csstype';
import {formatReleaseDate} from "../../helpers/FilmHelperFunctions";
import ButtonAppBar from "../Misc/Navbar";
import FilmRows from "../ViewFilmsPage/FilmRows";
import FilmPopUp from "./FilmPopUp";
import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from "@mui/icons-material/Delete";
import {Add} from "@mui/icons-material";
import dayjs from 'dayjs';
import EditIcon from "@mui/icons-material/Edit";
import Checkbox from "@mui/material/Checkbox";

const UserFilms = () => {
    const [filmCount, setFilmCount] = React.useState(1);
    const [films, setFilms] = React.useState<Array<Film>>([]);
    const [tempFilms, setTempFilms] = React.useState<Array<Film>>([]);
    const [directed, setDirected] = React.useState<boolean>(true);
    const [reviewed, setReviewed] = React.useState<boolean>(false);
    const [allGenres, setAllGenres] = React.useState<{ [key: number]: string }>({});
    const [currentPage, setCurrentPage] = React.useState(0);
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const rowsPerPage = 10;
    const navigate = useNavigate();
    const ageRatings = [
        'G', 'PG', 'M', 'R13', 'R16', 'R18', 'TBC'
    ];
    const [image, setImage] = React.useState<{ image: string; type: string }>({
        image: "",
        type: "",
    });
    const [filmId, setFilmId] = React.useState<Number>()

    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px",
    }

    interface HeadCell {
        id: string;
        label: string;
        numeric: boolean;
    }

    const headCells: readonly HeadCell[] = [
        { id: 'image', label: 'Image', numeric: true },
        { id: 'title', label: 'Title', numeric: false },
        { id: 'ageRating', label: 'Age Rating', numeric: false },
        { id: 'releaseDate', label: 'Release Date', numeric: false },
        { id: 'genre', label: 'Genre', numeric: false },
        { id: 'director', label: 'Director', numeric: false },
        { id: 'rating', label: 'Rating', numeric: true}
    ];

    React.useEffect(() => {
        getGenres();
        getReviewedFilms();
    }, []);

    React.useEffect(() => {
        if (directed != reviewed) {
            if (directed) {
                getDirectedFilms();
            } else {
                getReviewedFilms();
            }
        }
    }, [currentPage, directed, reviewed]);

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

    const getDirectedFilms = () => {
        const params: { [key: string]: any } = {};
        params.startIndex = rowsPerPage * currentPage;
        params.count = rowsPerPage;
        params.directorId = localStorage.getItem('userId');
        axios.get('http://localhost:4941/api/v1/films', { params })
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                setFilms(response.data.films);
                setFilmCount(response.data.count);
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const getReviewedFilms = () => {
        axios.get('http://localhost:4941/api/v1/films')
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                setTempFilms(response.data.films);
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            }).finally(() => {
                const reviewedFilms: Array<Film> = []
                let reviewedFilmsCount: number = 0;
                const requests: any[] = [];
                let stopGap = currentPage * rowsPerPage;
                for (let i = 0; i < tempFilms.length; i++) {
                    const request = axios.get(`http://localhost:4941/api/v1/films/`+tempFilms[i].filmId+`/reviews`)
                        .then((response) => {
                            const filteredReviews = response.data.filter((review: Review) => review.reviewerId.toString() === localStorage.getItem('userId'));
                            if (filteredReviews.length > 0 && !films.includes(tempFilms[i])) {
                                if (stopGap > 0) {
                                    stopGap -= 1;
                                } else if (stopGap <= 0 && stopGap > -10) {
                                    reviewedFilms.push(tempFilms[i]);
                                    stopGap -= 1;
                                }
                                reviewedFilmsCount += 1
                            }
                        });
                    requests.push(request)
                }
                Promise.all(requests).then(() => {
                    if (!directed && reviewed) {
                        setFilms(reviewedFilms);
                        setFilmCount(reviewedFilmsCount);
                    }
                })
        });
    }


    const deleteFilm = () => {
        axios.delete(`http://localhost:4941/api/v1/films/${filmId}`, {
            headers: {
                'X-Authorization': localStorage.getItem('authToken') // Set X-Authorization header
            }
        })
            .then(() => {
                setErrorFlag(false);
                setErrorMessage("");
                setCurrentPage(0);
            })
            .catch(error => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setCurrentPage(newPage);
    };

    const handleToggle = () => {
        setDirected(!directed);
        setReviewed(directed);
    };

    React.useEffect(() => {
        if (directed != reviewed) {
            setCurrentPage(0);
        }
    }, [directed, reviewed]);

    if (!localStorage.getItem('authToken')) {
            return (
                <div>
                    <h1>My Films</h1>
                    <div style={{ color: "red" }}>
                        You aren't logged in.
                    </div>
                    <Link to={"/user/login"}>Login</Link>
                </div>
            );
    } else {
        return (
            <Paper elevation={3} style={card}>
                <h1>My Films</h1>
                <Box display="flex" gap={2}>
                    <FilmPopUp filmId={null} userId={localStorage.getItem('userId')}
                               genres={allGenres} ageRatings={ageRatings}
                               saveHandler={getDirectedFilms} buttonIcon={AddIcon} buttonText={'Add Film'} filmImage={null}></FilmPopUp>
                    <FormControlLabel control={<Checkbox
                        checked={directed}
                        onChange={handleToggle}
                        inputProps={{ 'aria-label': 'controlled' }}
                    /> } label="Directed" />
                    <FormControlLabel control={<Checkbox
                        checked={reviewed}
                        onChange={handleToggle}
                        inputProps={{ 'aria-label': 'controlled' }}
                    /> } label="Reviewed" />
                </Box>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow style={{borderBottom: "1px solid rgba(224, 224, 224, 1)"}}>
                                {headCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        padding={'normal'}
                                    >
                                        {headCell.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <FilmRows films={films ? films : []} genres={allGenres} userId={Number(localStorage.getItem('userId'))} editSaveHandler={getDirectedFilms} onDeletionHandler={getDirectedFilms}></FilmRows>
                        </TableBody>
                    </Table>
                    <TablePagination component="div"
                                     count={filmCount}
                                     page={currentPage}
                                     onPageChange={handleChangePage}
                                     rowsPerPage={rowsPerPage}
                                     rowsPerPageOptions={[]}
                                     showFirstButton
                                     showLastButton
                                     labelDisplayedRows={() => {
                                         return `Page ${currentPage+1} of ${Math.floor((filmCount-1) / rowsPerPage + 1)}`;
                                     }}/>
                </TableContainer>
            </Paper>
        );
    }
}

export default UserFilms;