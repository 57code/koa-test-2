const router = require('koa-router')()

router.get('/', async (ctx, next) => {
    console.log('home');

    ctx.session.foo = 'bar';

    await ctx.render('index', {
        title: 'Hello Koa 2!'
    })
})

router.get('/string', async (ctx, next) => {
    ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
    ctx.body = {
        title: 'koa2 json'
    }
})

// 上传
router.get('/upload', async ctx => {
    await ctx.render('upload-file', {layout: false})
});
const upload = require('koa-multer')({dest: './public/uploads'});

// 校验
const bouncer = require('koa-bouncer')

router.post('/upload',
    upload.single('file'),
    bouncer.middleware({getBody: ctx => ctx.req.body}), // 指定数据来源
    async (ctx, next) => {
        // 校验逻辑
        try { // 验证不通过会抛出bouncer.ValidationError
            ctx.validateBody('uname')
                .trim() // 数据净化
                .isLength(6, 20, '请填写用户名')
            await next();
        } catch (error) {
            console.log(error);
            ctx.body = '校验错误：' + error.message;
        }
    },
    async ctx => {
        console.log(ctx.req.file); // 注意数据存储在原始请求中
        // console.log(ctx.request.file);
        console.log(ctx.req.body);
        // console.log(ctx.request.body);        
        
        // 净化过后的数据从ctx.vals获取
        console.log(ctx.vals);
        
        ctx.body = '上传成功！';
    })

module.exports = router
