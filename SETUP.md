# ISAAC — Guia de configuração das novas funcionalidades

## 1. Instalar as novas dependências

```bash
npx expo install expo-local-authentication expo-secure-store expo-location react-native-maps
```

---

## 2. Google Maps API Key (obrigatório para o mapa funcionar)

### Passo a passo:
1. Acesse https://console.cloud.google.com
2. Crie um projeto (ou use o existente)
3. Vá em **APIs e Serviços → Biblioteca**
4. Ative as APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Directions API** (para rotas reais futuramente)
5. Vá em **APIs e Serviços → Credenciais → Criar credencial → Chave de API**
6. Copie a chave gerada

### Onde colocar a chave:
No arquivo `app.json`, substitua **todas** as ocorrências de:
```
SUA_GOOGLE_MAPS_API_KEY_AQUI
```
pela sua chave real. Aparecem em 3 lugares:
- `expo.android.config.googleMaps.apiKey`
- `expo.ios.config.googleMapsApiKey`
- `expo.plugins[react-native-maps].googleMapsApiKey`

> ⚠️ O plano gratuito do Google Maps inclui USD $200/mês de crédito — suficiente para desenvolvimento e apps pequenos.

---

## 3. Biometria (Digital / Face ID)

Funciona automaticamente após o primeiro login normal:
- O app detecta se o dispositivo tem hardware de biometria
- Após o primeiro login, aparece a opção de ativar "Entrar com Digital" ou "Entrar com Face ID"
- Uma vez ativado, na próxima abertura do app o sistema biométrico dispara automaticamente
- As credenciais ficam salvas no **SecureStore** (armazenamento criptografado do sistema operacional)

**No emulador:** a biometria pode não estar disponível. Use um dispositivo físico para testar.
**No iOS Simulator:** Face ID funciona em Menu → Features → Face ID → Enrolled.

---

## 4. Mapa de rastreamento

O mapa aparece na tela de detalhe do chamado quando o status é **"Em andamento"**:
- **Cliente:** botão "Acompanhar técnico" — vê o técnico se movendo no mapa
- **Técnico:** botão "Navegar até o cliente" — vê o destino e sua posição

**Posição atual:** usa GPS real do dispositivo para o técnico (se permissão concedida).  
**Movimento animado:** demo de 12 minutos interpolado em 60 passos, atualiza a cada 2 segundos.  
**Para produção:** conectar a um backend WebSocket que envia coordenadas GPS reais do técnico.

---

## 5. Rebuild necessário

Após instalar as novas dependências (especialmente `react-native-maps`), é necessário um novo build EAS:

```bash
eas build --platform android --profile preview
```

O Expo Go padrão **não** inclui `react-native-maps` — use o **Expo Dev Client** para testar localmente:

```bash
npx expo install expo-dev-client
eas build --platform android --profile development
```
