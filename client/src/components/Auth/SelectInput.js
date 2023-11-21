import React from "react";
import {
  Grid,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
} from "@material-ui/core";

function SelectInput({ name, value, handleChange, label, options, autoFocus }) {
  return (
    <Grid item xs={12} sm={12}>
      <FormControl fullWidth variant="outlined">
        <InputLabel>{label}</InputLabel>
        <Select
          name={name}
          value={value}
          onChange={handleChange}
          label={label}
          autoFocus={autoFocus}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );
}

export default SelectInput;
