const Redis = require('ioredis');
const redis = new Redis({
	host: '118.24.181.75',       //安装好的redis服务器地址
	port: '6379',       //端口
	prefix: 'test',     //存诸前缀
	ttl: '12',        //过期时间
	db: ''
});
module.exports = redis;

