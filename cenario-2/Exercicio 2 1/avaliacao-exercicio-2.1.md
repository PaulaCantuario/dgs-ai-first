# Avaliação — Exercício 2.1
**Trilha de Certificação AI First — DGS / DB1 Global Software**
**Papel:** QA | **Cenário:** 2 — Estruturação do Trabalho | **Exercício:** 2.1 — Contribuição para o AGENTS.md: seção de Testing Standards

---

## Entregável 1 — Testing Standards (AGENTS.md)

### Resumo

O entregável está entre os mais completos que esse exercício pode produzir no nível Foundation. A seção Testing Standards é genuinamente prescritiva, com exemplos executáveis, nomenclatura correta de anti-patterns e cobertura de casos específicos do domínio RAG. O único ponto real de gap está na dimensão D5: o artefato não referencia as decisões do Cenário 1 (ADRs) e não ancora as regras de negócio em documentos do Anexo A/B do NovaTech — o que é esperado de um score 3 nessa dimensão.

### Scores por Dimensão

| Dimensão | Score | Justificativa |
|----------|-------|---------------|
| D1 — Domínio Conceitual | 3 | Demonstra domínio sólido de AGENTS.md como artefato machine-readable, não narrativo. Diferencia corretamente unitário vs integração por critério arquitetural (fronteiras de I/O), não por tamanho. Explica o porquê técnico de `onUnhandledRequest: 'error'`, de `satisfies` vs type assertion, e do risco específico de `vi.mock` vs msw. Não há confusão conceitual em nenhum ponto. |
| D2 — Uso de Ferramentas | 2 | Há evidência clara de uso do Claude com iteração documentada: a conversa registra uma v1, um pedido de ajuste (tradução + nova seção mustContain/mustNotContain), e uma v2 com mudanças concretas e não cosméticas. O que impede score 3 é a ausência de evidência de teste real com Copilot — o exercício pede que o artefato seja validado gerando testes com agente, avaliando o que foi seguido/ignorado. Essa evidência não está presente nos entregáveis. |
| D3 — Qualidade do Entregável | 3 | O AGENTS.md é prescritivo em todos os sentidos avaliáveis: usa imperativo ("DEVE", "NÃO DEVE", "FORBIDDEN"), traz exemplos ✅/❌ em TypeScript compilável, define sufixos de arquivo, estrutura de pastas, thresholds de cobertura em JSON, e termina com instrução direta para o agente. A tabela de anti-patterns da Seção 8 é diretamente acionável. A seção mustNotContain é a mais rara de aparecer em entregáveis desse exercício e está corretamente fundamentada. O teste reescrito demonstra cada padrão na prática com before/after e explicação. Os 3 critérios de review são objetivos e binários: dois revisores chegariam à mesma conclusão. |
| D4 — Pensamento Crítico | 3 | O entregável não aceita acriticamente a geração da IA: documenta o raciocínio de cada decisão técnica, aponta por que `vi.mock` para HTTP é uma armadilha mesmo sendo válido em outros contextos, e levanta o problema de testes que passam verde com respostas erradas ao usuário — que é o insight central do exercício. A seção mustNotContain foi incluída por iniciativa própria, com justificativa de negócio clara, não como adição decorativa. No checklist de review, o item "este teste falharia se a implementação tivesse um bug conhecido?" demonstra pensamento orientado a valor, não a cobertura. |
| D5 — Aplicabilidade ao Projeto | 2 | O artefato está conectado ao NovaTech: usa linguagem do domínio (RAG, chunks, grounding, embeddings, logistics), fixtures com dados realistas de contexto logístico brasileiro ("São Paulo", "zona rural", "Manaus" implícito nas perguntas ambíguas), e cenários de negócio relevantes (prazo desatualizado, leak de internals, perguntas fora de escopo). O que não aparece: referência às ADRs do Cenário 1, ao context budget definido na fase anterior, ou à estrutura de repositório do Anexo C. Sem essas âncoras, o artefato poderia ser de outro projeto com RAG — o que é o critério exato de score 2 na rubrica. |

**Score do entregável: 2.6**

### Verificação de Artefatos Machine-Readable

O AGENTS.md é prescritivo. Um agente de IA que lesse esse arquivo antes de gerar testes receberia instruções concretas sobre:

- Onde criar cada arquivo (estrutura de pastas explícita)
- Como nomear os testes (padrão `describe/it` com exemplos negativos e positivos)
- Quais matchers são proibidos (tabela de anti-patterns com motivo e alternativa)
- Como configurar o servidor msw (código copiável em `server.ts` e `handlers.ts`)
- O que validar além da existência (seção mustContain/mustNotContain com exemplos de regex)

