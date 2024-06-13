import React, { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Accordion,
  Autocomplete,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  IconButton,
  styled,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { useTheme } from '@mui/material/styles';
import { getReverseMode } from '../utils/themeStyles';
import { Formik, Form, FormikProps } from 'formik';
import { DATAITEM_TYPES, NUMBERIC_TYPE } from '../constants';
import CustomNumberInput from './CustomNumberInput';
import { DataItemInterface, DataItemInterfaceWithId } from '../typesInterfaces/dataItem';
import { dataItemApiService } from '../api/dataItemApi';
import { AuthContext } from '../hooks/authContext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { DataContext } from '../hooks/dataContext';
import { getDifferentTags } from '../utils/tags';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EyeIcon from '@mui/icons-material/Visibility';
import OkIcon from '@mui/icons-material/ThumbUp';
import KoIcon from '@mui/icons-material/ThumbDown';
import dayjs from 'dayjs';
import { parseImage } from '../utils/file';
import { useQuizz } from '../hooks/useQuizz';
import ImagesViewer from './ImagesViewer';

const VisuallyHiddenInput = styled('input')({
  bottom: 0,
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  left: 0,
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1,
});


const TagsWrapper = styled('div')(() => ({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  margin: '10px 0',
}));

const FormLayout = styled(Form)(() => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  paddingRight: '25px',
}));

const TextareaAutosize = styled(BaseTextareaAutosize)(
  ({ theme }) => `
  flex: 1;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${theme.palette.primary[getReverseMode(theme)]};
  background: ${theme.palette.background.paper};
  border: 1px solid ${theme.palette.primary[getReverseMode(theme)]};

  &:hover {
    border-color: ${theme.palette.primary[getReverseMode(theme)]};
  }
`,
);

const SubmitBtnStyled = styled(Button)(() => ({
  flex: 1,
  marginRight: '5px',
  marginLeft: '5px',
  minWidth: '130px',
}));

const Field1Wrapper = styled(TextareaAutosize)(() => ({
  flex: 1,
  marginBottom: '10px',
  width: 'inherit',
}));

const ButtonGroupStyled = styled(ButtonGroup)(() => ({
  display: 'flex',
  width: '100%',
}));

const ButtonTypeStyled = styled(Button)(() => ({
  flex: 1,
}));

const QuizzBtnStyled = styled(Button)(() => ({
  marginLeft: '10px',
}));

const TypeLayoutStyled = styled('div')(() => ({
  alignItems: 'center',
  display: 'flex',
}));

const AutocompleteInputStyled = styled(TextField)(() => (`
  flex: 1;
  width: 100%;
`));

const SubmitBtnsLayout = styled('div')(() => ({
  alignItems: 'center',
  display: 'flex',
  marginTop: '15px',
  width: '100%',
}));

const EditBtnStyled = styled(IconButton)(() => (`
  padding: 0;
  position: absolute;
  right: 5px;
`));

interface PropsLayout {
  isQuizz: boolean;
}

const Layout = styled(Accordion)<PropsLayout>(({ theme, isQuizz }) => (`
  background-color: ${theme.palette.background.paper},
  border: 1px solid ${theme.palette.primary[getReverseMode(theme)]};
  border-radius: ${isQuizz ? '0' : '7px'};
  display: flex;
  flex-direction: 'column';
  padding: 15px;
  margin: ${isQuizz ? '0' : '10px'};
  margin-left: 0;
`));

const CardStyled = styled(Card)(({ theme }) => (`
  background-color: ${theme.palette.background.paper};
  box-shadow: unset;
  padding: 0;
`));

const CardContentStyled = styled(CardContent)(() => (`
  box-shadow: unset;
  margin: 0;
  padding: 0;
  padding-bottom: 0 !important;
`));

const DeleteIconStyled = styled(DeleteIcon)(({ theme }) => (`
  margin-left: 10px;
  color: ${theme.palette.error[getReverseMode(theme)]};
`));

const DatePickerStyled = styled(DatePicker)(() => `
  margin-top: 10px;
  margin-bottom: 10px;
`);

const DEFAULT_DATAITEM_TYPE = DATAITEM_TYPES[0];

