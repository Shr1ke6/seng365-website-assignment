import axios from 'axios';
import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {
    Avatar,
    Box,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Toolbar,
} from "@mui/material";
import CSS from 'csstype';
import SearchBar from './SearchBar';
import DropDown from "./DropDown";
import {formatReleaseDate} from "../../helpers/FilmHelperFunctions";
import ButtonAppBar from "../Misc/Navbar";
import FilmRows from "./FilmRows";
import Typography from "@mui/material/Typography";

const Films = () => {
    const [filmCount, setFilmCount] = React.useState(1);
    const [films, setFilms] = React.useState<Array<Film>>([]);
    const [allGenres, setAllGenres] = React.useState<{ [key: number]: string }>({});
    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedGenres, setSelectedGenres] = React.useState<Array<number>>([]);
    const [selectedAgeRatings, setSelectedAgeRatings] = React.useState<Array<String>>([]);
    const [selectedSortBy, setSelectedSortBy] = React.useState("RELEASED_ASC");
    const [currentPage, setCurrentPage] = React.useState(0);
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const ageRatings = [
        'G', 'PG', 'M', 'R13', 'R16', 'R18', 'TBC'
    ];
    const allSortBy: { [key: string]: string } = {
        'Ascending alphabetically': 'ALPHABETICAL_ASC',
        'Descending alphabetically': 'ALPHABETICAL_DESC',
        'Chronologically by release date': 'RELEASED_ASC',
        'Reverse Chronologically by release date': 'RELEASED_DESC',
        'Ascending by rating': 'RATING_ASC',
        'Descending by rating': 'RATING_DESC',
    };

    const rowsPerPage = 10;
    const navigate = useNavigate();

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
        getFilms();
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

    const getFilms = () => {
        const params: { [key: string]: any } = {};
        if (searchTerm !== null && searchTerm !== "") {
            params.q = searchTerm;
        }
        if (selectedGenres !== null && selectedGenres.length > 0) {
            params.genreIds = selectedGenres;
        }
        if (selectedAgeRatings !== null && selectedAgeRatings.length > 0) {
            params.ageRatings = selectedAgeRatings;
        }
        if (selectedSortBy !== null && selectedSortBy !== "") {
            params.sortBy = selectedSortBy;
        }
        params.startIndex = rowsPerPage * currentPage;
        params.count = rowsPerPage;
        console.log(selectedGenres.toString())
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

    const handleSearch = (q: string) => {
        setSearchTerm(q);
    }

    const handleGenreFilter = (genres: string | string[]) => {
        const tempGenres = Array.isArray(genres) ? genres : [genres]
        let genreOutput: number[] = [];
        for (let i= 0; i < tempGenres.length; i++) {
            for (const key in allGenres) {
                if (allGenres.hasOwnProperty(key) && allGenres[key] === tempGenres[i]) {
                    genreOutput.push(Number(key))
                }
            }
        }
        setSelectedGenres(genreOutput);
    };

    const handleAgeRatingFilter = (ageRatings: string | string[]) => {
        setSelectedAgeRatings(Array.isArray(ageRatings) ? ageRatings : [ageRatings]);
    };

    const handleSortBy = (sortBy: string | string[]) => {
        setSelectedSortBy(allSortBy[sortBy[0]]);
    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setCurrentPage(newPage);
    };

    React.useEffect(() => {
        getFilms();
    }, [searchTerm, selectedGenres, selectedAgeRatings, selectedSortBy, currentPage]);

    React.useEffect(() => {
        setCurrentPage(0);
    }, [filmCount]);


    const film_rows = () => {

        const handleRowClick = (row: Film) => {
            navigate(`/films/${row.filmId}`);
        }

        return films.map((row: Film) => {
            // Construct the URL for fetching the film image based on the filmId
            const filmImageUrl = `http://localhost:4941/api/v1/films/${row.filmId}/image`;
            const directorImageUrl = `http://localhost:4941/api/v1/users/${row.directorId}/image`;

            return (
                <TableRow hover tabIndex={-1} key={row.filmId} onClick={()=> handleRowClick(row)} style={{ cursor: 'pointer' }}>
                    <TableCell>
                        <img src={filmImageUrl} alt=" " width="40px" height="60px" />
                    </TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.ageRating}</TableCell>
                    <TableCell>{formatReleaseDate(row.releaseDate)}</TableCell>
                    <TableCell>{allGenres[row.genreId]}</TableCell>
                    <TableCell>
                        <p style={{textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                            <Avatar src={directorImageUrl} style={{marginRight: '10px'}}/> {row.directorFirstName} {row.directorLastName}
                        </p>
                    </TableCell>
                    <TableCell>{row.rating}</TableCell>
                </TableRow>
            );
        });
    };

    if (errorFlag) {
        return (
            <div>
                <h1>Films</h1>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
            </div>
        )
    } else {
        return (
            <Paper elevation={3} style={card}>
                <h1>Films</h1>
                <Box display="flex" gap={2}>
                    <SearchBar searchHandler={handleSearch}/>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} />
                    <DropDown values={Object.values(allGenres)} title={'Genres'} multiple={true} filterHandler={handleGenreFilter} defaultValue={undefined}/>
                    <DropDown values={ageRatings} title={'Age Ratings'} multiple={true} filterHandler={handleAgeRatingFilter} defaultValue={undefined}/>
                    <DropDown values={Object.keys(allSortBy)} title={'Sort By'} multiple={false} filterHandler={handleSortBy} defaultValue={undefined}/>
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
                            <FilmRows films={films} genres={allGenres} userId={null} editSaveHandler={null} onDeletionHandler={getFilms}></FilmRows>
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
                                         return `Page ${currentPage+1} of ${Math.floor(filmCount / rowsPerPage + 1)}`;
                                     }}/>
                </TableContainer>
            </Paper>
        );
    }
}

export default Films;