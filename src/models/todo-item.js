import { types, onSnapshot } from "mobx-state-tree"

const TodoNode = types
    .model("Todo", {
        id: types.identifier(),
        title: types.string,
        status: types.enumeration("Status", ["IN_PROGRESS", "COMPLETED"]),
        description: types.optional(types.string, ''),
      });


onSnapshot(TodoNode, (node)=> {
  console.log('API::SAVE_TODO', node);
});