interface Props {
  canEdit?: boolean;
  data?: DataItemInterfaceWithId;
  handlerQuizzQuestion?: (quizzResult: boolean) => void;
}

const CREATION_DATE = new Date().toLocaleDateString().replaceAll('/', '-');

const DataItem = ({ data, canEdit = true, handlerQuizzQuestion }: Props) => {
  const { handleQuizz, showQuizz } = useQuizz();
  const isQuizz = Boolean(handlerQuizzQuestion);
  const [autocompleteValue, setAutocompleteValue] = useState<string>('');
  const [editable, setEditable] = useState<boolean>(canEdit && !data);
  const [showAnswer, setShowAnswer] = useState<boolean>(!isQuizz);
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const { dataStore } = useContext(DataContext);
  const { addDataItem, removeDataItem, updateDataItem } = dataItemApiService();


  const formikRef = useRef<FormikProps<DataItemInterface> | null>(null);

  const initialStateFormik: DataItemInterface = data ||
    {
      creationDate: CREATION_DATE,
      tags: [],
      field1: '',
      field2: '',
      image: undefined,
      images: [],
      type: DEFAULT_DATAITEM_TYPE,
      userEmail: user?.email || '',
    };

  useEffect(() => {
    if (data) formikRef.current?.setValues(data);
  }, [data]);

  const handlerRemoveItem = () => {
    if (data) removeDataItem(data.id, data.image);
  }

  const updateItem = async (data: DataItemInterfaceWithId) => {
    await updateDataItem(data);
    setEditable(false);
  }

  const getAutocompleteOptions = useCallback((tagsfromFormik: string[]) => {
    return getDifferentTags({dataStore: dataStore || [], tagsAlreadySelected: tagsfromFormik });
  }, [dataStore]);

  return (
    <Layout theme={theme} sx={{ flex: 1, height: !data ? 'inherit' : 'fit-content' }} isQuizz={isQuizz}>
      <Formik
        initialValues={initialStateFormik}
        validate={() => ({})}
        onSubmit={async (values ) => {
          await addDataItem({ ...values });
          // if (success) resetForm();
        }}
        innerRef={formikRef}
      >
        {({
            values,
            // errors,
            // touched,
            setFieldValue,
            handleChange,
            // handleBlur,
            handleSubmit,
            // isSubmitting,
            /* and other goodies */
          }) => (
          <FormLayout onSubmit={handleSubmit}>
            <TypeLayoutStyled>
              {editable && (
                <ButtonGroupStyled aria-label="outlined primary button group">
                  {DATAITEM_TYPES && DATAITEM_TYPES.map((itemType) => (
                    <ButtonTypeStyled
                      key={`dataItem-btn-type-${itemType}`}
                      variant={values.type === itemType ? 'contained' : 'outlined' }
                      onClick={() => {
                        if (values.type === itemType) return false;

                        // Initialize the value of the second field
                        if (itemType === NUMBERIC_TYPE || values.type === NUMBERIC_TYPE) {
                          setFieldValue('field2', itemType === NUMBERIC_TYPE ? 0 : '');
                        }
                        setFieldValue('type', itemType);
                      }}
                    >
                      {itemType}
                    </ButtonTypeStyled>
                  ))}
                </ButtonGroupStyled>
              )}
            </TypeLayoutStyled>
            {editable && (
              <TagsWrapper>
                <Autocomplete
                  clearOnBlur
                  defaultValue={values.tags}
                  disablePortal
                  freeSolo
                  fullWidth
                  id="dataItem-tags"
                  multiple
                  options={getAutocompleteOptions(values.tags)} // TODO: Get list from database
                  onChange={(event, nextTags: string[] | null) => {
                    if (nextTags) setFieldValue('tags', nextTags);
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
            )}
            <ImagesViewer
              images={values.images}
              removeImage={(indexImageToRemove) => {
                if (values.images) setFieldValue('images', values.images.splice(indexImageToRemove, 1));
              }}
            />
            {
              !editable ? (
                <CardStyled>
                  {canEdit && (
                    <EditBtnStyled aria-label="edit" size="small" onClick={() => setEditable(true)}>
                      {values.userEmail === user?.email && <EditIcon fontSize="inherit" />}
                      <DeleteIconStyled fontSize="inherit" onClick={handlerRemoveItem} />
                    </EditBtnStyled>
                  )}
                  <CardContentStyled>
                    {values.field1 && (
                      <Typography variant="overline">
                        {values.field1}
                        {showQuizz && (<QuizzBtnStyled color="success" variant="contained" startIcon={<OkIcon />} onClick={() => handlerQuizzQuestion && handlerQuizzQuestion(true)} >OK</QuizzBtnStyled>)}
                        {showQuizz && (<QuizzBtnStyled color="error" variant="contained" startIcon={<KoIcon />} onClick={() => handlerQuizzQuestion && handlerQuizzQuestion(false)} >KO</QuizzBtnStyled>)}
                      </Typography>
                    )}
                    {isQuizz && data && !showAnswer ? (
                      <QuizzBtnStyled variant="contained" startIcon={<EyeIcon />} onClick={() => setShowAnswer(true)}>
                        Show Answer
                      </QuizzBtnStyled>
                    ) : (
                      <Typography variant="subtitle2">{values.field2}</Typography>
                    )}
                    {showQuizz && (
                      <IconButton aria-label="delete" size="small" onClick={handleQuizz}>
                        <HighlightOffIcon
                          fontSize="inherit"
                        />
                      </IconButton>
                    )}
                  </CardContentStyled>
                </CardStyled>
              ) : (
                <>
                  <Field1Wrapper
                    theme={theme}
                    placeholder="title"
                    name="field1"
                    value={values.field1}
                    onChange={handleChange}
                  />
                  {
                    values.type === NUMBERIC_TYPE ? (
                      <CustomNumberInput
                        aria-label="Demo number input"
                        placeholder="Type a number…"
                        onChange={(_, value) => {
                          if (value !== undefined) setFieldValue('field2', value);
                        }}
                        value={values.field2}
                      />
                    ) : (
                      <TextareaAutosize
                        minRows={2}
                        name="field2"
                        onChange={handleChange}
                        placeholder="Content"
                        theme={theme}
                        value={values.field2}
                      />
                    )
                  }
                </>
              )
            }
            {editable && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePickerStyled
                  label="creation date"
                  format="DD-MM-YYYY"
                  name="creationDate"
                  onChange={(newValue) => {
                    // @ts-expect-error TODO: check this type
                    setFieldValue('creationDate', dayjs(newValue).format('DD-MM-YYYY'));
                  }}
                  value={dayjs(values.creationDate, 'DD-MM-YYYY')}
                />
              </LocalizationProvider>
            )}
            { editable && (
              <SubmitBtnsLayout>
                <Tooltip title="Cancel edition">
                  <IconButton aria-label="delete" size="small" onClick={() => setEditable(false)} color="error">
                    <HighlightOffIcon
                      fontSize="inherit"
                    />
                  </IconButton>
                </Tooltip>
                <SubmitBtnStyled variant="outlined" color="error" onClick={handlerRemoveItem}>Remove data</SubmitBtnStyled>
                {data && (<SubmitBtnStyled variant="contained" onClick={() => updateItem({ ...values, id: data.id })}>Update data</SubmitBtnStyled>)}
                <SubmitBtnStyled type="submit" variant="contained">{data ? 'Duplicate Data' : 'Add data'}</SubmitBtnStyled>
                <Button component="label" variant="contained" placeholder="upload image">
                  <CloudUploadIcon />
                  <VisuallyHiddenInput type="file" multiple onChange={async (fileEvent: ChangeEvent<HTMLInputElement>) => {
                    const files: FileList | undefined | null = fileEvent.target.files;
                    if (files?.length) {
                      // TODO
                      const parsedFiles = await Promise.all(Array.from(files).map(async (file: File) => {
                        return await parseImage(file);
                      }));
                      console.log('files: ', files);
                      console.log('parsedFiles: ', parsedFiles);
                      setFieldValue('images', parsedFiles);
                    }
                  }} />
                </Button>
              </SubmitBtnsLayout>
            )}
          </FormLayout>
        )}
      </Formik>
    </Layout>
  );
}

export default DataItem;
