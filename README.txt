CARDÁPIO DIN DIN — SITE

Arquivos:
- index.html       = página inicial
- tv.html          = tela que fica na TV
- admin.html       = painel para marcar sabores
- app.js           = funcionamento do site
- style.css        = visual
- firebase-config.js = configuração do Firebase

MODO DEMONSTRAÇÃO:
Abra admin.html e toque nos sabores. A alteração é salva no navegador.
Para testar TV e painel no MESMO aparelho, abra tv.html e admin.html em abas do mesmo navegador.

IMPORTANTE:
O modo demonstração NÃO sincroniza celular e TV diferentes.

MODO REAL:
1. Crie um projeto no Firebase.
2. Adicione um aplicativo Web.
3. Ative Realtime Database.
4. Copie a configuração do Firebase para firebase-config.js.
5. Configure as regras do Realtime Database.
6. Publique os arquivos no GitHub Pages.

BANCO ESPERADO:
flavors/
  chocolate: true
  buriti: true
  maracuja: true
  ...
  cupuacu: true

true = disponível
false = esgotado

SEGURANÇA:
Não deixe o Realtime Database aberto para qualquer pessoa escrever em produção.
O ideal é configurar autenticação e regras para permitir escrita apenas ao administrador.

IMAGEM DO CARDÁPIO:
A primeira versão recria o cardápio em HTML para que o X/ESGOTADO possa aparecer exatamente sobre cada sabor.
Quando você enviar a imagem final do cardápio, ela pode ser incorporada ao layout como fundo/arte visual.
