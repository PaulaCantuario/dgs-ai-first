# Avaliação do Exercício 2.3
> **Programa:** Trilha de Certificação AI First — DGS / DB1 Global Software
> **Papel:** QA
> **Cenário:** 2 — Estruturação do Trabalho
> **Exercício:** 2.3 — Definição de skill de geração de testes

---

## Resumo

O entregável demonstra domínio sólido do conceito de skill como artefato prescritivo para agentes, com anti-padrões reais e específicos ao domínio NovaTech. O uso do Claude Cowork para gerar o checklist foi bem documentado nas conversas e o resultado é objetivamente verificável. O principal gap está na ausência de evidência de iteração substantiva entre versões da skill — a conversa 3 mostra uma iteração (remoção do checklist + adição de seção de domínio), mas a mudança, embora relevante, foi motivada por instrução direta do participante, não por análise crítica autônoma de limitações da v1.

---

## Scores por Dimensão

| Dimensão | Score | Justificativa |
|----------|-------|---------------|
| D1 — Domínio Conceitual | 3 | A skill demonstra compreensão clara do conceito: tem frase-ativação, template com placeholders reais, exemplos DO/DON'T completos, anti-padrões específicos de LLMs (vi.mock vs server.use, toBeDefined como assertion principal, dados inline), e declaração de dependências. O participante entende que skills são artefatos consumidos por agentes, não documentação narrativa. |
| D2 — Uso de Ferramentas | 2 | Há evidência real de uso do Claude (chat) e do Claude Cowork — as conversas documentam o fluxo. A iteração na skill aconteceu (checklist removido, seção de domínio adicionada, filosofia de cobertura inserida). Porém a iteração foi dirigida por instrução explícita do participante, não por avaliação autônoma do output da v1. A skill de avaliação pede evidência de que o participante identificou o que o agente seguiu ou ignorou — isso não está documentado. |
| D3 — Qualidade do Entregável | 3 | A SKILL.md é prescritiva: placeholders forçam substituição consciente, o exemplo DON'T é anotado linha a linha com diagnóstico, e o template tem estrutura de três dimensões (mustHave/mustContain/mustNotContain) que um agente pode seguir mecanicamente. O checklist em .md tem 23 itens binários objetivos, verificáveis sem interpretação. O .html adiciona automação por regex com mecanismo de discordância humana — acima do exigido. |
| D4 — Pensamento Crítico | 2 | A decisão de colocar dependências antes do template (com justificativa de que agente sem contexto usa dados genéricos) é um ponto de análise genuíno. A distinção vi.mock vs msw como anti-padrão dedicado, com argumento de que "você está testando que seu código chama a função mockada, não a fronteira real", demonstra pensamento além do óbvio. O que falta: o participante não documenta explicitamente o que a v1 da skill teria gerado de errado se usada por um agente — não há teste real do artefato como input para um Copilot e análise do output. |
| D5 — Aplicabilidade ao Projeto | 3 | Profundamente conectado ao NovaTech: perguntas `questions.deliveryTime`, `questions.outOfScope`, documentos `shipping-policy-2024.pdf`, `compliance-manual-v3.pdf`, SLAs "3 to 5 business days" vs "7 to 10 business days", `groundingConfidence`, `upstream_unavailable` — tudo é linguagem ubíqua do domínio. O checklist e os arquivos de teste simulado reforçam a conexão. Os TC-INT-007/009/011/014 rastreiam para o plano de testes. |

**Score do exercício: 2.6**

---

## Verificação de Artefatos Machine-Readable

A skill é prescritiva. Exemplos do que funciona bem para um agente:

- A seção de dependências lista arquivos concretos a ler antes de gerar qualquer código — evita o principal vetor de dados genéricos.
- Os placeholders `[AZURE_OPENAI_EMBEDDINGS_URL]`, `[FIXTURE_KEY]`, `[TC-INT-ID]` são insubstituíveis sem contexto real do projeto.
- O exemplo DON'T com anotação `❌` linha a linha permite que um agente identifique o padrão problemático e saiba exatamente onde está o problema.
- A tabela de regras de negócio com colunas "assertir" e "rejeitar" é diretamente consumível como instrução.

O único trecho que se aproxima de narrativo é a seção "Cobertura vs. proteção de conteúdo" — o argumento filosófico é bem construído para humanos, mas poderia ser mais diretivo para agentes com uma regra explícita do tipo:

```
DEVE: para toda assertion de body.answer, incluir pelo menos um not.toMatch para política desatualizada.
```

---

## Pontos Fortes

1. **Anti-padrões específicos de IA, não genéricos.** A distinção entre vi.mock e server.use, com argumento de por que vi.mock passa no CI mas não testa a fronteira real, é exatamente o tipo de coisa que LLMs geram de errado e que skills precisam bloquear explicitamente.

2. **Arquivos de teste simulado como prova de conceito.** O `queryHandler.bom.integration.test.ts` e o `queryHandler.ruim.integration.test.ts` com cada violação anotada pelo ID do checklist transforma o entregável em algo testável — outro QA pode executar os dois arquivos no avaliador HTML e verificar que os critérios funcionam.

3. **Checklist com duas camadas complementares.** O .md serve agentes IA (critérios binários, padrões exatos a procurar), o .html serve revisores humanos com automação por regex e mecanismo de discordância — o mesmo critério operando em dois contextos diferentes sem contradição.

---

## Pontos de Melhoria

1. **Documentar o que o agente ignorou na v1.** O exercício pede evidência de que o participante avaliou o output gerado — não apenas que iterou. Uma seção curta no entregável descrevendo "a v1 da skill gerou este teste como exemplo: [trecho], que violava os itens X e Y porque..." fecharia o gap de D2 e D4 simultaneamente.

2. **Tornar a seção de filosofia de cobertura mais prescritiva.** O argumento sobre "estrutura correta, conteúdo errado" é o insight mais valioso da skill. Ele deveria terminar com uma regra explícita para o agente — por exemplo:
   ```
   REGRA: toda suite com cenário de happy path DEVE conter pelo menos um not.toMatch
   para dado de negócio desatualizado.
   ```
   Em vez de ficar no nível de explicação.

3. **Declarar explicitamente a consistência com Testing Standards.** A skill é consistente com os padrões do exercício 2.1, mas não referencia o `AGENTS.md` pelo nome nem diz onde a skill se encaixa na hierarquia de artefatos do projeto. Um agente que lê a skill isoladamente não sabe que ela é subordinada ao Testing Standards — isso deveria estar nas dependências.

---

## Classificação

**✅ Aprovado com distinção (2.6)**

---

## Tópicos da Trilha para Reforço

Score acima de 2.5 — nenhum tópico obrigatório.

**Sugestão opcional:** revisar a seção de **evidência de uso de ferramenta** nos critérios de D2 — especificamente o que conta como "avaliação real do output" versus "iteração por instrução". A diferença importa quando o exercício muda para um contexto onde o participante não pode dirigir a iteração manualmente.
