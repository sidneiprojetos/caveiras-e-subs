# Gestão Operacional Sidnei

Sistema de Gestão de Integrantes, Divisões, Credenciais e Inteligência Operacional com Gemini 3.8 Flash e Firestore.

---

## Como fazer o Deploy na Vercel

O projeto já está configurado com `vercel.json` e `api/index.ts` prontos para rodar tanto a aplicação frontend (Vite + React) quanto as funções de inteligência artificial (Gemini) na Vercel.

### Método 1: Pelo GitHub (Recomendado)

1. **Exportar o Projeto**:
   - No menu superior do Google AI Studio, clique em **Export** e selecione **Export to GitHub** (ou baixe o arquivo ZIP e suba em um novo repositório seu no GitHub).

2. **Importar na Vercel**:
   - Acesse [vercel.com](https://vercel.com) e faça login.
   - Clique em **Add New...** > **Project**.
   - Selecione o repositório do projeto no seu GitHub e clique em **Import**.

3. **Configuração do Projeto na Vercel**:
   - **Framework Preset**: Selecione `Vite` (a Vercel detecta automaticamente).
   - **Root Directory**: `./` (padrão).
   - **Build Command**: `vite build` (ou padrão).
   - **Output Directory**: `dist` (padrão).

4. **Variáveis de Ambiente (Environment Variables)**:
   - Adicione a seguinte variável na tela de configuração da Vercel:
     - `GEMINI_API_KEY`: Sua chave de API do Google Gemini (obtida em [aistudio.google.com](https://aistudio.google.com)).

5. **Finalizar**:
   - Clique em **Deploy**.
   - Em menos de 2 minutos seu sistema estará online em um domínio próprio da Vercel (ex: `gestao-sidnei.vercel.app`), com conexão direta ao Firestore e sem nenhuma marca d'água!

---

### Método 2: Pelo Terminal (Vercel CLI)

Se você utiliza o terminal em sua máquina:
```bash
npm install -g vercel
vercel
```
Siga os passos na tela e quando solicitado insira a variável `GEMINI_API_KEY`.
