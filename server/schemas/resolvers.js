//* Define the query and mutation functionality to work with the Mongoose models.
const {Book, User} = require('../models')
const {signToken, AuthenticationError} = require('../utils/auth')

const resolvers ={
    Query:{
        users: async () => {
            return User.find().populate('thoughts');
          },
        user: async (parent, { username }) => {
            return User.findOne({ username }).populate('books');
          },
          book: async (parent, { bookId }) => {
            return Book.findOne({ _id: bookId });
          },
          me: async (parent, context) => {
            if (context.user) {
              return User.findOne({ _id: context.user._id }).populate('books');
            }
            throw new AuthenticationError('You need to be logged in!');
          },
    },
    Mutation:{
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
          },
          login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
      
            if (!user) {
              throw AuthenticationError;
            }
      
            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
              throw AuthenticationError;
            }
      
            const token = signToken(user);
      
            return { token, user };
          },

          //* saveBook: Accepts a book author's array, description, title, bookId, image, 
          //* and link as parameters; returns a User type. (Look into creating what's known as an 
          //* input type to handle all of these parameters!)
          saveBook: async (parent, { bookId }, context) => {
            if (context.user) {
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: bookId } },
                { new: true }
              ).populate('savedBooks');
      
              return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
          },
          removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId: bookId } } },
                { new: true }
              ).populate('savedBooks');
      
              return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
          },
        },
    };

module.exports = resolvers;
