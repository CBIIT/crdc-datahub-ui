import {
    Radio,
    RadioProps,

    styled,
  } from "@mui/material";

const StyledRadio = styled(Radio)((props) => ({
    "& input": {
      cursor: props.readOnly ? "not-allowed" : "initial",
    },
    "& .radio-icon": {
      background: (props.readOnly || props.disabled) ? "#EEEEEE !important" : "#ffffff",
    }
  }));

const BpIcon = styled('span')(() => ({
borderRadius: '50%',
width: 24,
height: 24,
outline: 'solid 2px #1D91AB',
'input:hover:enabled ~ &': {
    outlineOffset: "2px",
},
}));

const BpCheckedIcon = styled(BpIcon)({
'&:before': {
    borderRadius: "50%",
    display: 'block',
    marginTop: "4px",
    marginLeft: "4px",
    width: 16,
    height: 16,
    backgroundColor: '#1D91AB',
    content: '""',
},
});

const StyledRadioButton = (props: RadioProps) => (
  <StyledRadio
    disableRipple
    color="default"
    checkedIcon={<BpCheckedIcon className="radio-icon" />}
    icon={<BpIcon className="radio-icon" />}
    inputProps={{
        "data-type": "auto"
    } as unknown}
    {...props}
  />
);

export default StyledRadioButton;