**O que está bom:** a nota final direcionada explicitamente a agentes de IA é o tipo de instrução que realmente muda o output do Copilot — ela reformula o critério de sucesso de "o teste passa" para "o teste falha quando o sistema está errado". A tabela de anti-patterns é machine-readable: um agente pode varrer um teste gerado contra ela item por item.

**O que ainda é levemente narrativo:** a Seção 1 "Visão Geral" tem uma frase explicativa ("testes gerados por IA tendem a ser estruturalmente válidos, mas semanticamente fracos") que é valiosa para humanos mas não instrui o agente. Não é um problema — é uma escolha razoável de contexto — mas não contribui para a prescritibilidade.

### Pontos Fortes

1. **A seção mustContain/mustNotContain como cidadã de primeira classe.** Não é um adendo — tem seção própria (5), tabela de casos obrigatórios e exemplo completo com as três fases AAA. Isso é raro e correto: em sistemas RAG, a ausência de validação negativa é um bug de teste, não uma melhoria opcional.

2. **O critério de review "qual bug esse teste pega?"** É o teste mais eficaz que existe para avaliar utilidade de um caso de teste. Está presente no checklist e nos exemplos dos critérios, não apenas como conceito abstrato.

3. **Factories com override parcial + `satisfies` nas fixtures.** A combinação está correta arquiteturalmente: factory para dados dinâmicos com defaults sensatos, `satisfies` para fixtures estáticas que precisam preservar literais. Isso demonstra entendimento de TypeScript além do nível básico.

### Pontos de Melhoria

1. **Evidência de validação com agente real (D2).** O exercício pede que você use o Copilot (ou equivalente) para gerar um teste a partir do AGENTS.md e documente o que foi seguido, o que foi ignorado e o que precisou de iteração. Sem isso, você sabe que o artefato é bom para humanos, mas não tem evidência empírica de que é bom para agentes. **Ação concreta:** gere um teste usando o AGENTS.md como contexto de sistema, cole o output, avalie contra o checklist da Seção 8, e documente os gaps.

2. **Âncora nas ADRs e decisões do Cenário 1 (D5).** O artefato menciona Vitest, msw e GitHub Actions — decisões corretas do enunciado — mas não referencia de onde vieram essas decisões. **Ação concreta:** adicionar referências cruzadas às ADRs do Cenário 1 nas seções onde as decisões técnicas são mencionadas. Exemplo: `# Ver ADR-003 para justificativa da escolha de msw sobre interceptação de módulo`.

3. **Dados de teste mais ancorados no Anexo A/B do NovaTech (D5).** As fixtures usam dados logísticos plausíveis, mas as perguntas de referência do Anexo A (carga perigosa, SLA Gold, frete Manaus) não aparecem explicitamente. **Ação concreta:** adicionar `questions.dangerousCargoQuery`, `questions.goldSlaQuery` e `questions.manausDelivery` com as frases exatas ou equivalentes às do Anexo A.

### Classificação

**Aprovado com distinção (2.6)**

---

## Entregável 2 — Reescrita do Teste Ruim

### Resumo

O teste reescrito resolve o problema mais óbvio do original (assertion vaga) e demonstra entendimento de AAA e nomenclatura descritiva. Porém, tem duas lacunas técnicas concretas que o impedem de score 3: ausência de mock HTTP via msw e uso de `expect.any()` onde valores concretos seriam possíveis — o que o aproxima mais do padrão "assertions específicas" do que o AGENTS.md que o próprio participante escreveu exige.

### Scores por Dimensão

| Dimensão | Score | Justificativa |
|----------|-------|---------------|
| D1 — Domínio Conceitual | 3 | O diagnóstico do teste ruim é preciso e vai além do óbvio: não apenas nomeia o `toBeDefined()` como problema, mas articula a consequência — "ele não valida o requisito de negócio nem o contrato da API". Isso demonstra entendimento de que o problema é semântico, não sintático. |
| D2 — Uso de Ferramentas | 2 | Mesma situação do entregável anterior: há evidência de uso do Claude com iteração, mas sem evidência de validação com Copilot gerando o teste a partir dos padrões. |
| D3 — Qualidade do Entregável | 2 | O teste reescrito tem nome descritivo, AAA visível e assertions que verificam shape da resposta. O gap é concreto: (1) não usa msw — chama `handler` diretamente sem interceptação HTTP, contradizendo o padrão da Seção 6 do próprio AGENTS.md; (2) usa `expect.any(String)` e `expect.any(Number)` onde fixtures ou valores literais seriam mais específicos — o AGENTS.md diz explicitamente que isso é insuficiente quando valores concretos são conhecidos. |
| D4 — Pensamento Crítico | 2 | A explicação do before/after está correta mas fica na superfície: descreve o que mudou sem explicar o trade-off de cada escolha. Por exemplo, por que `toMatchObject` em vez de `toEqual`? Por que `expect.any(String)` para `documentName` em vez de usar uma fixture com valor concreto? Essas são perguntas que um revisor sênior faria, e respondê-las demonstraria o nível 3. |
| D5 — Aplicabilidade ao Projeto | 2 | A pergunta escolhida (`How many vacation days do employees receive?`) e o shape de resposta com `documentName`/`sections`/`page`/`url` são genéricos — poderiam ser de qualquer sistema de RH. Um teste aplicado ao NovaTech usaria dados logísticos, pergunta do Anexo A, e citaria `shipping-policy-2024.pdf` ou equivalente. |

