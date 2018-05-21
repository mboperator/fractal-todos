import React from 'react';
import { Input, Card, Box, FlexList } from '@procore/core-react';

import { createStore } from 'redux';
import { createModule } from 'redux-modules';
import { Provider } from 'react-redux';
import Connect from './Connect';

export const itemModel = createModule({
  name: 'todoItem',
  initialState: { title: '', status: 'IN_PROGRESS', description : '' },
  transformations: {
    updateTitle: (state, { payload: title }) => ({ ...state, title }),
    updateDescription: (state, { payload: description }) => ({ ...state, description }),
    updateStatus: (state, { payload: status }) => ({ ...state, status }),
  },
});

const store = createStore(itemModel.reducer, {});


export const TodoItem = ({
  title = 'Create Mock APIs',
  status = 'IN_PROGRESS',
  description = 'Mock APIs for state management.'
}) => (
  <Card>
    <Card.TipHeader>
      <Card.TipHeaderContent>
        <Card.TipHeaderTitle>{title}</Card.TipHeaderTitle>
      </Card.TipHeaderContent>
    </Card.TipHeader>
    <Box padding="xl">
      <p>{description}</p>
    </Box>
  </Card>
);

const SingleExample = () => (
  <Provider store={store}>
    <Connect selector={s => s} actions={itemModel.actions}>
      {({ actions, ...state }) => (
        <FlexList>
          <FlexList direction="column">
            <Input
              placeholder="Title"
              onChange={({ target }) => actions.updateTitle(target.value)}
              value={state.title}
            />
            <Input
              placeholder="Description"
              onChange={({ target }) => actions.updateDescription(target.value)}
              value={state.description}
            />
          </FlexList>
          <TodoItem {...state} actions={actions} />
        </FlexList>
      )}
    </Connect>
  </Provider>
);

export default SingleExample;
