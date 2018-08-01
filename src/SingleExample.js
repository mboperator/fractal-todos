import React from 'react';
import { lifecycle } from 'recompose';
import { Input, Card, Box, FlexList } from '@procore/core-react';
import { createModule } from 'redux-modules';
import { install, Cmd, loop } from 'redux-loop';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import Connect from './Connect';

const post = (url, payload) => new Promise((resolve) =>
  setTimeout(() => {
    const mockResponse = { status: 200, body: { item: payload } }
    console.log('post::', url, mockResponse)
    resolve(mockResponse)
  }, 500)
)

export const itemModel = createModule({
  name: 'todoItem',
  initialState: { title: '', status: 'IN_PROGRESS', description : '' },
  transformations: {
    init: (state, { payload }) => [
      { ...state, endpoint: payload },
      Cmd.none
    ],
    updateTitle: (state, { payload: title }) => [
      { ...state, title },
      Cmd.run(
        post,
        {
          args: [state.endpoint, { title } ],
          successActionCreator: itemModel.actions.updateSuccess,
          failActionCreator: itemModel.actions.updateFail
        }
      )
    ],
    updateDescription: (state, { payload: description }) => [
      { ...state, description },
      Cmd.run(
        post,
        {
          args: [state.endpoint, { description } ],
          successActionCreator: itemModel.actions.updateSuccess,
          failActionCreator: itemModel.actions.updateFail
        }
      )
    ],
    updateStatus: (state, { payload: status }) => [
      { ...state, status },
      Cmd.run(
        post,
        {
          args: [state.endpoint, { status } ],
          successActionCreator: itemModel.actions.updateSuccess,
          failActionCreator: itemModel.actions.updateFail
        }
      )
    ],
    updateSuccess: (state, { payload: response }) => [
      { ...state, ...response.body.item },
      Cmd.none
    ],
    updateFail: (state, { payload: error }) => [
      { ...state, error },
      Cmd.none
    ]
  },
});

const store = createStore(itemModel.reducer, {}, install());


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

const StandaloneTodoItem = lifecycle({
  componentWillMount() {
    this.props.actions.init({ endpoint: 'item' })
  }
})(TodoItem)

const SingleExample = () => (
  <Provider store={store}>
    <Connect selector={s => s} actions={itemModel.actions}>
      {({ actions, ...state }) => (
        <FlexList>
          <FlexList direction="column">
            <Input
              placeholder="Title"
              onBlur={({ target }) => actions.updateTitle(target.value)}
              value={state.title}
            />
            <Input
              placeholder="Description"
              onBlur={({ target }) => actions.updateDescription(target.value)}
              value={state.description}
            />
          </FlexList>
          <StandaloneTodoItem {...state} actions={actions} />
        </FlexList>
      )}
    </Connect>
  </Provider>
);

export default SingleExample;
