const router = require('koa-router')()

// 注册路由前缀
router.prefix('/users')

router.get('/:id', async function (ctx) {
    console.log(ctx.query);
    console.log(ctx.params.id);
    const users = await ctx.db.query('select * from user');
    console.log(users);
    // ctx.throw(500,'aaa')
    // throw(new Error('aaa'))
    await ctx.render('users', {
        layout: false // 和express里面不一样，传false

    })
    // ctx.body = 'this is a users response!'
})

router.post('/', async (ctx) => {
    // ctx.body = ctx.request.body.username + '欢迎你！'
    const {query} = ctx.db;
    await query('select * from user')
    ctx.redirect('/')
})



module.exports = router
