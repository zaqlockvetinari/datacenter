import React, { useContext, useEffect, useMemo, useState } from 'react';
import { IconButton, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataContext } from '../hooks/dataContext';
import { DataItemInterfaceWithId } from '../typesInterfaces/dataItem';
import { getRandomInt } from '../utils/number';
import DataItem from './DataItem';
import { dataItemApiService } from '../api/dataItemApi';
import { useQuizz } from '../hooks/useQuizz';
import { getReverseMode } from '../utils/themeStyles';
import AutoCompleteTags from './AutoCompleteTags';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const QuizzModalStyled = styled('div')(() => (`
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 500px;
  transform: translate(-50%, -50%);
  z-index: 10;
`));

const HeaderModalStyled = styled('div')(({ theme }) => (`
  background: ${theme.palette.background.paper};
  color: ${theme.palette.primary[getReverseMode(theme)]};
  display: flex;
  padding: 20px 10px;
`));

const QuizzModal = () => {
  const { handleQuizz, showQuizz } = useQuizz();

  const { dataStore } = useContext(DataContext);

  const [questionToShow, setQuestionToShow] = useState<DataItemInterfaceWithId | undefined>();
  const [tagsSelected, setTagsSelected] = useState<string[]>([]);
  const { updateDataItem } = dataItemApiService();

  const questions = useMemo(() => {
    return (dataStore || []).filter((data) => tagsSelected.some((selectedTag) => data.tags.includes(selectedTag)));
  }, [dataStore, tagsSelected]);

  useEffect(() => {
    handlerQuizzQuestion();
  }, [
    showQuizz,
    questions
  ]);

  const handlerQuizzQuestion = async (quizzResponse?: boolean) => {
    if (questionToShow && quizzResponse !== undefined) {
      if (quizzResponse) await updateDataItem({ ...questionToShow, quizzOk: (questionToShow.quizzOk || 0) + 1 });
      else await updateDataItem({ ...questionToShow, quizzKo: (questionToShow.quizzKo || 0) + 1 });
    }

    if (showQuizz && questions.length) {
      const nextQuestion = questions[getRandomInt(questions.length)];
      setQuestionToShow(nextQuestion);
    }
  }

  const theme = useTheme();


  if (!showQuizz) return (<></>);

  return (
    <QuizzModalStyled theme={theme}>
      <HeaderModalStyled>
        <AutoCompleteTags tagsSelected={tagsSelected} setTagsSelected={setTagsSelected} />
        <IconButton aria-label="delete" size="small" onClick={handleQuizz}>
          <HighlightOffIcon
            fontSize="inherit"
          />
        </IconButton>
      </HeaderModalStyled>
      {questionToShow && <DataItem data={questionToShow} canEdit={false} handlerQuizzQuestion={handlerQuizzQuestion} />}
    </QuizzModalStyled>
  );
}

export default QuizzModal;
