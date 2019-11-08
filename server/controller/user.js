const Joi = require('joi');
const redis = require('../utils/redis');
const UserSchema = require('../schemas/user');
const createResponse = require('../utils/create-response');
const userSql = require('../sql/user');
const { createToken, verifyToken, getTokenResult } = require('../utils/check-token');
const user = {
	async login(ctx) {
		const requestBody = ctx.request.body;
		const response = createResponse();
		const {account, password} = requestBody;
		const validator = Joi.validate(requestBody, UserSchema.login);
		if (validator.error) {
			return ctx.body = {code: 400, message: validator.error.message}
		}
		let res = await userSql.queryUseExists({account, password});
		if (res && res.length) {
			response.message = '成功';
			const userInfo = res[0];
			delete userInfo.password;
			response.result = Object.assign({}, userInfo, {token: createToken(Object.assign({}, userInfo))});
		} else {
			response.code = 400;
			response.message = '账号或密码错误';
		}
		ctx.body = response;
	},
	async registerUser(ctx) {
		const requestBody = ctx.request.body;
		const response = createResponse();
		const {email, username, password, profilePicture} = requestBody;
		const validator = Joi.validate(requestBody, UserSchema.registerUser);
		if (validator.error) {
			return ctx.body = {code: 400, message: validator.error.message}
		}
		const findEmail = await userSql.queryUseExists({account: email, password});
		if (findEmail && findEmail.length > 0) {
			return ctx.body = {code: 400, message: '当前邮箱已被注册'}
		}
		const findUser = await userSql.queryUseExists({account: username, password});
		if (findUser && findUser.length > 0) {
			return ctx.body = {code: 400, message: '当前用户名已被注册'}
		}
		let res = await userSql.registerUser({email, username, password, profilePicture});
		if (res && res.insertId !== undefined) {
			response.message = '成功';
		}
		ctx.body = response;
	},
	async getUserList(ctx) {
		let requestParams = ctx.request.query;
		let response = {
			code: 0,
			results: null,
			message: null
		};
		if (!requestParams.limit || !requestParams.offset) {
			response.message = '请上传分页信息';
			return ctx.body = response;
		}
		if (!requestParams.name) {
			requestParams.name = '';
		}
		let res = await userSql.getUserList(requestParams);
		if (res && res.length) {
			response.message = '成功';
			response.results = res;
		} else {
			response.code = 404;
			response.message = '信息不存在';
		}
		ctx.body = response;
	},

	async updateUser(ctx) {
		const id = ctx.params.id;
		const requestBody = ctx.request.body;
		const response = createResponse();
		const {email, username, password, oldPassword, profilePicture} = requestBody;
		const validator = Joi.validate(requestBody, UserSchema.updateUser);
		if (validator.error) {
			return ctx.body = {code: 400, message: validator.error.message}
		}
		const findUser = await userSql.queryUseExists(oldPassword ? {account: email, password: oldPassword} : {email, password});
		let findUserInfo;
		if (findUser && findUser.length > 0) {
			findUserInfo = findUser[0];
		} else {
			return ctx.body = {code: 400, message:  `${oldPassword ? '原' : ''}密码错误`}
		}

		let res = await userSql.updateUser(id, {email, username, password, profilePicture});
		if (res && res.insertId !== undefined) {
			response.message = `成功`;
		}
		//更改用户最新信息后获取最新用户信息详情
		const updateUser = await userSql.getUserInfo(id);
		const updateUserInfo = updateUser[0];
		response.result = Object.assign({}, updateUserInfo, {token: createToken(Object.assign({}, updateUserInfo))});
		delete response.result.password;
		ctx.body = response;
	},
	async checkUserAuth(ctx) {
		const response = createResponse();
		const authorization = ctx.header.authorization;
		let hasToken = await verifyToken(authorization);
		if (authorization && hasToken === true) {
			const userInfo = await getTokenResult(authorization);
			response.result = Object.assign({}, userInfo, {token: authorization});
			['exp', 'iat', 'password'].forEach(key => {
				delete response.result[key];
			});
			response.message = '成功'
		} else {
			response.code = 900;
			response.message = '登录状态已失效，请重新登录!'
		}
		ctx.body = response;
	},
	async loginOut(ctx) {
		const response = createResponse();
		const authorization = ctx.header.authorization;
		const isAuth = await verifyToken(authorization);
		const userInfo =  isAuth ? await getTokenResult(authorization) : null;
		if (userInfo) {
			const {id} = userInfo;
			redis.del(`user_${id}`);
		}
		response.code = 0;
		response.message = '成功';
		ctx.body = response;
	}
};

module.exports = user;
