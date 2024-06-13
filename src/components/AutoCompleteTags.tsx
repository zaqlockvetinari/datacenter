import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Autocomplete,
  styled,
  TextField,
} from '@mui/material';

import { DataItemInterfaceWithId } from '../typesInterfaces/dataItem';
import { DataContext } from '../hooks/dataContext';
import { getDifferentTags } from '../utils/tags';

const TagsWrapper = styled('div')(() => ({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  margin: '10px 0',
}));

const AutocompleteInputStyled = styled(TextField)(() => (`
  flex: 1;
  width: 100%;
`));

interface Props {
  data?: DataItemInterfaceWithId;
  tagsSelected: string[];
  setTagsSelected: (tagsSelected: string[]) => void;
}

const AutoCompleteTags = ({ data, setTagsSelected, tagsSelected }: Props) => {
  const [autocompleteValue, setAutocompleteValue] = useState<string>('');
  const { dataStore } = useContext(DataContext);

  useEffect(() => {
    if (data) setTagsSelected(data?.tags);
  }, [data]);

  const getAutocompleteOptions = useCallback(() => {
    return getDifferentTags({dataStore: dataStore || [], tagsAlreadySelected: tagsSelected });
  }, [dataStore, tagsSelected]);

  return (
    <TagsWrapper>
      <Autocomplete
        clearOnBlur
        defaultValue={tagsSelected}
        disablePortal
        freeSolo
        fullWidth
        id="dataItem-tags"
        multiple
        options={getAutocompleteOptions()} // TODO: Get list from database
        onChange={(event, nextTags: string[] | null) => {
          if (nextTags) setTagsSelected(nextTags);
        }}
        renderInput={(params) => (
          <AutocompleteInputStyled
            label="Tags..."
            onKeyDown={(e) => {
              const enterKeyPressed = e.code === 'Enter';
              const nextValue = enterKeyPressed ? '' : autocompleteValue + e.code;
              setAutocompleteValue(nextValue);
              if (enterKeyPressed) e.preventDefault();
            }}
            value={autocompleteValue}
            {...params}
          />
        )}
      />
    </TagsWrapper>
  );
}

export default AutoCompleteTags;
