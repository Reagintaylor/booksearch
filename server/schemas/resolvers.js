// book model
const { User } = require("../models");
// import token function from auth
const { signToken } = require("../utils/auth");
const { AuthenticationError } = require("apollo-server-express");

const resolvers = {

    Query: {
         me: async (parent, args, context) => {
             if (context.user){
                 return await User.findOne({ _id: context.user._id });
             }
             throw new AuthenticationError("Make sure you log in!")
         }
    },

    Mutation: {

        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
      
            if (!user) {
              throw new AuthenticationError('No user found with this email address');
            }
      
            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
      
            const token = signToken(user);
      
            return { token, user };
          },
          addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
          },
          saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
          const updatedUserBooks = await User.findByIdAndUpdate(
            { _id: context.user._id },
            { $push: { savedBooks: bookData } },
            { new: true }
          );
          return updatedUserBooks;
        }
          throw new AuthenticationError('You need to be logged in!');
        
      },
      removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
            const updatedUserBooks = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
          );
          return updatedUserBooks;
        }
        throw new AuthenticationError('You need to be logged in!');
        },
      },  
    
}

module.exports = resolvers;