import React from 'react';
import { v4 } from 'uuid';
import { Button, Input, Box, FlexList, Flex } from '@procore/core-react';
import { withStateHandlers } from 'recompose';
import ListExample, { TodoList } from './ListExample';
import { types } from "mobx-state-tree";
import { observer } from 'mobx-react';

const post = (url, payload) => new Promise((resolve) =>
  setTimeout(() => {
    const id = v4()
    const self = `${url}/${id}`
    const mockResponse = { status: 200, body: { list: { ... payload, id, urls: { self, todos: `${self}/todos` }} } }
    console.log('post::', url, mockResponse)
    resolve(mockResponse)
  }, 500)
)

const ListOfListsModel = types
  .model("ListOfLists", {
    id: types.identifier,
    lists: types.array(TodoList),
  })

const ListOfLists = ListOfListsModel.actions(listOfLists => ({
  addList: (list) => {
    listOfLists.lists.push(list)
  },
  removeList: (list) => {
    listOfLists.lists.remove(list)
  }
}))

const store = ListOfLists.create({
  id: v4(),
  lists: [],
})

const FormState = withStateHandlers({}, {
  update: (state) => (attr, value) => ({ ...state, [attr]: value }),
  clear: () => () => ({ name: '', description: '' }),
})(({ children, ...props }) => children(props));

const List = ({ actions, listOfLists }) => (
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
        {listOfLists.lists.map(list => (
          <ListExample key={list.id} todoList={list} />
        ))}
      </FlexList>
    </Box>
  </Box>
)

const FCompose = observer(List);

export default ({ listOfLists = store })=> {
  const actions = {
    addList: list => {
      const id = v4()
      listOfLists.addList(TodoList.create({
        id,
        endpoint: `/lists/${id}`,
        ...list
      }));
    },
    removeList: list => listOfLists.removelist(list),
  };

  return (
    <FCompose
      listOfLists={listOfLists}
      actions={actions}
    />
  )
}