**Score do entregável: 2.2**

### A lacuna técnica central — ausência de msw

Esse é o ponto mais importante para revisão. O teste reescrito faz:

```typescript
const result = await handler(event);
```

Sem nenhum setup de msw antes. Se `handler` chama qualquer API externa internamente (embedding, vector DB, LLM), esse teste ou vai bater na rede real ou vai falhar por timeout — exatamente o anti-pattern que a Seção 4 proíbe e que a Seção 6 resolve.

O teste corrigido precisaria de algo assim antes do `it`:

```typescript
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

E dentro do `it`, no Arrange:

```typescript
server.use(
  http.post('https://api.openai.com/v1/embeddings', () =>
    HttpResponse.json(fixtures.embedding.singleVector)
  )
);
```

Sem isso, o teste reescrito tem estrutura melhor que o original, mas compartilha o mesmo risco de instabilidade em CI.

### O segundo gap — `expect.any()` onde fixtures existem

O entregável criou fixtures completas no AGENTS.md (`chunks.ts`, `ragResponses.ts` com valores literais). O teste reescrito não as usa — constrói os dados inline com matchers genéricos:

```typescript
citation: {
  documentName: expect.any(String),   // qual documento? de qual política?
  sections: expect.arrayContaining([expect.any(String)]),
  page: expect.any(Number),
  url: expect.stringMatching(/^https?:\/\//)
}
```

Isso é melhor que `toBeDefined()`, mas o próprio AGENTS.md (Seção 4, anti-pattern "valores mágicos") diz: *"derive from fixtures"*. Se o handler está configurado com um mock msw que retorna um chunk específico, você sabe exatamente qual `documentName` deve aparecer. Não usar essa informação é deixar um bug de "documento errado" passar.

### Pontos Fortes

1. O diagnóstico do teste original é preciso — vai além de "assertion vaga" e nomeia a consequência de negócio.
2. A estrutura AAA está visível e os comentários são úteis.
3. `toMatchObject` é a escolha correta para verificar shape parcial sem acoplar ao formato completo.

### Pontos de Melhoria

1. **Adicionar setup de msw** ao redor do teste, alinhando com a Seção 6 do AGENTS.md produzido.
2. **Substituir `expect.any(String/Number)` por valores de fixtures** quando o mock msw determina o que será retornado.
3. **Usar dados do domínio NovaTech** — pergunta logística, documento de política de frete, não dados de RH genéricos.

### Classificação

**Aprovado (2.2)**

---

## Entregável 3 — Critérios de Code Review

### Resumo

Os critérios de review são o entregável mais forte dos três. São objetivos, binários, com exemplos de código executável que demonstram a diferença entre aprovado e rejeitado — e incluem "rejeição automática" explícita, o que torna a aplicação consistente entre revisores. O único ponto de atenção é que uma das regras de rejeição automática do Critério 3 tem risco de falso positivo por usar blocklist de substrings.

### Scores por Dimensão

| Dimensão | Score | Justificativa |
|----------|-------|---------------|
| D1 — Domínio Conceitual | 3 | Os três critérios atacam problemas distintos e reais: utilidade da assertion (Critério 1), isolamento de ambiente (Critério 2), coerência nome/corpo (Critério 3). Não são redundantes. O Critério 2 vai além do óbvio ao listar vetores específicos de dependência oculta: `process.env`, estado de módulo, dados de teste anterior — o que demonstra experiência real com flaky tests em CI. |
| D2 — Uso de Ferramentas | 2 | Mesma observação dos anteriores. |
| D3 — Qualidade do Entregável | 3 | Dois revisores aplicando esses critérios chegariam à mesma conclusão na quase totalidade dos casos. As seções "Rejeição automática" são particularmente valiosas: eliminam julgamento subjetivo para os casos mais comuns. Os exemplos ❌/✅ são completos — incluem setup de msw, factories, assertions específicas — não apenas ilustrativos. O checklist da seção superior funciona como resumo executável dos três critérios. |
| D4 — Pensamento Crítico | 3 | O Critério 1 tem o exercício mental mais valioso do documento: "mentalmente altere a implementação para um comportamento errado plausível e pergunte: esse teste pega isso?" Isso é mutation testing aplicado manualmente ao code review — uma técnica de nível sênior. O Critério 3 vai além do padrão pedido ao identificar uma falha na direção oposta: teste com escopo extrapolado (assertions que o nome não cobre). Isso demonstra que o participante pensou nos dois sentidos de inconsistência nome/corpo, não apenas no mais óbvio. |
| D5 — Aplicabilidade ao Projeto | 2 | Os exemplos usam `queryDocumentHandler`, `sla-policy-2024-q4.pdf`, `4 horas úteis` — dados do NovaTech. Porém, os critérios em si são genéricos o suficiente para qualquer projeto com testes automatizados. Para score 3, o checklist poderia referenciar explicitamente a Seção 8 do AGENTS.md e as regras de nomenclatura da Seção 2, fechando o loop com os padrões do projeto. |

**Score do entregável: 2.6**

### Ponto de atenção técnica no Critério 3

A rejeição automática lista:

> *Qualquer teste cujo nome contenha as palavras "works", "is correct", "handles it", "test"*

A regra é boa, mas `"is correct"` como string de busca vai dar falso positivo em nomes legítimos como `"returns the correct citation source"`. A intenção é correta — barrar nomes vagos — mas a implementação como blocklist de substrings tem colisão com nomes descritivos válidos.

Uma regra mais robusta seria positiva e verificável: *"o nome deve seguir o padrão `[unidade] > [cenário] > [resultado observável]` — rejeitar se não for possível identificar os três elementos"*.

### Pontos Fortes

1. As seções "Rejeição automática" eliminam subjetividade para os casos mais comuns — é o detalhe que separa um checklist usável de um aspiracional.
2. O exercício mental do Critério 1 ("qual bug esse teste pega?") é mutation testing aplicado ao code review — técnica de nível sênior usada corretamente.
3. O Critério 3 identifica inconsistência nome/corpo nos dois sentidos (escopo faltando e escopo extrapolado), não apenas no mais óbvio.

### Pontos de Melhoria

1. **Corrigir a blocklist de substrings no Critério 3** para uma regra positiva baseada no padrão `describe/it` do AGENTS.md.
2. **Referenciar explicitamente as seções do AGENTS.md** no checklist — isso fecha o loop entre os dois artefatos e evita que evoluam em direções divergentes.
3. **Adicionar critério para mustNotContain** — dado que o participante criou uma seção inteira sobre isso no AGENTS.md, um critério de review correspondente tornaria o conjunto coeso. Exemplo: *"Testes RAG que cobrem perguntas fora de escopo ou falhas de serviço externo devem ter pelo menos uma assertion negativa (`not.toMatch`)."*

### Classificação

**Aprovado com distinção (2.6)**

---

## Visão Consolidada — Exercício 2.1

| Entregável | Score | Classificação |
|---|---|---|
| Testing Standards (AGENTS.md) | 2.6 | Aprovado com distinção |
| Reescrita do teste | 2.2 | Aprovado |
| Critérios de code review | 2.6 | Aprovado com distinção |
| **Média do exercício 2.1** | **2.5** | **Aprovado com distinção** |

### Padrão de execução

O pensamento crítico e a qualidade conceitual são consistentemente os pontos fortes nos três entregáveis. O gap recorrente é a ausência de validação empírica com agente real (D2) e o descolamento parcial das decisões do Cenário 1 (D5). Nenhum dos dois é suficiente para derrubar a classificação — mas são exatamente o que diferencia um 2.5 de um 3.0 consistente.

### Tópicos da Trilha para Reforço

Score ≥ 2.5 — não há refazer obrigatório. Para chegar a 3.0 consistente em exercícios futuros:

- **AGENTS.md + ADRs (rastreabilidade entre artefatos):** como um AGENTS.md referencia decisões arquiteturais formalizadas de fases anteriores — o artefato de padrões não existe no vácuo.
- **Aplicação de Skills com validação empírica:** a diferença entre "escrevi um bom AGENTS.md" e "provei que esse AGENTS.md melhora o output do agente" é o D2 que ficou em 2. Essa validação empírica é o core do exercício de Skills.
