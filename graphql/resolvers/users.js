const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const User = require('../../models/User');//since it requires user mongoose model
const { SECRET_KEY } = require('../../config');
const { UserInputError } = require('apollo-server');
const { validateRegisterInput } = require('../../util/validators');
const { validateLoginInput } = require('../../util/validators');
//
//function(parent,args,context,info)
//these 4 are resolver arguments-- we only will use args.
//parent / _ -> it gives u the result of what was te input from the last step
//since someimes we can hv multiple resoslvers,ie, data goes from 1 resolver to another before being returned
// args == the argument u provided to these resolver while definiign it in typedefs.
//either destructure args within the arguments bracket or inside the function.
//context- 
//info- just info abt. some metadata that we almost never need
// we can omit context & info for now

function generateToken(user){
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
      }, 
    SECRET_KEY, 
    { expiresIn: '24h' }
    );

}

module.exports = {
    Mutation : {
        //why async here? since bcryptjs function is an async one.:(
        async login(_,{ username, password }){
                const { valid, errors } = validateLoginInput(username, password);
                if(!valid){  
                    throw new UserInputError('Errors', { errors });
                }
                const user = await User.findOne({ username });
                if(!user){
                    errors.general = 'User not found';
                    throw new UserInputError('User not found', { errors });
                }
                const match = await bcrypt.compare(password, user.password);
                if(!match){
                    errors.general = 'Wrong Credentials';
                    throw new UserInputError('Wrong Credentials', { errors });
                }
                const token = generateToken(user);
            //cuz it will return user (of typedefs);P
            return {
                ...user._doc,
                id: user._id,
                token
            };
        },
        async register(
            _,
            { 
                registerInput : {username, email, password, confirmPassword} 
            },
            context,
            info
        ) {
            // TODO: Validate user data

            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
            
            
            if(!valid){
                throw new UserInputError('Errors', { errors });
            }
            // TODO: mkes sure user doesnt already exist
            
            //we need to send payload without error so we can use it on our client-side.
            const user = await User.findOne({ username });
            if (user) {
                throw new UserInputError('Username is already taken', {
                    //this errorss object will be used later on our front-end side.
                    errors: {
                        username: 'This username is taken'
                    }
                })
            }


            //hash password and create an auth token

            //bcrypt.hash(password,no of rounds<ususlly 12 is good>)
            password = await bcrypt.hash(password, 12)
            
            //this is the mongoose model 
            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = generateToken(res);
            //cuz it will return user (of typedefs);P
            return {
                ...res._doc,
                id: res._id,
                token
            };
            
        }

    }
}