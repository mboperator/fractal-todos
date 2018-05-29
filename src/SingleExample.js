import React from 'react';
import { Input, Card, Box, FlexList } from '@procore/core-react';

import { createStore } from 'redux';
import { createModule } from 'redux-modules';
import { Provider } from 'react-redux';
import Connect from './Connect';
import T from './torrey';


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
  description = 'Mock APIs for state management.',
  actions: { updateStatus }
}) => (
  <Card>
    <Card.TipHeader
      style={{
        backgroundColor: status === 'IN_PROGRESS'
          ? 'papayawhip'
          : 'mediumspringgreen'
      }}
      onClick={() =>
        status === 'IN_PROGRESS'
          ? updateStatus('COMPLETE')
          : updateStatus('IN_PROGRESS')
      }
    >
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
    <T.Root model={itemModel}>
      {({ actions, ...item }) => (
        <FlexList>
          <FlexList direction="column">
            <Input
              placeholder="Title"
              onChange={({ target }) => actions.updateTitle(target.value)}
              value={item.title}
            />
            <Input
              placeholder="Description"
              onChange={({ target }) => actions.updateDescription(target.value)}
              value={item.description}
            />
          </FlexList>
          <TodoItem {...item} actions={actions} />
        </FlexList>
      )}
    </T.Root>
  </Provider>
);

export default SingleExample;
