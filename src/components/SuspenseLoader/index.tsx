import { Box, CircularProgress, styled } from '@mui/material';

const StyledBox = styled(Box)({
  position: 'fixed',
  background: '#fff',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  zIndex: "9999",
});

const SuspenseLoader = () => (
  <StyledBox
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <CircularProgress
      size={64}
      disableShrink
      thickness={3}
      aria-label="Page Loader"
    />
  </StyledBox>
);

export default SuspenseLoader;
