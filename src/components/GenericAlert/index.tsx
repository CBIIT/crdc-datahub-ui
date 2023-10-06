import React, { FC } from 'react';
import { Alert, styled } from '@mui/material';

const StyledAlert = styled(Alert)((({ bgColor } : { bgColor?: string }) => ({
  color: '#ffffff',
  backgroundColor: bgColor || '#5D53F6',
  width: '535px',
  boxSizing: 'border-box',
  minHeight: '50px',
  borderColor: bgColor || 'none',
  boxShadow: '-4px 8px 27px 4px rgba(27,28,28,0.09)',
  justifyContent: 'center',
  zIndex: '1100',
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  userSelect: 'none',
})));

type Props = {
  open: boolean;
  children: React.ReactNode;
};

const GenericAlert : FC<Props> = ({ open, children } : Props) => {
  if (!open) return null;

  return (
    <StyledAlert severity="success" icon={false}>
      {children}
    </StyledAlert>
  );
};

export default GenericAlert;
