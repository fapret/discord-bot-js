[👉English version](https://git.fapret.com/fapret/discord-bot-js/-/blob/main/README_en.md)

# Fapret Discord Bot
 Fapret Discord Bot es el bot de discord programado por fapret, posee multiples funcionalidades como musica, acciones, etc.
# Licencia
 Copyright 2022 Santiago Nicolas Diaz Conde

 Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

 El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

 Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

 Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

 EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
# Dependencias
 -Nodejs v16  
 Todas las demas dependencias son instaladas con npm i / npm ci  

 Algunos plugins necesitan algunas dependencias en especifico.    
 Para el plugin de Musica:  
 -FFmpeg

# Proceso de instalacion (Ubuntu)
 Ejemplo de proceso de instalacion en una instalacion limpia de Ubuntu 21.04 con todos los modulos y plugins incluidos.  

 Primero es necesario instalar Nodejs v16 (o una version superior)
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

 El bot necesita que se coloque un token de discord, esto se puede realizar editando el archivo .env  
 Una vez colocado el token del bot de discord puedes iniciar el bot con el siguiente comando (estando en la raiz del bot):
  ```sh
node .
 ```