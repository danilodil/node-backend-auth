# xilo-auth

### Setup
- Install [Node v10.7.0](https://nodejs.org/en/download/)
- Run `npm install` - to install node packages for the application.
- Run `npm run start` - to start application.

#### Environment variables

|  Key            | Description  |
|-----------------|--------------|
| `ENV`      | Enviroment-mode (e.g. 'local', 'development', 'production') |
| `DBNAME`        | Database name |
| `DBHOST`        | Database host |
| `DBPORT`        | Database port |
| `DBUSERNAME`    | Database username |
| `DBPASSWORD`    | Database password |

Create a .env file on root of project and add following

```
NODE_ENV=local 
database_url=postgres://soqpgbtpwhgzhh:8d723fcadfe13105bfffd21b797d2d425ec96889e291dc795dd846fa8d232146@ec2-18-235-97-230.compute-1.amazonaws.com:5432/d86hcp2ir2jh7b
DATABASE_URL_LOCAL=postgres://username:password@localhost:5432/local_auth
redis_url=redis://rediscloud:mvqpilbt5oiprcdndsjoryz5abtunasx@redis-12479.c12.us-east-1-4.ec2.cloud.redislabs.com:12479
DD_ENV=local
DD_LOGS_INJECTION=true
DD_TRACE_ANALYTICS=true
XILO_AUTH_SECRET=secret
XILO_AUTH_SESSION_SECRET=sessionsecret
```

