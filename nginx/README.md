# NGINX Installation For Mac

Follow this guide to install and configure Nginx for usage with this project.

Install NGINX:

```bash
brew install nginx
```

Remove Default NGINX Configuration (Optional)

```bash
rm /usr/local/etc/nginx/nginx.conf.default
rm /usr/local/etc/nginx/nginx.conf
```

Clone Provided Configuration

```bash
cp ./nginx.conf /usr/local/etc/nginx/
```

> **Warning**: Do not confuse the [nginx.conf](./nginx.conf) file in this directory with the one in [conf/nginx.conf](../conf/nginx.conf). The latter is used for
> production deployments.

Start/Restart NGINX

```bash
brew services restart nginx
```

# React App Configuration

See the provided [.env](../.env.example) file for the required environment variables. At a minimum, include:

```properties
# ... other variables

REACT_APP_BACKEND_API="http://localhost:4010/api/graphql"

PORT=3010

# ... other variables
```

> **Note**: After modifying the .env file, you must completely restart the React app for the changes to take effect.
