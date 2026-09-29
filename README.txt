CARDÁPIO DIGITAL DIN DIN

Arquivos:
- index.html = página inicial
- tv.html = tela pública da TV
- admin.html = painel de controle com login
- app.js = lógica e sincronização
- style.css = visual
- firebase-config.js = configuração do Firebase

Firebase:
- Realtime Database: /flavors
- Authentication: E-mail/senha

Depois de publicar os arquivos no GitHub Pages, use admin.html no celular para fazer login e alterar os sabores. tv.html fica aberto na TV.

IMPORTANTE: no Realtime Database, configure as regras para leitura pública e escrita apenas para usuários autenticados:
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
