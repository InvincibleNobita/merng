const postsResolvers = require('./posts');
const usersResolvers = require('./users');

//this file contains all the queries format of both posts&users. we can ask from our database using graphql-schema'


module.exports = {
    //query will take query from our post resolver
    Query: {
        ...postsResolvers.Query
        
    },
    //mutatioon will take mutation from ourusers resolvers
    Mutation: {
        ...usersResolvers.Mutation //it will go to usersresolvers and call mutation resolver
    }
    
}