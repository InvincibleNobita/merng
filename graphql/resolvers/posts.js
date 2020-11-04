const Post = require('../../models/Post');

//this file contains all the queries format strictly related to posts we can ask from our database using graphql-schema'

module.exports = {
    Query: {
        async getPosts() {
            try{
                const posts = await Post.find();
                return posts;
            } catch (err) {
                throw new Error(err);
            }
        }
        
    }
}