const  express = require('express');
const User = require("../models/User");
const watchList = require("../models/watchList");
const router = express.Router();
const  {body,validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const authenticate = require('../middlewares/authenticate')

/*
user Router
Usage : Register a User
URL :${BASE_URI_BACKEND}/api/users/register
parameters : name ,email,password
methode : post
access : public
*/

router.post('/register' ,[
    body('name').notEmpty().withMessage('name is required'),
    body('email').notEmpty().withMessage('email is required'),
    body('password').notEmpty().withMessage('password is required')

] ,async (request,response) => {
    let error =validationResult(request)
    if (!error.isEmpty()){
        return response.status(401).json({error : error.array()})
    }
    try{
        let {name, email , password} = request.body;

        // check if user already exists or not
           let user = await User.findOne({email :email });
           if(user){
               return response.status(401).json({error : [{message : 'user is already Exist'}]})
           }

        // encrypt the password
        let salt = await bcrypt.genSalt(10);
           password = await bcrypt.hash(password , salt);

        // save to db

         user = new User({name , email , password  });
         user = await  user.save();


         response.status(200).json({
             message : 'registration is successful'
         })


    }
    catch (error) {
        console.error(error)
        response.json({
            error : [{message : error.message}]
        })
    }
});

/*
user Router
Usage : Login a User
URL :${BASE_URI_BACKEND}/api/users/login
parameters : email,password
methode : post
access : public

*/

router.post('/login' ,  [
    body('email').notEmpty().withMessage('enter email'),
    body('password').notEmpty().withMessage('enter password')
    ],
     async (request,response) => {
         let error = validationResult(request);
         if (!error.isEmpty()){
             return response.status(401).json({error : error.array()})
         }
         try{

        let {email,password} = request.body;
        //check user is exist or not

             let user = await User.findOne({email : email})
             if (!user){
                 return response.status(401).json([{message : 'email not exists'}])
             }

             // check the password
             let isMatch = await bcrypt.compare(password, user.password);
             if (!isMatch){
                 return response.status(401).json([{message : 'invalid credential'}])
             }
             // create Jwt Token
             let payload = {
                 userInfo : {
                     id : user.id,
                     name : user.name
                 }
             };

             jwt.sign(payload,'Movies4U' , (err , token) => {
                 if (err) throw err;
                 return response.status(200).json({
                     msg : 'Login  Successful',
                     token : token,
                     user : user
                 })
             })

    }
    catch (error) {
        console.error(error)
        response.json({
            error : [{message : error.message}]
        })
    }
});


/*
user Router
Usage : Get User
URL :${BASE_URI_BACKEND}/api/users/
parameters : no filed required
methode : get
access : Private

*/
router.get('/' ,authenticate,async (request , response) => {

    try {

        let user = await User.findById(request.user.id);
        response.status(200).json({user : user});

    }
    catch(error) {
        console.log(error);
        return response.status(500).json({
            error : [{message : error.message}]
        })
    }
})

// add to watch list


router.post('/watchlist' , async(request, response) => {
    
    
    try{
        let {Title, Year,imdbID,Type,Poster } = request.body;

        // check if user already exists or not
           let movie = await watchList.findOne({Title : Title });
           if(movie){
               return response.status(401).json({error : [{message : 'Movie already in Watch List'}]})
            }

        // save to db

        movie = new watchList({Title, Year,imdbID,Type,Poster });
        movie = await  movie.save();


         response.status(200).json({
             message : 'Added to Watch List',
             movie : movie
         })


    }
    catch (error) {
        console.error(error)
        response.json({
            error : [{message : error.message}]
        })
    } 
    
})

// get all watch list

router.get('/watchlist/all' , async(request, response) => {
    
    
    try{
        // check if user already exists or not
         let movie = await watchList.find({});
         response.status(200).json({
             movie : movie
         })
    }
    catch (error) {
        console.error(error)
        response.json({
            error : [{message : error.message}]
        })
    } 
    
})

// remove from watch list

router.post('/watchlist/:id' , async(request, response) => {

    try{
        let id = request.params.id
        // check if user already exists or not
        let movie = await watchList.findByIdAndRemove(id);
        response.status(200).json({
            movie : movie
        })
    }
    catch (error) {
        console.error(error)
        response.json({
            error : [{message : error.message}]
        })
    }

})

module.exports = router



