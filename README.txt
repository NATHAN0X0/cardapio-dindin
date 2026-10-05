CARDÁPIO DIGITAL - DIN DIN
==========================

Estrutura
---------
index.html            Página inicial
admin.html            Painel para controlar os sabores
app.js                Firebase + painel administrativo
firebase-config.js    Configuração do projeto Firebase
tv.html               Cardápio que fica aberto na TV
tv.js                 Leitura do Firebase pela TV (API REST; compatível com TVs/Androids antigos)
style.css             Estilos

database.rules.json   Regras sugeridas para o Realtime Database

Como funciona
-------------
1. A TV abre tv.html.
2. tv.js lê /flavors no Firebase pela API REST.
3. O administrador entra em admin.html com e-mail e senha do Firebase.
4. Ao alterar um sabor, app.js grava em /flavors.
5. A TV consulta novamente o Firebase a cada 5 segundos e atualiza a tela.

IMPORTANTE: CONFIGURAR O FIREBASE
---------------------------------
No Firebase Console:

1. Abra o projeto "cardapio-dindin".
2. Entre em Realtime Database > Rules.
3. Use as regras do arquivo database.rules.json:

{
  "rules": {
    "flavors": {
      ".read": true,
      ".write": "auth != null",
      "$flavor": {
        ".validate": "newData.isBoolean()"
      }
    }
  }
}

4. Publique as regras.
5. Em Authentication > Sign-in method, ative Email/Password.
6. Crie o usuário administrador em Authentication > Users.

PUBLICAÇÃO NO GITHUB PAGES
--------------------------
Envie estes arquivos para a mesma pasta do repositório:

- index.html
- admin.html
- tv.html
- tv.js
- app.js
- firebase-config.js
- style.css
- database.rules.json

O arquivo tv-legacy.js antigo não é mais necessário.

Depois de publicar, abra:

https://SEU-USUARIO.github.io/SEU-REPOSITORIO/tv.html

Para o administrador:

https://SEU-USUARIO.github.io/SEU-REPOSITORIO/admin.html

TESTE RÁPIDO
------------
Abra tv.html. A tela deve mostrar os sabores imediatamente.
O indicador deve passar por "Conectando ao Firebase..." e, se o banco estiver acessível,
ficar em "● CONECTADO • sincronização pela internet".

Se tv.js não for publicado no GitHub, a TV mostrará um erro informando que o arquivo não carregou,
em vez de ficar presa em "Modo demonstração".
