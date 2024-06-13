import React, { useContext, useEffect, useState } from 'react';
import Lottie from 'react-lottie';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  IconButton,
  styled,
  TextField,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DataItem from './DataItem';
import { DataContext } from '../hooks/dataContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { getReverseMode } from '../utils/themeStyles';
import NewScreen from './NewScreen';
import FlipIcon from '@mui/icons-material/FlipCameraAndroid';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { ScreenInterface, ScreenInterfaceWithId } from '../typesInterfaces/screenAndSection';
import { screensService } from '../api/screensApi';
import { ScreensContext } from '../hooks/screensContext';

import { AuthContext } from '../hooks/authContext';
import { dataItemApiService } from '../api/dataItemApi';
import { imagesApiService } from '../api/imagesApi';

import * as lottiePhantom from '../lottie/phantom.json'
import Label from './Label';
import { useQuizz } from '../hooks/useQuizz';

interface Props {
  modalVisible: boolean;
}

const Layout = styled('div')<Props>(({ theme, modalVisible }) => ({
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  opacity: modalVisible ? 0.1 : 1,
}));

const DataItemsLayout = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  display: 'inline',
  flex: '1',
  flexWrap: 'wrap',
  padding: '5px',
}));

const AccordeonLayout = styled(Accordion)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.primary[getReverseMode(theme)]}`,
  borderRadius: '10px !important;',
  boxShadow: 'unset',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
}));

const AccordionDetailsLayout = styled(AccordionDetails)(({ theme }) => (`
  border: 1px solid ${theme.palette.primary[getReverseMode(theme)]};
  border-radius: 7px;
  flex: 1;
  margin: 15px;
  padding: 15px;
`));

const TabBarStyled = styled('div')(({ theme }) => (`
  background-color: ${theme.palette.background.paper};
  border: 1px solid ${theme.palette.primary[getReverseMode(theme)]};
  padding: 5px;
  display: flex;
  align-items: center;
  
  @media (max-width: 800px) {
    display: none;
  }
`));

const CreateScreenBtn = styled(Button)(({ theme }) => (`
  background-color: ${theme.palette.background.paper};
  border: 1px solid ${theme.palette.primary[getReverseMode(theme)]};
  border-radius: 10px;
  box-shadow: unset;
  color: ${theme.palette.primary[getReverseMode(theme)]};
  flex: 1;
  margin-left: 10px;
  padding: 11px 16px;
  
  &:hover {
    color: white !important;
  }
