import React, { FC, useEffect, useId, useState } from 'react';
import { FormControl, FormHelperText, Grid, MenuItem, Select, SelectProps } from '@mui/material';
import { WithStyles, withStyles } from '@mui/styles';

type Props = {
  classes: WithStyles<typeof styles>['classes'];
  value: string;
  options: { label: string, value: string | number }[];
  name: string;
  label: string;
  required?: boolean;
  helpText?: string;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

/**
 * Generates a generic select box with a label and help text
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const SelectInput: FC<Props> = ({
  classes, value, name, label, options,
  required = false, helpText, gridWidth, onChange,
}) => {
  const id = useId();

  const [val, setVal] = useState(value);
  const [error] = useState(false);
  const helperText = helpText || (required ? 'This field is required' : ' ');

  const onChangeWrapper = (e) => {
    if (typeof onChange === 'function') {
      onChange(e);
    }

    setVal(e.target.value);
  };

  useEffect(() => {
    setVal(value);
  }, [value]);

  return (
    <Grid xs={gridWidth || 6} item>
      <FormControl fullWidth error={error}>
        <label htmlFor={id} className={classes.label}>
          {label}
          {required ? (<span className={classes.asterisk}> *</span>) : ''}
        </label>
        <Select
          id={id}
          size="small"
          value={val}
          onChange={onChangeWrapper}
          required={required}
          name={name}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </Select>
        <FormHelperText>{error ? helperText : ' '}</FormHelperText>
      </FormControl>
    </Grid>
  );
};

const styles = () => ({
  label: {
    fontWeight: 600,
    color: "blue",
  },
  asterisk: {
    color: 'red',
  },
});

export default withStyles(styles, { withTheme: true })(SelectInput);
