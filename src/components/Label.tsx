import React from 'react';
import { styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getReverseMode } from '../utils/themeStyles';

const LabelStyled = styled('div')(({ theme }) => (`
  color: ${theme.palette.primary[getReverseMode(theme)]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 15px;
`));

interface Props {
  children: React.ReactNode,
}

const Label = ({ children }: Props) => {

  const theme = useTheme();

  return (
    <LabelStyled theme={theme}>
      {children}
    </LabelStyled>);
}

export default Label;
