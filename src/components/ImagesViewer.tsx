import React, { useContext } from 'react';
import { styled } from '@mui/material';
import { ImagesContext } from '../hooks/imagesContext';
import DeleteIcon from '@mui/icons-material/Delete';
import { getReverseMode } from '../utils/themeStyles';

interface Props {
  images?: string[];
  removeImage: (imageIndex: number) => void;
}

const WrapperImages = styled('div')(() => `
  position: relative;
  height: 300px;
`);

interface PropsContainerImage {
  leftPosition?: number
};

const ContainerImage = styled('div')<PropsContainerImage>(({ leftPosition }) => `
  position: absolute;
  top: 50%;
  left: ${50 + (leftPosition || 0) }%;
  transform: translate(-50%, -50%);
`);

const DeleteImgIconStyled = styled(DeleteIcon)(({ theme }) => (`
  color: ${theme.palette.error[getReverseMode(theme)]};
  bottom: 5px;
  position: absolute;
  right: 2px;
`));

const AutoCompleteTags = ({ images, removeImage }: Props) => {
  const { imagesStore } = useContext(ImagesContext);

  if (!images?.length) return null;

  return (
    <WrapperImages>
      {
        images?.map((image, indexImage) => (
          <ContainerImage key={`image-${indexImage}`}>
            <img
              src={imagesStore?.[image] || image}
              alt="image"
              loading="lazy"
              style={{ maxHeight: '250px', maxWidth: '250px'}}
            />
            <DeleteImgIconStyled fontSize="inherit" onClick={() => {
              removeImage(indexImage);
            }} />
          </ContainerImage>
        ))
      }
    </WrapperImages>
  );
}

export default AutoCompleteTags;
