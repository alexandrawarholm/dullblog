
const express = require('express');
const db = require('./db.js');
const authUtils = require("./auth_utils.js");
const { verifyPassword } = require('./auth_utils.js');
const router = express.Router();

// endpoints ----------------------------------------

// user login -----------------------------
router.post("/users/login", async function(req, res, next) {
	//res.status(200).send("Hello from POST - /users/login").end(); 
	
	try {
		let data = await db.getAllUsers();
		//res.status(200).json(data.rows).end();
		let credString = req.headers.authorization;
    let cred = authUtils.decodeCred(credString);
	if (cred.username == "" || cred.password == "") {
        res.status(401).json({error: "No username or password"}).end();
        return;
    }else {
		if (data.rows.length > 0) {
			let userid= data.rows[0].id;
			//res.status(200).json({msg: "The user was created succefully"}).end();
			let isPasswordRight= verifyPassword(userid.password, userid.hash, userid.salt);
			if(isPasswordRight == true) {
				let tok= authUtils.createToken(username, userid);
				res.status(200).json({
					msg:"The login was successful!",
					token: tok
				}).end();

			}else {
				res.status(403).json({error:"Login not successful. Try again!"}).end();
				return;
			}
		
		}
		else {
			throw "The user doesn't exist";
		}		
	}
	}

	 catch(err) {
		next(err);
	}	    	
});

// list all users ------------------------
router.get("/users", async function(req, res, next) {

    try {
		let data = await db.getAllUsers();
		res.status(200).json(data.rows).end();
	}
	catch(err) {
		next(err);
	}	    	
});

// create a new user ----------------------
router.post("/users", async function(req, res, next) {

    let credString = req.headers.authorization;
    let cred = authUtils.decodeCred(credString);
    
    if (cred.username == "" || cred.password == "") {
        res.status(401).json({error: "No username or password"}).end();
        return;
    } 

    let hash = authUtils.createHash(cred.password);
    
    try {
		let data = await db.createUser(cred.username, hash.value, hash.salt);

		if (data.rows.length > 0) {
			res.status(200).json({msg: "The user was created succefully"}).end();
		}
		else {
			throw "The user couldn't be created";
		}		
	}
	catch(err) {
		next(err);
	}	
});



// delete a user --------------------------
router.delete("/users", async function(req, res, next) {    
	res.status(200).send("Hello from DELETE - /users").end(); 
});

// --------------------------------------------------
module.exports = router;

