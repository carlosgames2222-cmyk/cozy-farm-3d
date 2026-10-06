# Cozy Farm 3D no Android e iPhone

O jogo continua tendo uma única fonte web em `fazenda.html.html`. O script `npm run mobile:prepare` cria `www/index.html` e inclui localmente a versão Three.js usada pelo jogo, para que o aplicativo não dependa de carregar essa biblioteca pela internet.

O aplicativo nativo está bloqueado em modo paisagem (landscape) em Android e iPhone/iPad.
Em telas táteis, use o analógico reduzido à esquerda (cima/baixo anda; esquerda/direita vira) e faça pinça com dois dedos sobre o mapa para ajustar o zoom. O botão **Sementes** abre a seleção manual da cultura. Os botões **Plantar**, **Construir** e **Loja** ficam compactos na barra inferior. Durante o plantio, arraste um dedo pelos canteiros vazios para plantar em sequência.

## Web App (PWA): jogar no iPhone e Android sem Mac

O PWA usa o mesmo jogo e pode ser instalado nos dois sistemas. No iPhone, abra o link publicado no Safari, toque em **Compartilhar > Adicionar à Tela de Início**. No Android, abra o link no Chrome e escolha **Instalar app** ou **Adicionar à tela inicial** no menu. Não é necessário Mac, Xcode, TestFlight ou APK para instalar o PWA. O APK Android continua disponível como alternativa nativa; iPhone não instala APK.

Para preparar os arquivos do site:

```powershell
npm install
npm run pwa:build
```

O site pronto estará na pasta `www`. Para publicar sem configurar ferramentas de desenvolvimento, entre no [Netlify Drop](https://app.netlify.com/drop), faça login e arraste a pasta `www` para a área de publicação. O endereço HTTPS gerado é o link para abrir e instalar no celular. HTTPS é necessário para instalação e funcionamento offline. O projeto também inclui `netlify.toml` para publicar `www` automaticamente quando conectado a um repositório no Netlify.

Depois de mudar o jogo, execute `npm run pwa:build` novamente e publique a pasta `www` atualizada. O site busca a versão mais recente quando há conexão; o service worker mantém a última versão carregada disponível offline. O progresso do jogo fica salvo no armazenamento local do navegador daquele dispositivo e não é sincronizado entre aparelhos.

## Android: instalar o APK preparado

O APK debug atualizado está em `Fazenda3D.apk`, na pasta principal do projeto.

1. Copie `Fazenda3D.apk` para o Android por cabo USB ou baixe-o no celular.
2. Abra o arquivo no celular e, se solicitado, permita a instalação de apps da origem usada para abrir o APK.
3. Toque em **Instalar**. O jogo abre em paisagem e inclui os controles táteis.

## Preparar ou recompilar o projeto Android

Instale Node.js 22 ou mais recente, npm, JDK 17+ e Android SDK. Na pasta do projeto:

```powershell
npm install
npm run android:sync
android\gradlew.bat -p android assembleDebug
```

O APK gerado fica em `android/app/build/outputs/apk/debug/app-debug.apk`. Para instalar em um aparelho conectado com depuração USB, use `adb install -r android\app\build\outputs\apk\debug\app-debug.apk`.

No Mac, use `npm run ios:sync`.

Para abrir o projeto no Android Studio:

```powershell
npm run android:open
```

Para criar a plataforma Android pela primeira vez em outro checkout, use `npm run android:add` em vez de `npm run android:sync`. Para publicar ou distribuir fora de um teste local, gere um **APK/AAB assinado de release** no Android Studio. Crie e guarde o keystore e as senhas em local seguro; não os adicione ao projeto nem os envie em mensagens.

O APK debug desta versão é compilado localmente. Para compilar em outra máquina, instale JDK 17+ e Android SDK.

## Atualizações online do jogo (Capgo)

O aplicativo está preparado para receber atualizações OTA de HTML, CSS, JavaScript e imagens do jogo. Alterações nativas (plugins, permissões, orientação, configurações Android/iOS) ainda precisam de um novo APK ou build iOS. O atualizador procura atualizações ao abrir/voltar ao app e aplica-as ao sair e abrir o jogo novamente. Use isso para atualizar o próprio jogo, não para enviar código ou dados privados: os bundles são entregues aos dispositivos.

Para ativar no seu telefone:

1. Crie uma conta no [Capgo](https://capgo.app/register/) e registre um app Android com o identificador `com.cozyfarm.fazenda3d`. Crie o canal `production`.
2. Instale o APK mais recente compilado com o plugin Capgo. Essa reinstalação é necessária uma única vez para adicionar o mecanismo nativo de atualização ao app que já está no celular.
3. No computador, autentique a CLI com a chave de API da sua conta:

   ```powershell
   npx @capgo/cli@latest login SUA_CHAVE_API
   ```

   Não coloque a chave no código, neste documento ou em um repositório público.

4. Publique a versão inicial do jogo:

   ```powershell
   npm run capgo:upload
   ```

Depois de cada alteração web do jogo, execute `npm run capgo:upload` para publicar o bundle; o APK instalado buscará a atualização quando voltar a ficar online. O comando prepara os arquivos móveis antes de enviá-los. A publicação não é disparada automaticamente ao salvar um arquivo: automação a cada envio de código exige conectar o projeto a um repositório e configurar CI com a chave da API guardada como segredo. Este diretório ainda não está conectado a um repositório remoto.

## iPhone: instalar pelo TestFlight

O TestFlight exige um Mac com Xcode para assinar e enviar o app, além de uma conta ativa no Apple Developer Program. O projeto pode ser preparado no Windows, mas não é possível compilar, assinar ou enviar o app para TestFlight sem macOS/Xcode e as credenciais da equipe Apple.

1. Em um Mac, instale Xcode, Node.js 22 ou mais recente e CocoaPods.
2. Antes de distribuir, escolha um **Bundle Identifier** único, por exemplo `com.suaempresa.cozyfarm`, e altere `appId` em `capacitor.config.json`. Configure esse mesmo identificador no Apple Developer e no App Store Connect.
3. Instale dependências e gere a plataforma:

   ```bash
   npm install
   npm run ios:add
   npm run ios:open
   ```

4. No Xcode, selecione a equipe Apple em **Signing & Capabilities** e confira o identificador do app.
5. Selecione um destino **Any iOS Device (arm64)** e escolha **Product > Archive**.
6. No Organizer, escolha **Distribute App > App Store Connect > Upload**. Depois que o processamento terminar no App Store Connect, adicione testadores internos ou externos à versão de teste.
7. No iPhone, instale o app **TestFlight**, aceite o convite por e-mail/link e toque em **Instalar**.

Testes externos podem exigir a revisão beta da Apple. Este workspace não contém assinatura Apple, certificados ou acesso ao App Store Connect; nenhum build foi publicado/enviado ao TestFlight.

## Comandos comuns

| Tarefa | Comando |
| --- | --- |
| Regenerar os arquivos web locais | `npm run mobile:prepare` |
| Atualizar o projeto Android | `npm run android:sync` |
| Abrir projeto Android Studio | `npm run android:open` |
| Atualizar projeto iOS (Mac) | `npm run ios:sync` |
| Abrir projeto Xcode (Mac) | `npm run ios:open` |
