import React from 'react';
import { v4 } from 'uuid';
import { Button, Input, Card, Box, FlexList, Flex } from '@procore/core-react';
import { withStateHandlers } from 'recompose';
import { createStore } from 'redux';
import { createModule } from 'redux-modules';
import { Provider } from 'react-redux';

import { todoListModel, TodoList } from './ListExample';
import Connect from './Connect';
import ChildConnect from './ChildConnect';

const todoListsModel = createModule({
  name: 'todoLists',
  initialState: {
    lists: [],
  },
  transformations: {
    init: s => s,
    addList: ({ lists, ...state }, { payload: list = { todos: [] } }) => ({ lists: lists.concat({ ...list, id: v4(), todos: [] }), ...state }),
    removeList: ({ lists, ...state }, { payload: id }) => ({ lists: lists.filter(t => t.id !== id), ...state }),
    updateList: ({ lists, ...state }, { payload, meta }) => {
      const listToUpdate = lists.find(lists => lists.id === meta.id);
      const updatedList = todoListModel.reducer(listToUpdate, payload.action);
      const updatedState = {
        lists: lists.map(t => t.id === meta.id ? updatedList : t),
        ...state
      };
      return updatedState;
    },
  },
});

const store = createStore(todoListsModel.reducer, { lists: [] });

const FormState = withStateHandlers({}, {
  update: (state) => (attr, value) => ({ ...state, [attr]: value }),
  clear: () => () => ({ name: '', description: '' }),
})(({ children, ...props }) => children(props));

const ListExample = () => (
  <Provider store={store}>
    <Connect selector={s => s} actions={todoListsModel.actions}>
      {({ actions, ...state }) => (
        <Box padding="md">
          <Flex alignItems="flex-start" justifyContent="center">
            <FormState>
              {({ name, description, update, clear }) => (
                <FlexList direction="column">
                  <Input
                    placeholder="Name"
                    onChange={({ target }) => update('name', target.value)}
                    value={name}
                  />
                  <Input
                    placeholder="Description"
                    onChange={({ target }) => update('description', target.value)}
                    value={description}
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
              {state.lists.map(list => (
                <ChildConnect actions={todoListModel.actions} dispatch={actions.updateList} meta={{ id: list.id }}>
                  {childActions => (
                    <TodoList {...list} actions={childActions} />
                  )}
                </ChildConnect>
              ))}
            </FlexList>
          </Box>
        </Box>
      )}
    </Connect>
  </Provider>
);

export default ListExample;
