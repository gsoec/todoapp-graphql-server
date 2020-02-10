const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const uuid = require('uuid');
const store = require('./store');
const { getTodos, setTodos } = store;
const { ApolloServer, gql } = require('apollo-server-koa');


const typeDefs = gql`
  type Todo {
    id: ID
    what: String
    done: Boolean
  }
  type Query {
    todos(search: String): [Todo]
  }
  type Mutation {
    todoCreate(what: String!, done: Boolean): Todo
    todoUpdate(id: ID!, what: String, done: Boolean): Todo
    todoDelete(id: ID): Boolean
    todoDeleteAll: Boolean
  }
`;

const resolvers = {
  Query: {
    todos: async (parent, args, context, info) => {
      const todos = await getTodos();
      if (!args.search) return todos;
      return todos.filter(item => item.what.indexOf(args.search) !== -1);
    }
  },
  Mutation: {
    todoCreate: async (_, { what, done }) => {
      let todos = await getTodos();
      const newTodo = {
        id: uuid.v4(),
        what,
        done,
      };
      todos = todos.concat([newTodo]);
      const err = await setTodos(todos);
      if (err) return null;
      return newTodo
    },
    todoUpdate: async (_, { id, what, done }) => {
      const todos = await getTodos();
      const idx = todos.findIndex(item => item.id === id);
      if (idx < 0) return null;
      todos[idx].what = what || todos[idx].what;
      todos[idx].done = done;
      const err = await setTodos(todos);
      if (err) return null;
      return todos[idx]
    },
    todoDelete: async (_, { id }) => {
      let todos = await getTodos();
      todos = todos.filter(item => item.id !== id);
      const err = await setTodos(todos);
      return !err
    },
    todoDeleteAll: async () => {
      const err = await setTodos([]);
      return !err
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const app = new Koa();

server.applyMiddleware({ app });

app.use(cors());
app.use(bodyParser());

const port = process.env.PORT || 3000;
app.listen({ port }, () =>
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`),
);

module.exports = {
  typeDefs,
  resolvers,
  ApolloServer,
  store,
  server,
};