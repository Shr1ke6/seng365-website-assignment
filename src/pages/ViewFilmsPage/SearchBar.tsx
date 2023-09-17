import {Container, IconButton, InputAdornment, TextField} from "@mui/material";
import { SetStateAction, useState} from "react";
import SearchIcon from "@mui/icons-material/Search";
function SearchBar(props: { searchHandler: (arg0: string) => void; }) {
    const [searchTerm, setSearchTerm] = useState("");

    const updateSearch = (event: { target: { value: SetStateAction<string>; }; }) => {
        setSearchTerm(event.target.value);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            props.searchHandler(searchTerm);
        }
    };

    return (
        <TextField
            id="search"
            type="search"
            label="Search Films"
            value={searchTerm}
            onChange={updateSearch}
            onKeyDown={handleKeyPress}
            sx={{ width: 500}}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={() => props.searchHandler(searchTerm)}>
                            <SearchIcon/>
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
}

export default SearchBar
