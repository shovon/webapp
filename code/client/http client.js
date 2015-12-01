import superagent from 'superagent'

export default class http_client
{
	// Constructs a new instance of Api Client.
	// Optionally takes an Http Request as a reference to mimic (for example, cookies).
	// This feature is used for Api calls during server side rendering 
	// (this way server side Http Api calls mimic client side Http Api calls).
	constructor(clone_request, prefix)
	{
		if (typeof clone_request === 'string')
		{
			prefix = clone_request
			clone_request = undefined
		}

		this.prefix = prefix || ''

		const http = {}

		const http_methods =
		{
			get    : 'get',
			post   : 'post',
			call   : 'post',
			create : 'post',
			put    : 'put',
			update : 'put',
			patch  : 'patch',
			delete : 'del'
		}

		for (let method of Object.keys(http_methods))
		{
			this[method] = (path, data, options) =>
			{
				// options = options || {}

				const http_method = http_methods[method]

				if (!http_method)
				{
					throw new Error(`Api method not found: ${method}`)
				}

				const url = this.format_url(path)

				return new Promise((resolve, reject) =>
				{
					const request = superagent[http_method](url)

					if (data)
					{
						if (http_method === 'post')
						{
							request.send(data)
						}
						else
						{
							request.query(data)
						}
					}

					if (_server_)
					{
						if (clone_request.get('cookie'))
						{
							request.set('cookie', clone_request.get('cookie'))
						}
					}

					if (options && options.locale)
					{
						request.set('accept-language', locale)
					}

					request.end((error, response) => 
					{
						if (error)
						{
							console.error(error.stack)
							
							return reject(error) // (response && response.body) || 
						}

						resolve(response.body)
					})
				})
			}
		}
	}

	format_url(path)
	{
		// add slash in the beginning
		let normalized_path = path[0] !== '/' ? '/' + path : path

		if (_server_)
		{
			// Prepend host and port of the API server to the path.
			return `http://${configuration.web_server.http.host}:${configuration.web_server.http.port}${this.prefix}${normalized_path}`
		}

		// Prepend prefix to relative URL, to proxy to API server.
		return this.prefix + normalized_path
	}
}