`));

const ButtonNewScreen = styled(Button)(() => ({
  border: 'none',
  margin: '0 6px',
  padding: 0,
}));

const INITIAL_NEW_SCREEN: ScreenInterface = {
  name: '',
  flexDirection: 'row',
  rowsColumns: [
    {
      flex: 1,
      flexDirection: 'column',
      name: '',
      rowsColumns: [
        {
          flex: 1,
          name: '',
          tags: []
        }
      ]
    }
  ]
};

const Body = () => {
  const theme = useTheme();
  const [screenDirection, setScreenDirection] = useState<'row' | 'column'>('row');
  const [activateEditableScreen, setActivateEditableScreen] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const { showQuizz } = useQuizz();
  const [screen, setScreen] = useState<ScreenInterface | ScreenInterfaceWithId | undefined>(undefined);

  const navigate = useNavigate();

  const screenEdition = screen && 'id' in screen;

  const { addScreen, removeScreen, updateScreen } = screensService();
  const { dataStore } = useContext(DataContext);
  const { screensStore } = useContext(ScreensContext);
  const { user } = useContext(AuthContext);

  const { getDataItems } = dataItemApiService();
  const { getImages } = imagesApiService();
  const { getScreens } = screensService();

  useEffect(() => {
    getDataItems();
    getImages();
    getScreens();
  }, [user]);

  useEffect(() => {
    const queryScreenName = searchParams.get('screen');

    if (screensStore && queryScreenName) {
      const nextScreen = screensStore.find((dataItem) => dataItem.name === queryScreenName);
      if (nextScreen) setScreen(nextScreen);
    }

  }, [screensStore]);

  const saveUpdateScreen = async () => {
    if (!screen) return;
    let response;
    if (screenEdition) response = await updateScreen(screen);
    else {
      response = await addScreen(screen as ScreenInterfaceWithId);
    }
    if (response) {
      setScreen(undefined);
    }
  }

  const deleteScreen = async () => {
    if (!screen || !('id' in screen)) return;
    const response = await removeScreen(screen.id);
    if (response) setScreen(undefined);
  }

  const isScreenEditable = screen?.userEmail === user?.email;
  console.log('screen: ', screen);
  console.log('user: ', user);
  console.log('isScreenEditable: ', isScreenEditable);

  if (!screen && !user) {
    return (
      <div>
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: lottiePhantom,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice'
            }
          }}
          height={400}
          width={400}
        />
        <Label>
          Please, login to save and remember your knowledge
        </Label>
      </div>
    );
  }

  return (
    <Layout theme={theme} modalVisible={showQuizz}>
      {
        !!user && (
          <TabBarStyled>
            <AccordeonLayout theme={theme}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                id="dataItem-accordion"
              >
                <Typography>Add new data</Typography>
              </AccordionSummary>
              <AccordionDetailsLayout>
                <DataItem />
              </AccordionDetailsLayout>
            </AccordeonLayout>
            <TabBarStyled sx={{ border: 'unset' }}>
              {screen !== undefined ? (
                <>
                  <TextField
                    disabled={!activateEditableScreen}
                    label="Screen name"
                    size="small"
                    variant="outlined"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setScreen({ ...screen, name: event.target.value });
                    }}
                    value={screen.name}
                  />
                  <IconButton aria-label="flip-icon" onClick={() => setScreenDirection(screenDirection === 'row' ? 'column' : 'row')}>
                    <FlipIcon  />
                  </IconButton>
                  {
                    activateEditableScreen ? (
                      <>
                        <ButtonNewScreen onClick={() => setActivateEditableScreen(false)}>
                          Cancel Edition
                        </ButtonNewScreen>
                        <ButtonNewScreen onClick={saveUpdateScreen} disabled={!screen.name || !screen.name.length}>
                          {screenEdition ? 'Update' : 'Save'} screen
                        </ButtonNewScreen>
                      </>
                    ) : (
                      <ButtonNewScreen onClick={() => setActivateEditableScreen(true)} disabled={!isScreenEditable}>
                        Edit Screen
                      </ButtonNewScreen>
                    )
                  }
                  {screenEdition && (
                    <ButtonNewScreen onClick={deleteScreen} color="error" disabled={!isScreenEditable}>
                      Remove screen
                    </ButtonNewScreen>
                  )}
                  <IconButton aria-label="delete" size="small" onClick={() => {
                    navigate('', { replace: true });
                    setActivateEditableScreen(false);
                    setScreen(undefined);
                  }} color="error">
                    <HighlightOffIcon fontSize="inherit" />
                  </IconButton>
                </>
              ) : (
                <>
                  {(screensStore || []).map((screenItem) => (
                    <ButtonNewScreen
                      key={`screen-${screenItem.id}`}
                      onClick={() => {
                        navigate(`?screen=${screenItem.name}`, { replace: true });
                        setScreen(screenItem)
                      }}
                    >
                      {screenItem.name}
                    </ButtonNewScreen>
                  ))}
                  <CreateScreenBtn
                    endIcon={<AddCircleOutlineIcon />}
                    onClick={() => {
                      setScreen(INITIAL_NEW_SCREEN)
                      setActivateEditableScreen(true);
                    }}
                    variant="contained"
                  >
                    Create screen to sort the data
                  </CreateScreenBtn>
                </>)}
            </TabBarStyled>
          </TabBarStyled>
        )
      }
      {screen !== undefined ? (
        <NewScreen
          editable={activateEditableScreen}
          flexDirection={screenDirection}
          screen={screen}
          setScreen={setScreen}
        />
      ) : (
        <DataItemsLayout theme={theme}>
          {dataStore && dataStore.map((item) => (
            <DataItem key={`body-dataItem-${item.id}`} data={item} />
          ))}
        </DataItemsLayout>
      )}
    </Layout>);
}

export default Body;
