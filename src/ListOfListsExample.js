import React from 'react';
import { v4 } from 'uuid';
import { Button, Input, Card, Box, FlexList, Flex } from '@procore/core-react';
import { withStateHandlers, lifecycle } from 'recompose';
import { createStore } from 'redux';
import { createModule } from 'redux-modules';
import { Provider } from 'react-redux';
import { Cmd, loop, liftState, install } from 'redux-loop';

import { todoListModel, TodoList } from './ListExample';
import Connect from './Connect';
import ChildConnect from './ChildConnect';

const post = (url, payload) => new Promise((resolve) =>
  setTimeout(() => {
    const id = v4()
    const self = `${url}/${id}`
    const mockResponse = { status: 200, body: { list: { ... payload, id, urls: { self, todos: `${self}/todos` }} } }
    console.log('post::', url, mockResponse)
    resolve(mockResponse)
  }, 500)
)

const todoListsModel = createModule({
  name: 'todoLists',
  initialState: {
    lists: [],
  },
  composes: [liftState],
  transformations: {
    init: (s, { payload }) => ({ ...s, ...payload }),
    addList: ({ lists, ...state }, { payload: list = { todos: [] } }) => {
      const id = `optimistic-${v4()}`
      return loop(
        { lists: lists.concat({ ...list, id, todos: [] }), ...state },
        Cmd.run(post, {
          args: [state.urls.lists, list],
          successActionCreator: response =>
            todoListsModel.actions.updateList({ action: todoListModel.actions.init(response.body.list) }, { id }),
          failActionCreator: todoListModel.actions.addTodoFail,
        })
      )
    },
    removeList: ({ lists, ...state }, { payload: id }) => ({ lists: lists.filter(t => t.id !== id), ...state }),
    updateList: ({ lists, ...state }, { payload, meta }) => {
      const listToUpdate = lists.find(lists => lists.id === meta.id);
      const [updatedList, listEffects] = todoListModel.reducer(listToUpdate, payload.action);
      const updatedState = {
        lists: lists.map(t => t.id === meta.id ? updatedList : t),
        ...state
      };

      return loop(
        updatedState,
        Cmd.map(listEffects, action => todoListsModel.actions.updateList({ action }, { id: meta.id }))
      );
    },
  },
});

const store = createStore(todoListsModel.reducer, { lists: [] }, install());

const FormState = withStateHandlers({}, {
  update: (state) => (attr, value) => ({ ...state, [attr]: value }),
  clear: () => () => ({ name: '', description: '' }),
})(({ children, ...props }) => children(props));

const List = ({ actions, lists }) => (
  <Box padding="md">
    <Flex alignItems="flex-start" justifyContent="center">
      <FormState>
        {({ name, description, update, clear }) => (
          <FlexList direction="column">
            <Input
              placeholder="Name"
              onChange={({ target }) => update('name', target.value)}
              defaultValue={name}
            />
            <Input
              placeholder="Description"
              onChange={({ target }) => update('description', target.value)}
              defaultValue={description}
            />
            <FlexList>
              <Button onClick={() => {
                actions.addList({ name, description });
                clear();
              }}>
                Add List
              </Button>
              <Button onClick={clear} variant="secondary">
                Clear
              </Button>
            </FlexList>
          </FlexList>
        )}
      </FormState>
    </Flex>
    <Box padding="md">
      <FlexList justifyContent="center" alignItems='center"'>
        {lists.map(list => (
          <ChildConnect key={list.id} actions={todoListModel.actions} dispatch={actions.updateList} meta={{ id: list.id }}>
            {childActions => (
              <TodoList {...list} actions={childActions} />
            )}
          </ChildConnect>
        ))}
      </FlexList>
    </Box>
  </Box>
)

const StandaloneListOfLists = lifecycle({
  componentWillMount() {
    this.props.actions.init({ urls: { lists: 'todoLists' } })
  }
})(List)

const ListExample = () => (
  <Provider store={store}>
    <Connect selector={s => s} actions={todoListsModel.actions}>
      {({ actions, ...state }) => (
        <StandaloneListOfLists actions={actions} {...state} />
      )}
    </Connect>
  </Provider>
);

export default ListExample;
