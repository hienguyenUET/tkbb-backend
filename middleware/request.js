module.exports = (req, res, next) => {
    req.getParam = (key, defaultValue) => {
        const value = [req.body[key], req.query[key], req.params[key], defaultValue].find(v => v !== undefined)

        if (value === undefined) {
            // need throw exception to break api handle
            // express error will catch it
            throw `missing param ${key}`
        }

        return value
    }

    res.success = (data, option) => {
        const response = {}

        if (!option) {
            option = {}
        }

        if (option.meta) {
            response.meta = option.meta
        }

        if (data !== undefined) {
            response.data = data
        }

        res.status(option.code || 200)
        res.json(response)
    }

    res.error = (error, option={}) => {
        res.status(option.code || 400)

        if (typeof error === 'string') {
            error = {
                message: error,
            }
        }

        res.json({
            error: {
                url: req.originalUrl,
                method: req.method,
                ...error,
            }
        })
    }

    res.assert = (cond, message) => {
        if (!cond) {
            throw new Error(message)
        }
    }

    next()
}