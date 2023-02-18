const readline = require('readline');
const envfile = require('envfile');
const fs = require('fs');

let env = envfile.parse('./.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const execution = async function(){
  var aux = true;
  var answer = await new Promise(answer => {
    rl.question('Please put your discord bot token:\n', (answer));
  });
  env.TOKEN = answer;
  answer = await new Promise(answer => {
    rl.question('Please put your discord bot clientid:\n', (answer));
  });
  env.CLIENTID = answer;
  answer = await new Promise(answer => {
    rl.question('Please put your discord bot secret:\n', (answer));
  });
  env.SECRET = answer;
  answer = await new Promise(answer => {
    rl.question('Please put default bot language:[enter for default: es (spanish)]\n', (answer));
  });
  if(answer)
    env.LANG = answer;
  else
    env.LANG = 'es-ES';
  while(aux){
    answer = await new Promise(answer => {
      rl.question('Would you like to deploy frontEnd over HTTP?[y/n]:\n', (answer));
    });
    if(answer.toLowerCase() == 'y' || answer.toLowerCase() == 'true' || answer.toLowerCase() == 'yes'){
      answer = await new Promise(answer => {
        rl.question('On which port?[enter for default: 80]:\n', (answer));
      });
      let port = parseInt(answer);
      if(0 < port && port < 65565){
        aux = false;
        env.USEHTTP = true;
        env.HTTP_PORT = port;
      } else {
        aux = false;
        env.USEHTTP = true;
        env.HTTP_PORT = 80;
      }
      console.log('Selected Port: ' + env.HTTP_PORT);
    } else if(answer.toLowerCase() == 'n' || answer.toLowerCase() == 'false' || answer.toLowerCase() == 'no'){
      aux = false;
      env.USEHTTP = false;
    } else {
      console.log("Invalid input, must be `y`, `yes`, `true`, `n`, `no` or `false`.")
    }
  }
  aux = true;
  while(aux){
    answer = await new Promise(answer => {
      rl.question('Would you like to deploy frontEnd over HTTPS?[y/n]:\n', (answer));
    });
    if(answer.toLowerCase() == 'y' || answer.toLowerCase() == 'true' || answer.toLowerCase() == 'yes'){
      answer = await new Promise(answer => {
        rl.question('On which port?[enter for default: 443]:\n', (answer));
      });
      let port = parseInt(answer);
      if(0 < port && port < 65565){
        aux = false;
        env.USEHTTPS = true;
        env.HTTPS_PORT = port;
      } else {
        aux = false;
        env.USEHTTPS = true;
        env.HTTPS_PORT = 443;
      }
      console.log('Selected Port: ' + env.HTTPS_PORT);
    } else if(answer.toLowerCase() == 'n' || answer.toLowerCase() == 'false' || answer.toLowerCase() == 'no'){
      aux = false;
      env.USEHTTPS = false;
    } else {
      console.log("Invalid input, must be `y`, `yes`, `true`, `n`, `no` or `false`.")
    }
  }
  aux = true;
  while (aux && env.USEHTTPS) {
    answer = await new Promise(answer => {
      rl.question('Please specify public cert path:\n', (answer));
    });
    if(fs.existsSync(answer)){
      env.HTTPS_FULLCHAIN = answer;
      aux = false;
    } else {
      console.log('Cert doesnt exists on specified path');
    }
  }
  aux = true;
  while (aux && env.USEHTTPS) {
    answer = await new Promise(answer => {
      rl.question('Please specify private cert path:\n', (answer));
    });
    if(fs.existsSync(answer)){
      env.HTTPS_PRIVAYEKEY = answer;
      aux = false;
    } else {
      console.log('Cert doesnt exists on specified path');
    }
  }
  aux = true;
  if (env.USEHTTPS || env.USEHTTP) {
    answer = await new Promise(answer => {
      rl.question('Please specify Oauth Url:(optional, press enter to skip)\n', (answer));
    });
    env.OAUTH_URL = answer;
  }
  if (env.USEHTTPS || env.USEHTTP) {
    answer = await new Promise(answer => {
      rl.question('Please specify Invite Link:(optional, press enter to skip)\n', (answer));
    });
    env.INVITE_LINK = answer;
  }
  if (env.USEHTTPS || env.USEHTTP) {
    answer = await new Promise(answer => {
      rl.question('Please specify Redirect Url:(optional, press enter to skip)\n', (answer));
    });
    env.REDIRECT_URI = answer;
  }
  if (env.USEHTTPS || env.USEHTTP) {
    answer = await new Promise(answer => {
      rl.question('Please specify Session storage mode:[enter for default: file]\n', (answer));
    });
    env.SESSION_STORAGE_MODE = answer;
  }
  if(env.SESSION_STORAGE_MODE && env.SESSION_STORAGE_MODE.toLowerCase() == 'mysql'){
    answer = await new Promise(answer => {
      rl.question('Please specify mysql host:\n', (answer));
    });
    env.SESSION_MYSQL_HOST = answer;
    answer = await new Promise(answer => {
      rl.question('Please specify mysql user:\n', (answer));
    });
    env.SESSION_MYSQL_USER = answer;
    answer = await new Promise(answer => {
      rl.question('Please specify mysql password:\n', (answer));
    });
    env.SESSION_MYSQL_PASSWORD = answer;
    answer = await new Promise(answer => {
      rl.question('Please specify mysql database:\n', (answer));
    });
    env.SESSION_MYSQL_DATABASE = answer;
  }
  fs.writeFileSync('./.env', envfile.stringify(env));
  console.log('Configuration saved');
  console.log('Setup finished!');
  process.exit();
}
execution();