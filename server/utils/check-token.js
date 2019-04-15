const jwt = require('jsonwebtoken');
const PRIVATE_KEY = 'abc';
const whiteList = [
	{url: '/user/create', method: 'post'},
	{url: '/login', method: 'get'},
	{url: '/article', method: 'get'}];
const createToken = (contentOptions) => {
	if (!contentOptions) {
		return
	}
	return jwt.sign(contentOptions, PRIVATE_KEY, {
		expiresIn: 60*60*24*7
	})
};

const verifyToken = token => {
	let result;
	jwt.verify(token, PRIVATE_KEY, (err, decode) => {
		result =  err ? {err} : true;
	});
	return result;
};
const checkToken = (ctx, next) => {
	if (whiteList.some(router => ctx.url === router.url && ctx.method === router.method.toUpperCase())) {
		return next();
	} else{
		let hasToken = verifyToken(ctx.header.authorization);
		return hasToken === true ? next() : ctx.body = {
			code: 900,
			message: hasToken.err.message,
			result: null
		};
	}
};

module.exports = {createToken, verifyToken, checkToken};