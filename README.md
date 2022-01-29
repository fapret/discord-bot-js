# Fapret Discord Bot
 Fapret Discord Bot es el bot de discord programado por fapret, posee multiples funcionalidades como musica, acciones, etc.
# Licencia
 Este bot no posee una licencia para uso general, si deseas utilizar codigo de este bot, deberas solicitar permiso a Fapret.
 El uso, distribucion, venta, edicion o cualquier otra acción sobre y del codigo esta prohibida sin la autorizacion de Fapret.
# Dependencias
 -Nodejs v16  
 Todas las demas dependencias son instaladas con npm i / npm ci  

 Algunos plugins necesitan algunas dependencias en especifico.    
 Para el plugin de Musica:  
 -FFmpeg

# Proceso de instalacion (Ubuntu)
 Ejemplo de proceso de instalacion en una instalacion limpia de Ubuntu 21.04 con todos los modulos y plugins incluidos.  

 Primero es necesario instalar Nodejs v16
 ```sh
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt update
sudo apt-get install -y nodejs
 ```

 Luego instalamos la dependencias del plugin de musica < music > **(opcional)**
 ```sh
sudo apt-get install -y ffmpeg
 ```

 Luego instalamos las dependencias del plugin de bienvenida < welcome > y de diversion < fun > **(opcional)**
 ```sh
sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
 ```

 Por ultimo instalamos todas las dependencias restantes (Debemos estar situados en la raiz del bot)
 ```sh
npm install
 ```

 El bot necesita que se coloque un token de discord, esto se puede realizar editando el archivo config.json  
 Una vez colocado el token del bot de discord puedes iniciar el bot con el siguiente comando (estando en la raiz del bot):
  ```sh
node .
 ```