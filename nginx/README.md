# NGINX Installation For Mac

Follow this guide to install and configure Nginx for usage with this project. For a understanding of the overall architecture, see the [Deployment Architecture](#deployment-architecture) section.

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

# Deployment Architecture

## Semi-Hosted Deployment (Recommended)

A deployment architecture diagram is shown below using the frontend deployed locally and the backend deployed on the hosted DEV/DEV2 tiers. This avoids the need to install and configure the entire backend tech stack.

```mermaid
---
title: Semi-Hosted Deployment Architecture
---
flowchart TD
    id0["Browser – You"]
    id1["Nginx – port:4010"]
    id2["FE – port:3010"]
    id3["DEV Backend"]
    id4["DEV AuthZ"]
    id5["DEV AuthN"]

    id0 <--"https://localhost:4010"--> id1
    subgraph lh[" "]
        subgraph nx["Nginx – Reverse Proxy"]
          id1
        end
        subgraph be["DEV/DEV2 Hosted Backend Services"]
          id1 --"/api/graphql"---> id3
          id1 --"/api/authn/"---> id4
          id1 --"/api/authz/"---> id5
        end
        subgraph fe["Frontend Services"]
          id2
        end
        id1 <--"*Catch All*"--> fe
    end
```

## Local Deployment

An overview of the local deployment architecture is shown below using the following locally hosted tech stack:

- Frontend – <https://github.com/CBIIT/crdc-datahub-ui>
- Backend – <https://github.com/CBIIT/crdc-datahub-backend>
- AuthZ – <https://github.com/CBIIT/crdc-datahub-authz>
- AuthN – <https://github.com/CBIIT/crdc-datahub-authn>
- MongoDB

Please see the individual repos for installation and configuration instructions.

```mermaid
---
title: Local Deployment Architecture
---
flowchart TD
    id0["Browser"]
    id1["Nginx – port:4010"]
    id2["FE – port:3010"]
    id3["BE – port:4020"]
    id4["AuthZ – port:4030"]
    id5["AuthN – port:4040"]
    id6["MongoDB"]

    id0 <--"https://localhost:4010"--> id1
    subgraph lh[" "]
        subgraph nx[" "]
          id1
        end
        id1 --"/api/graphql"---> be
        id1 --"/api/authn/graphql"---> be
        id1 --"/api/authz/graphql"---> be
        subgraph be["Backend Services"]
        direction RL
          id3
          id4
          id5
          subgraph misc["Misc. Dependencies"]
            id6
          end
          id3-->misc
          id4-->misc
          id5-->misc
        end
        subgraph fe["Frontend Services"]
          id2
        end
        id1 <--"*Catch All*"--> fe
    end
```
