import * as React from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};


function getStyles(name: string, personName: string[], theme: Theme) {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

interface MultipleSelectProps {
    values: string[];
    title: string;
    multiple: boolean;
    filterHandler: ((arg0: string[] | string) => void) | null;
    defaultValue: string[] | undefined;
}

export default function DropDown(props: MultipleSelectProps) {
    const theme = useTheme();
    const [values, setValues] = React.useState<string[]>(props.defaultValue ? props.defaultValue : []);

    const handleChange = (event: SelectChangeEvent<typeof values>) => {
        const {
            target: { value },
        } = event;
        const selectedValues = typeof value === 'string' ? value.split(',') : value;
        setValues(selectedValues);
    };

    React.useEffect(() => {
        if (props.filterHandler) {
            props.filterHandler(values);
        }
    }, [values]);

    return (
        <FormControl sx={{ width: 300 }}>
            <InputLabel id="demo-multiple-name-label">{props.title}</InputLabel>
            <Select
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                multiple={props.multiple}
                value={values}
                onChange={handleChange}
                input={<OutlinedInput label="values" />}
                MenuProps={MenuProps}
                defaultValue={props.defaultValue}
            >
                {props.values.map((value) => (
                    <MenuItem
                        key={value}
                        value={value}
                        style={getStyles(value, values, theme)}
                    >
                        {value}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
